import json
import tempfile
import unittest
from pathlib import Path

from scripts.ai2027_ingest import extract_candidates, main, write_json
from scripts.validate_forecast import ValidationError, validate_forecast

ROOT = Path(__file__).parent
SOURCE = "https://ai-2027.com/"


def valid_document():
    return {
        "id": "ai-2027",
        "title": "AI 2027",
        "source_url": SOURCE,
        "milestones": [
            {
                "id": "agent-2",
                "title": "Agent-2",
                "calendar_date": "2027-01-15",
                "date_precision": "month",
                "source_timing": "January 2027",
                "source_url": f"{SOURCE}#early-2027",
                "source_anchor": "early-2027",
                "supporting_context": "In January 2027, Agent-2 improves.",
            }
        ],
    }


class ValidationTests(unittest.TestCase):
    def test_malformed_records_are_rejected(self):
        document = valid_document()
        document["milestones"][0]["calendar_date"] = "2027-02-30"
        document["milestones"][0].pop("source_url")
        with self.assertRaises(ValidationError) as raised:
            validate_forecast(document)
        self.assertIn("invalid ISO", str(raised.exception))
        self.assertIn("missing source_url", str(raised.exception))

    def test_duplicate_and_missing_identities_are_rejected(self):
        document = valid_document()
        document["milestones"].append(dict(document["milestones"][0]))
        with self.assertRaisesRegex(ValidationError, "duplicate milestone id"):
            validate_forecast(document)
        document["milestones"] = [{**document["milestones"][0], "id": ""}]
        with self.assertRaisesRegex(ValidationError, "missing stable id"):
            validate_forecast(document)

    def test_approximate_date_requires_original_timing(self):
        document = valid_document()
        document["milestones"][0]["source_timing"] = ""
        with self.assertRaisesRegex(ValidationError, "approximate date missing source_timing"):
            validate_forecast(document)


class IngestionTests(unittest.TestCase):
    def test_output_is_deterministic_and_preserves_provenance(self):
        html = (ROOT / "fixtures/ai2027_excerpt.html").read_text()
        first = extract_candidates(SOURCE, html)
        second = extract_candidates(SOURCE, html)
        self.assertEqual(json.dumps(first, sort_keys=True), json.dumps(second, sort_keys=True))
        self.assertEqual(first["milestones"][0]["source_anchor"], "early-2027")
        self.assertIn("January 2027", first["milestones"][0]["supporting_context"])
        self.assertEqual(first["milestones"][0]["source_url"], f"{SOURCE}#early-2027")

    def test_promotion_never_overwrites_canonical_data(self):
        with tempfile.TemporaryDirectory() as directory:
            candidate = Path(directory) / "candidate.json"
            canonical = Path(directory) / "canonical.json"
            write_json(valid_document(), candidate)
            canonical.write_text('{"editorial":"correction"}\n')
            self.assertEqual(main(["promote", str(candidate), str(canonical)]), 1)
            self.assertEqual(canonical.read_text(), '{"editorial":"correction"}\n')


if __name__ == "__main__":
    unittest.main()
