# AI Forecast Calendar

AI Forecast Calendar turns dated milestones from published AI scenarios into a small static site and portable iCalendar feeds. Canonical forecast records live in [`data/forecasts.json`](data/forecasts.json); generated files in `dist/` are disposable build output.

## Local workflow

Node.js 20 or newer is the only requirement. The checks do not fetch packages or access the network.

```sh
npm run validate:data       # validate canonical schema and invariants
npm test                    # schema, deterministic ICS, and production artifact tests
npm run build               # regenerate dist/ from canonical data
npm run validate:ics        # inspect the generated AI 2027 feed
```

`validate:ics` is read-only: it checks CRLF line endings, RFC 5545's 75-octet content-line limit, calendar/component boundaries, required event properties, and unique UIDs without rewriting either the feed or canonical JSON. To inspect another generated file, run:

```sh
node scripts/validate-ics.mjs path/to/calendar.ics
```

This deliberately small validator checks the portability requirements this generator relies on; it is not a claim of exhaustive RFC 5545 conformance. For release review, it can be paired with a trusted standalone standards validator if organizational policy requires one. Never replace canonical JSON with output from a validator or calendar provider.

## Deployment

Deploy the contents of `dist/`, preserving `/calendars/ai-2027.ics` as the stable public subscription URL. Configure the host to return `.ics` files as `text/calendar; charset=utf-8`; `netlify.toml` contains one working static-host configuration.

After deployment, run the read-only HTTP smoke check:

```sh
npm run smoke -- https://calendar.example.org
```

It verifies the landing page, public source attribution, download/subscription path, stable feed URL, successful responses, feed boundaries, source link, and the expected HTML and calendar content types. Run it against the production origin—not a preview URL—after every routing or hosting change. A changed subscription URL is a breaking change.

## Human acceptance testing

Generated markup is not evidence of calendar-provider compatibility. Follow the provider scenarios and record actual results in [`docs/provider-testing.md`](docs/provider-testing.md) only after performing them. Use [`docs/manual-verification.md`](docs/manual-verification.md) for the concise browser and responsive review.

## Adding a forecast

Add a calendar and its milestones to `data/forecasts.json`. IDs are permanent slugs and become event UIDs and public paths. Preserve the source's stated timing separately from the concrete calendar anchor; use the 15th for a month-only date and July 1 for a year-only date. Every milestone needs an HTTPS source URL. Then run the complete local workflow above and review the text of the generated feed before deployment.
Converts published AI forecast timelines into calendar feeds and ICS files, making future milestones easier to compare against real life.

## Build and verify

Requires Node.js 20 or newer and has no runtime dependencies.

```sh
npm run build:calendars
npm test
```

The build validates `data/forecasts/ai-2027.json` before generating the deterministic production artifact at `public/calendars/ai-2027.ics`. Invalid or incomplete source data stops the build; the ICS serializer does not accept an unvalidated object.

## Download or subscribe

The same stable URL supports two different calendar workflows:

* **Subscribe:** give `https://YOUR-HOST/calendars/ai-2027.ics` to the “calendar subscription” or “calendar from URL” feature in your calendar app. The app can periodically fetch corrections published at that URL.
* **Download/import:** download `public/calendars/ai-2027.ics`, then import it as a file. Imported events are a copy and will **not** receive later corrections automatically.

Do not repeatedly import a downloaded file: most calendar applications create duplicate events. Prefer subscription when updates are wanted. Refresh schedules are controlled by each calendar provider and may not be immediate.

`public/_headers` configures the calendar media type on hosts that support the Netlify/Cloudflare Pages headers format. `vercel.json` applies the equivalent header on Vercel. Other static hosts should serve `.ics` files as `text/calendar; charset=utf-8` while preserving the stable path.

## Data and identity guarantees

Canonical forecast records have human-readable, stable forecast and milestone IDs. Event UIDs derive only from those IDs, while `DTSTAMP` derives from the source snapshot's stable `published_at` metadata. Generation never uses build time or array position. Approximate source timing remains distinct from the normalized calendar anchor in each event description.
## AI 2027 source workflow

The repository deliberately has one small, source-specific ingestion program rather than a reusable scraping framework. `scripts/ai2027_ingest.py` accepts an explicit source URL and either retrieves that URL or parses an explicitly named saved HTML file. Every candidate retains the source URL (including a section fragment), section name and anchor, the source's timing words, and the supporting passage.

### 1. Extract candidates

For reproducible review, save a source snapshot and identify both inputs on the command line:

```bash
python -m scripts.ai2027_ingest extract \
  --source-url https://ai-2027.com/ \
  --input path/to/ai-2027-snapshot.html \
  --output data/candidates/ai-2027.json
```

