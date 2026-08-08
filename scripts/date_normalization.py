"""Deterministic conversion of source timing text to calendar dates."""

from __future__ import annotations

import calendar
import re
from dataclasses import dataclass
from datetime import date

MONTHS = {name.lower(): number for number, name in enumerate(calendar.month_name) if name}
MONTH_PATTERN = "|".join(calendar.month_name[1:])


@dataclass(frozen=True)
class NormalizedDate:
    calendar_date: str
    date_precision: str
    source_timing: str
    normalization_note: str


def _date(year: int, month: int, day: int) -> date:
    try:
        return date(year, month, day)
    except ValueError as exc:
        raise ValueError(f"invalid timing date: {exc}") from exc


def normalize_timing(
    source_timing: str, *, manual_date: str | None = None, reviewed: bool = False
) -> NormalizedDate:
    """Normalize supported timing forms; ambiguous prose requires reviewed input."""
    timing = " ".join(source_timing.split())
    if not timing:
        raise ValueError("source timing must not be empty")

    exact = re.fullmatch(rf"({MONTH_PATTERN}) (\d{{1,2}}), (\d{{4}})", timing, re.I)
    if exact:
        value = _date(int(exact[3]), MONTHS[exact[1].lower()], int(exact[2]))
        return NormalizedDate(value.isoformat(), "exact", timing, "Source gives an exact date.")

    iso = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", timing)
    if iso:
        value = _date(*(int(part) for part in iso.groups()))
        return NormalizedDate(value.isoformat(), "exact", timing, "Source gives an exact date.")

    month = re.fullmatch(rf"({MONTH_PATTERN}) (\d{{4}})", timing, re.I)
    if month:
        value = _date(int(month[2]), MONTHS[month[1].lower()], 15)
        return NormalizedDate(value.isoformat(), "month", timing, "Month-only timing uses the 15th.")

    year = re.fullmatch(r"(\d{4})", timing)
    if year:
        value = date(int(year[1]), 7, 1)
        return NormalizedDate(value.isoformat(), "year", timing, "Year-only timing uses July 1.")

    date_range = re.fullmatch(
        rf"({MONTH_PATTERN}) (\d{{1,2}}), (\d{{4}})\s*[–—-]\s*({MONTH_PATTERN}) (\d{{1,2}}), (\d{{4}})",
        timing,
        re.I,
    )
    if date_range:
        start = _date(int(date_range[3]), MONTHS[date_range[1].lower()], int(date_range[2]))
        end = _date(int(date_range[6]), MONTHS[date_range[4].lower()], int(date_range[5]))
        if end < start:
            raise ValueError("timing range ends before it starts")
        midpoint = start + (end - start) / 2
        return NormalizedDate(midpoint.isoformat(), "range", timing, "Date range uses its midpoint.")

    month_range = re.fullmatch(
        rf"({MONTH_PATTERN}) (\d{{4}})\s*[–—-]\s*({MONTH_PATTERN}) (\d{{4}})", timing, re.I
    )
    if month_range:
        start = date(int(month_range[2]), MONTHS[month_range[1].lower()], 1)
        end_month = MONTHS[month_range[3].lower()]
        end = date(int(month_range[4]), end_month, calendar.monthrange(int(month_range[4]), end_month)[1])
        if end < start:
            raise ValueError("timing range ends before it starts")
        midpoint = start + (end - start) / 2
        return NormalizedDate(midpoint.isoformat(), "range", timing, "Month range uses its midpoint.")

    if not (manual_date and reviewed):
        raise ValueError("ambiguous timing requires manual_date and reviewed=True")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", manual_date):
        raise ValueError("manual date must be an ISO date")
    value = _date(*(int(part) for part in manual_date.split("-")))
    return NormalizedDate(value.isoformat(), "ambiguous", timing, "Calendar date was manually reviewed from prose.")
