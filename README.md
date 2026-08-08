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
