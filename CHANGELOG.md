# Changelog

All notable changes to AI Forecast Calendar are documented here.

## Unreleased

### Reconciled

- Replaced conflicting README sections with one account of the canonical data, static build, ingestion, testing, GitHub Pages deployment, and post-deployment verification workflows.
- Superseded the Eleventy proposal with the dependency-free Node.js architecture and removed alternative-host deployment configuration and obsolete generated/compatibility data.
- Established `data/forecasts/` plus `data/forecast.schema.json` as the sole canonical record set and schema.
- Consolidated AI 2027 into one reviewed 24-milestone record, retaining both dated long-range Race and Slowdown branches and stable compatible milestone IDs.
- Standardized event identity as `<forecast-id>.<milestone-id>@ai-forecast-calendar` and feed locations as `/calendars/<forecast-id>.ics`.

### Corrected

- Corrected the opening AI 2027 source wording from “Mid-2025” to “Summer 2025” and normalized its representative anchor to 2025-07-15. Preserved “early” year references at February 15, month-only dates on the 15th, and year-only dates on July 1 while retaining the original source timing and precision.
- Corrected the documented production origin to `https://forecastcalendar.org/` and recorded the 2026-08-09 production desktop/download and Apple Calendar subscription acceptance results, without treating subscription as file-import or refresh-propagation evidence.

### Added

- Added deterministic static site and iCalendar generation from validated canonical forecast data.
- Added offline schema, iCalendar structure, determinism, Python ingestion, module, and production-artifact checks under the single `npm run check` gate.
- Added a post-deployment HTTP smoke test that verifies the live `.ics` response media type, plus explicit manual browser, mobile, accessibility, download, subscription, and calendar-provider procedures.
