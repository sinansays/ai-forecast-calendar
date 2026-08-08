import unittest

from scripts.date_normalization import normalize_timing


class DateNormalizationTests(unittest.TestCase):
    def test_supported_precisions_and_boundaries(self):
        cases = {
            "February 29, 2028": ("2028-02-29", "exact"),
            "February 2027": ("2027-02-15", "month"),
            "2027": ("2027-07-01", "year"),
            "January 1, 2027 - January 2, 2027": ("2027-01-01", "range"),
            "January 2027–March 2027": ("2027-02-14", "range"),
        }
        for timing, expected in cases.items():
            with self.subTest(timing=timing):
                result = normalize_timing(timing)
                self.assertEqual((result.calendar_date, result.date_precision), expected)

    def test_invalid_exact_date_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "invalid timing date"):
            normalize_timing("February 29, 2027")

    def test_ambiguous_prose_requires_review(self):
        with self.assertRaisesRegex(ValueError, "ambiguous timing"):
            normalize_timing("by the end of the following winter")
        result = normalize_timing(
            "by the end of the following winter", manual_date="2028-02-15", reviewed=True
        )
        self.assertEqual(result.date_precision, "ambiguous")
        self.assertEqual(result.calendar_date, "2028-02-15")


if __name__ == "__main__":
    unittest.main()
