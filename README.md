# AI Forecast Calendar

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
