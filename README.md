# AI Forecast Calendar

AI Forecast Calendar publishes reviewed milestones from external AI scenarios as a static website and deterministic iCalendar feeds. It is a presentation and distribution project, not an endorsement or a prediction-resolution service.

## Architecture and canonical data

There is one production architecture: the dependency-free Node.js builder in [`scripts/build.mjs`](scripts/build.mjs) reads the reviewed JSON records in [`data/forecasts/`](data/forecasts/), validates them with [`data/forecast.schema.json`](data/forecast.schema.json) and [`src/forecast-calendar.js`](src/forecast-calendar.js), renders [`site/index.html`](site/index.html), copies [`site/styles.css`](site/styles.css), and writes disposable artifacts to `dist/`.

`data/forecasts/` is the only canonical data location. Candidate extraction files belong in [`data/candidates/`](data/candidates/) and never feed the build. Generated files in `dist/` must not be edited or committed.

The build produces:

- `dist/index.html` and `dist/styles.css`;
- `dist/calendars/index.json`, a generated discovery manifest; and
- `dist/calendars/<forecast-id>.ics`, one stable feed per canonical forecast.

Forecast and milestone IDs are permanent slugs. An event UID is `<forecast-id>.<milestone-id>@ai-forecast-calendar`; neither array order nor build time affects identity. Source timing remains separate from its normalized calendar date.

## Build and test

Install Node.js 20 or newer and Python 3. No third-party runtime or Python packages are required.

```sh
npm run build
npm test
npm run check
```

`npm run build` validates all canonical records and regenerates `dist/`. `npm test` runs the JavaScript tests. `npm run check` is the authoritative pre-deployment command: it runs JavaScript and Python tests, checks maintained module syntax/imports, validates canonical data, performs a clean build, and validates the generated AI 2027 feed. The command is offline and is the required local and CI gate.

## AI 2027 ingestion workflow

[`scripts/ai2027_ingest.py`](scripts/ai2027_ingest.py) is deliberately source-specific; it is not a general scraper.

1. **Extract.** Run the `extract` subcommand with the explicit AI 2027 HTTPS source URL, an optional saved HTML input, and a candidate output under `data/candidates/`. The extractor records the input digest, source section and anchor, original timing words, supporting passage, and URL. Without an input file it retrieves the supplied URL.
2. **Review.** Compare every candidate with the linked source. Merge passages describing one conceptual milestone, assign permanent IDs, and correct titles and context. Exact dates stay exact; month-only dates use the 15th; year-only dates use July 1; ranges use their midpoint (the earlier date for a half-day tie); ambiguous prose requires an explicitly reviewed manual ISO date. Never replace the original `source_timing` text.
3. **Validate.** Run `python -m scripts.ai2027_ingest validate` with the candidate filename, then run `npm run check` after canonical promotion.
4. **Promote.** Run the `promote` subcommand with the reviewed candidate and [`data/forecasts/ai-2027.json`](data/forecasts/ai-2027.json). Promotion validates the candidate and refuses to overwrite canonical data. Canonical corrections must instead be reviewed direct edits recorded in [`CHANGELOG.md`](CHANGELOG.md).

The complete CLI syntax is available with:

```sh
python -m scripts.ai2027_ingest --help
python -m scripts.ai2027_ingest extract --help
python -m scripts.ai2027_ingest validate --help
python -m scripts.ai2027_ingest promote --help
```

## Deployment

GitHub Pages is the sole hosting target. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs `npm run check`, uploads `dist/`, and deploys it on pushes to `main` or a manual dispatch. Enable **GitHub Actions** as the Pages source and configure the production custom domain before advertising subscriptions. The domain root must expose `/calendars/ai-2027.ics`; that path is a permanent public contract.

The workflow runs the HTTP smoke test against the deployed Pages URL after deployment. It fetches both the page and feed and requires the live feed response—not a host-specific configuration file—to report a `Content-Type` containing `text/calendar`. Run the same verification against the production custom domain after DNS changes:

```sh
npm run smoke -- https://ai-forecast-calendar.org
```

Do not infer deployment success from a local build. Do not record Apple Calendar or Google Calendar success from automated checks. After a successful production deployment, complete the browser, physical-mobile, accessibility, download, subscription, and provider checks in [`docs/manual-verification.md`](docs/manual-verification.md) and [`docs/provider-testing.md`](docs/provider-testing.md), recording dates, versions, testers, and observations only for tests actually performed.

## Download versus subscription

Downloading and importing `/calendars/ai-2027.ics` creates a snapshot that will not receive corrections. Subscribing to that same absolute production URL lets the provider periodically fetch updates. Repeated imports commonly duplicate events, and provider refresh schedules are outside this project's control.

See [`SPEC.md`](SPEC.md) for product requirements and [`DECISIONS.md`](DECISIONS.md) for durable architecture and publishing decisions.
