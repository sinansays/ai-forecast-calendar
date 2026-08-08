#!/usr/bin/env python3
"""Focused, review-first ingestion utility for the published AI 2027 timeline."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urldefrag, urljoin, urlparse
from urllib.request import Request, urlopen

from scripts.date_normalization import normalize_timing
from scripts.validate_forecast import ValidationError, validate_forecast

DEFAULT_SOURCE = "https://ai-2027.com/"
TIMING = re.compile(
    r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)"
    r"(?:\s+\d{1,2},)?\s+20\d{2}(?:\s*[–—-]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+\d{1,2},)?\s+20\d{2})?\b"
    r"|\b20\d{2}\b",
    re.I,
)


class AI2027Parser(HTMLParser):
    """Extract heading and paragraph text without pretending to be a generic scraper."""

    def __init__(self) -> None:
        super().__init__()
        self.heading = "AI 2027"
        self.anchor = ""
        self._tag: str | None = None
        self._attrs: dict[str, str] = {}
        self._text: list[str] = []
        self.passages: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"h1", "h2", "h3", "p", "li"}:
            self._tag, self._attrs, self._text = tag, {k: v or "" for k, v in attrs}, []

    def handle_data(self, data: str) -> None:
        if self._tag:
            self._text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag != self._tag:
            return
        text = " ".join("".join(self._text).split())
        if tag.startswith("h") and text:
            self.heading = text
            self.anchor = self._attrs.get("id", "") or _slug(text)
        elif tag in {"p", "li"} and text:
            self.passages.append((self.heading, self.anchor, text))
        self._tag, self._attrs, self._text = None, {}, []


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def extract_candidates(source_url: str, html: str) -> dict:
    parsed_url = urlparse(source_url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        raise ValueError("--source-url must be an absolute HTTP(S) URL")
    parser = AI2027Parser()
    parser.feed(html)
    milestones = []
    used_ids: set[str] = set()
    for section, anchor, context in parser.passages:
        match = TIMING.search(context)
        if not match:
            continue
        source_timing = match.group(0)
        try:
            normalized = normalize_timing(source_timing)
        except ValueError:
            # Complex prose belongs in explicit manual review, not silent guessing.
            continue
        title = section if section != "AI 2027" else context.split(".", 1)[0][:100]
        base_id = _slug(f"{normalized.calendar_date}-{title}") or "milestone"
        stable_id = base_id
        if stable_id in used_ids:
            suffix = hashlib.sha256(context.encode()).hexdigest()[:8]
            stable_id = f"{base_id}-{suffix}"
        used_ids.add(stable_id)
        _, fragment = urldefrag(source_url)
        effective_anchor = anchor or fragment
        provenance_url = urljoin(source_url, f"#{effective_anchor}") if effective_anchor else source_url
        milestones.append(
            {
                "id": stable_id,
                "title": title,
                "source_timing": normalized.source_timing,
                "calendar_date": normalized.calendar_date,
                "date_precision": normalized.date_precision,
                "normalization_note": normalized.normalization_note,
                "source_url": provenance_url,
                "source_anchor": effective_anchor or "document",
                "source_section": section,
                "supporting_context": context,
            }
        )
    milestones.sort(key=lambda item: (item["calendar_date"], item["id"]))
    return {
        "id": "ai-2027",
        "title": "AI 2027",
        "source_url": source_url,
        "input_sha256": hashlib.sha256(html.encode()).hexdigest(),
        "status": "candidate",
        "milestones": milestones,
    }


def retrieve(source_url: str, input_path: Path | None) -> str:
    if input_path:
        return input_path.read_text(encoding="utf-8")
    request = Request(source_url, headers={"User-Agent": "ai-forecast-calendar-ingestion/1"})
    with urlopen(request, timeout=30) as response:  # noqa: S310 - explicit operator URL
        return response.read().decode(response.headers.get_content_charset() or "utf-8")


def write_json(document: dict, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(document, indent=2, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    extract = commands.add_parser("extract", help="retrieve/parse AI 2027 into candidate JSON")
    extract.add_argument("--source-url", required=True, help=f"explicit source URL (normally {DEFAULT_SOURCE})")
    extract.add_argument("--input", type=Path, help="saved HTML input; otherwise retrieve --source-url")
    extract.add_argument("--output", type=Path, required=True, help="candidate output path")
    validate = commands.add_parser("validate", help="validate candidate or canonical JSON")
    validate.add_argument("path", type=Path)
    promote = commands.add_parser("promote", help="copy reviewed candidate to a new canonical path")
    promote.add_argument("candidate", type=Path)
    promote.add_argument("canonical", type=Path)
    args = parser.parse_args(argv)
    try:
        if args.command == "extract":
            document = extract_candidates(args.source_url, retrieve(args.source_url, args.input))
            validate_forecast(document)
            write_json(document, args.output)
        elif args.command == "validate":
            validate_forecast(json.loads(args.path.read_text(encoding="utf-8")))
        else:
            if args.canonical.exists():
                raise ValueError(f"refusing to overwrite canonical data: {args.canonical}")
            document = json.loads(args.candidate.read_text(encoding="utf-8"))
            validate_forecast(document)
            document["status"] = "canonical"
            args.canonical.parent.mkdir(parents=True, exist_ok=True)
            write_json(document, args.canonical)
    except (OSError, ValueError, json.JSONDecodeError, ValidationError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