Omit `--input` to retrieve the explicit `--source-url`. Candidate output is sorted and contains a SHA-256 digest of the input, so the same snapshot produces byte-for-byte deterministic JSON. Extraction only recognizes AI 2027's dated narrative passages; it intentionally does not guess at ambiguous prose.

### 2. Review and correct

Review `data/candidates/ai-2027.json` against each linked source section. Merge passages that describe the same conceptual milestone, choose permanent IDs, and check titles and context. Date normalization is deterministic:

| Source timing | Calendar anchor | Precision |
| --- | --- | --- |
| Exact date | That date | `exact` |
| Month and year | The 15th | `month` |
| Year only | July 1 | `year` |
| Range | Midpoint (earlier day for a half-day tie) | `range` |
| Ambiguous prose | Explicit reviewer-supplied ISO date | `ambiguous` |

Ambiguous prose must be passed to `normalize_timing(..., manual_date="YYYY-MM-DD", reviewed=True)`; its original words remain in `source_timing`, and the result is labeled as manually reviewed. Never replace source wording with the normalized date.

Validate edits before promotion:

```bash
python -m scripts.ai2027_ingest validate data/candidates/ai-2027.json
python -m unittest discover -s tests -v
```

Validation rejects missing forecast or milestone IDs, duplicate milestone IDs, malformed ISO dates, invalid/missing provenance URLs, missing anchors or context, unknown precision values, and approximate dates lacking source timing.

### 3. Promote reviewed data

Candidate and canonical data live in separate trees. Promotion validates and copies a reviewed candidate, and **refuses to overwrite** an existing canonical file:

```bash
python -m scripts.ai2027_ingest promote \
  data/candidates/ai-2027.json data/forecasts/ai-2027.json
```

This one-way guard ensures a later extraction cannot erase editorial work. To correct canonical data, edit `data/forecasts/ai-2027.json` directly in a reviewed change, validate it, and document material source interpretations or date corrections in the changelog. Do not delete and re-promote merely to bypass the guard. A newly published forecast should receive a new version/ID rather than silently changing the snapshot.
AI Forecast Calendar converts milestones from published AI forecast timelines into static site pages and portable iCalendar (`.ics`) feeds. It is a presentation and distribution layer for existing forecasts, not a forecasting or prediction-resolution platform. See [SPEC.md](SPEC.md) for the product requirements and [DECISIONS.md](DECISIONS.md) for architectural choices.

## Prerequisites

- Node.js 20 or newer
- npm (included with Node.js)

## Local development

```sh
npm install
npm run dev
```

Eleventy serves the site locally and watches templates for changes. The ICS feeds are generated once when the development server starts; restart it after changing forecast JSON.

Create a clean production build with:

```sh
npm run build
```

The deployable site is written to `dist/`. `npm test` currently performs the same clean production build, catching invalid imports, templates, or forecast JSON.

## Repository structure

```text
.github/workflows/deploy.yml  GitHub Pages build and deployment
scripts/build-calendars.js   Deterministic JSON-to-ICS generator
src/_data/forecasts/         Canonical, reviewed forecast JSON
src/_includes/               Shared Eleventy layouts
src/                         Site pages and templates
public/                      Assets copied directly to the site root
SPEC.md                      Product and engineering requirements
DECISIONS.md                 Durable product and architecture decisions
CHANGELOG.md                 Meaningful project changes
```

`dist/` and `public/calendars/` are generated and must not be committed.

## Forecast data pipeline

One reviewed JSON file in `src/_data/forecasts/` is the canonical source for each forecast. It contains source provenance plus milestones with stable IDs, original timing language, normalized `YYYY-MM-DD` calendar anchors, and date precision.

During `npm run build`:

1. `scripts/build-calendars.js` reads each forecast JSON file and creates `public/calendars/<forecast-id>.ics`.
2. Eleventy reads the same files through `src/_data/forecasts.js`, renders site content, and copies `public/` unchanged.
3. The complete static artifact lands in `dist/`, including feeds at stable paths such as `dist/calendars/ai-2027.ics`.

This keeps the website and subscriptions derived from a single human-reviewable source. Published forecast IDs are permanent because calendar clients retain their subscription URLs.

## Deployment

The workflow in `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on every push to `main`; it can also be run manually. In the repository's **Settings → Pages**, select **GitHub Actions** as the source.

Before sharing subscription links, configure a custom domain in GitHub Pages and DNS. The custom domain makes URLs such as `https://example.org/calendars/ai-2027.ics` independent of the repository name and allows a future host migration without breaking subscribers. Any replacement host must publish the contents of `dist/` at the domain root and preserve `/calendars/<forecast-id>.ics` exactly.
