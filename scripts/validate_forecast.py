"""Validation for candidate and canonical forecast JSON records."""

from __future__ import annotations

from datetime import date
from urllib.parse import urlparse

PRECISIONS = {"exact", "month", "year", "range", "ambiguous"}


class ValidationError(ValueError):
    pass


def validate_forecast(document: dict) -> None:
    errors: list[str] = []
    if not isinstance(document, dict):
        raise ValidationError("document must be an object")
    for field in ("id", "title", "source_url", "milestones"):
        if not document.get(field):
            errors.append(f"missing forecast {field}")
    _check_url(document.get("source_url"), "forecast source_url", errors)
    milestones = document.get("milestones", [])
    if not isinstance(milestones, list):
        errors.append("milestones must be an array")
        milestones = []
    seen: set[str] = set()
    for index, item in enumerate(milestones):
        label = f"milestones[{index}]"
        if not isinstance(item, dict):
            errors.append(f"{label} must be an object")
            continue
        stable_id = item.get("id")
        if not stable_id:
            errors.append(f"{label} missing stable id")
        elif stable_id in seen:
            errors.append(f"duplicate milestone id: {stable_id}")
        else:
            seen.add(stable_id)
        for field in ("title", "calendar_date", "date_precision", "source_url", "source_anchor", "supporting_context"):
            if not item.get(field):
                errors.append(f"{label} missing {field}")
        _check_url(item.get("source_url"), f"{label} source_url", errors)
        try:
            parsed = date.fromisoformat(item.get("calendar_date", ""))
            if parsed.isoformat() != item.get("calendar_date"):
                raise ValueError
        except (TypeError, ValueError):
            errors.append(f"{label} has invalid ISO calendar_date")
        precision = item.get("date_precision")
        if precision not in PRECISIONS:
            errors.append(f"{label} has invalid date_precision")
        if precision != "exact" and not item.get("source_timing"):
            errors.append(f"{label} approximate date missing source_timing")
    if errors:
        raise ValidationError("; ".join(errors))


def _check_url(value: object, label: str, errors: list[str]) -> None:
    parsed = urlparse(value) if isinstance(value, str) else None
    if not parsed or parsed.scheme not in {"http", "https"} or not parsed.netloc:
        errors.append(f"{label} must be an absolute HTTP(S) URL")
