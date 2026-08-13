# AI Forecast Calendar

AI Forecast Calendar publishes reviewed milestones from external AI scenarios as a static website and deterministic iCalendar feeds. It is a presentation and distribution project, not an endorsement or a prediction-resolution service.

## Architecture and canonical data

There is one production architecture: the dependency-free Node.js builder in [`scripts/build.mjs`](scripts/build.mjs) reads the reviewed JSON records in [`data/forecasts/`](data/forecasts/), validates them with [`data/forecast.schema.json`](data/forecast.schema.json) and [`src/forecast-calendar.js`](src/forecast-calendar.js), renders [`site/index.html`](site/index.html), copies [`site/styles.css`](site/styles.css), and writes disposable artifacts to `dist/`.

`data/forecasts/` is the only canonical data location. Candidate extraction files belong in [`data/candidates/`](data/candidates/) and never feed the build. Generated files in `dist/` must not be edited or committed.

The build produces:

- `dist/index.html` and `dist/styles.css`;
- `dist/calendars/index.json`, a generated discovery manifest; and
- `dist/calendars/<forecast-id>.ics`, one stable feed per canonical forecast.

The reviewed collection currently includes AI 2027, *AI 2040: Plan A*, *Situational Awareness*, the Grace et al. 2023 expert survey, and Peter Wildeford's AGI Timelines Model. Source qualification, editorial scope, and material caveats are recorded in [`docs/source-reviews.md`](docs/source-reviews.md).

Forecast and milestone IDs are permanent slugs. An event UID is `<forecast-id>.<milestone-id>@ai-forecast-calendar`; neither array order nor build time affects identity. Source timing remains separate from its normalized calendar date.

## Build and test

Install Node.js 24 or newer and Python 3. No third-party runtime or Python packages are required.

```sh
npm run build
npm test
npm run check
```

`npm run build` validates all canonical records and regenerates `dist/`. `npm test` runs the JavaScript tests. `npm run check` is the authoritative pre-deployment command: it runs JavaScript and Python tests, checks maintained module syntax/imports, validates canonical data, performs a clean build, and validates every generated forecast feed. The command is offline and is the required local and CI gate.

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

For sources other than AI 2027, follow the source-independent qualification, extraction, review, normalization, validation, and publication process in [`docs/adding-a-forecast.md`](docs/adding-a-forecast.md). New adapters may remain source-specific, but every calendar must pass the same provenance and fidelity review.

## Deployment

Source is hosted on GitHub and production is hosted by Cloudflare Workers. Cloudflare's Git integration automatically builds and deploys the site after a merge to `main`; GitHub Pages is not used and does not need to be enabled. [`.github/workflows/check.yml`](.github/workflows/check.yml) is CI only: it runs the authoritative `npm run check` gate but does not deploy the site.

The Cloudflare Workers project must use `npm run build` as its build command, `npx wrangler deploy` as its deploy command, and `npx wrangler versions upload` as its version command. [`wrangler.jsonc`](wrangler.jsonc) configures `dist/` as the static asset directory for both Wrangler commands. The production domain root must expose `/calendars/ai-2027.ics`; that path is a permanent public contract. Repository credentials and project/domain settings are managed in Cloudflare rather than in this repository.

After Cloudflare reports a successful deployment, run the HTTP smoke test against the production custom domain. It fetches both the page and feed and requires the live feed response—not a host-specific configuration file—to report a `Content-Type` containing `text/calendar`:

```sh
npm run smoke -- https://forecastcalendar.org
```

The forecast schema retains its original `$id`, `https://ai-forecast-calendar.org/schemas/forecast.json`, as a stable identifier because it has already been published in the repository. It identifies the schema; it is not a live production page or the canonical site origin.

Do not infer deployment success from a local build. Do not record Apple Calendar or Google Calendar success from automated checks. After a successful production deployment, complete the browser, physical-mobile, accessibility, download, subscription, and provider checks in [`docs/manual-verification.md`](docs/manual-verification.md) and [`docs/provider-testing.md`](docs/provider-testing.md), recording dates, versions, testers, and observations only for tests actually performed.

## Download versus subscription

Downloading and importing `/calendars/ai-2027.ics` creates a snapshot that will not receive corrections. Subscribing to that same absolute production URL lets the provider periodically fetch updates. Repeated imports commonly duplicate events, and provider refresh schedules are outside this project's control.

See [`SPEC.md`](SPEC.md) for product requirements and [`DECISIONS.md`](DECISIONS.md) for durable architecture and publishing decisions.
The current implementation-versus-specification audit, including the remaining V0 acceptance work, is tracked in [`docs/v0-status-audit.md`](docs/v0-status-audit.md).
