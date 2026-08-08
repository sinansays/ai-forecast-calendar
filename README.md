# AI Forecast Calendar

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
