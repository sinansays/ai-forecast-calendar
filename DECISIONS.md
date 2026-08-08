# Decision Log

## 2026-08-08 — Dependency-free static build (supersedes “Static-site framework”)

**Decision:** Use the dependency-free Node.js builder in `scripts/build.mjs`, with `site/index.html` and `site/styles.css` as the production site foundation. This decision supersedes the earlier Eleventy decision below.

**Context:** Post-merge reconciliation left two competing site implementations: an Eleventy/Nunjucks tree and a simpler static template pipeline. Both targeted the same deployable artifact, so retaining both made it unclear which templates were authoritative and allowed an abandoned implementation to drift back into production.

**Rationale:** The static builder already validates the canonical data, renders the selected HTML template, copies its stylesheet, and generates calendar feeds using only Node's standard library. Selecting it removes framework and template duplication without changing forecast milestone content or the published output contract.

**Consequences:** `npm run build` produces `dist/index.html` and `dist/calendars/<forecast-id>.ics` directly from the selected pipeline. A build test pins `site/index.html` and `site/styles.css` as the production sources. Canonical validation and ICS serialization share the retained `src/forecast-calendar.js` module.

## 2026-08-08 — Static-site framework

**Decision:** Use Eleventy 3 with Nunjucks templates and a small Node.js build script.

**Context:** The product is a content-led microsite generated from a small set of structured forecasts. It needs design flexibility and build-time ICS generation, but no client application or server.

**Rationale:** Eleventy produces plain static files, supports data-driven pages, adds little runtime complexity, and lets the calendar generator use Node's standard library. Nunjucks keeps page templates readable.

**Consequences:** Contributors need Node.js, and build behavior lives in two straightforward layers: Eleventy for HTML and Node for ICS. There is no browser-side framework and no application server.

## 2026-08-08 — Static hosting

**Decision:** Deploy the `dist/` build artifact to GitHub Pages using GitHub Actions, with a custom domain recommended before calendar URLs are publicized.

**Context:** The site and feeds are immutable static files, and subscription links must remain available without operating a server.

**Rationale:** GitHub Pages matches the repository workflow, serves arbitrary `.ics` assets, and has negligible operational overhead. A custom domain decouples public URLs from the repository name or future hosting provider.

**Consequences:** Pages must be enabled with GitHub Actions as its source. DNS and the custom domain are configured outside this repository. Moving hosts remains possible as long as the domain and paths are preserved.

## 2026-08-08 — Canonical forecast data

**Decision:** Store one UTF-8 JSON file per forecast in `src/_data/forecasts/`, with stable forecast and milestone IDs, source metadata, normalized ISO dates, source timing, date precision, and a milestone list.

**Context:** Both pages and calendar feeds need the same reviewed source of truth. The data should remain inspectable and editable without database infrastructure.

**Rationale:** JSON is natively supported by Node and Eleventy, deterministic, broadly tooled, and easy for humans and agents to review. A file boundary per forecast makes snapshots and corrections clear.

**Consequences:** Schema validation can be added when the first data set lands. Editors must preserve stable IDs and explicitly record the difference between source timing and its calendar anchor.

## 2026-08-08 — Stable ICS URLs

**Decision:** Publish every feed at `/calendars/<forecast-id>.ics`; for example, `/calendars/ai-2027.ics`.

**Context:** Calendar applications retain subscribed URLs, so changing a feed path breaks updates for existing subscribers.

**Rationale:** A forecast's stable ID provides a short, predictable, host-independent path. Generating a real file at that location works on any static host without redirects or routing logic.

**Consequences:** Forecast IDs and published paths are permanent API-like contracts. Revised forecasts should normally receive new IDs; corrections may update content at the existing path. Deployments must preserve the `calendars/` directory verbatim.
## 2026-08-08 — Canonical AI 2027 reconciliation

`data/forecasts/ai-2027.json` is the single canonical record and is governed by
`data/forecast.schema.json`. The YAML review document was removed only after all
24 entries were transferred, counted, and compared. `data/forecasts.json` is
retained only as the generated discovery/presentation index because the build
supports multiple calendars; it is not an editorial source of truth. The site
and published ICS continue to consume that compatibility index in this change,
so reconciliation cannot silently rewrite existing subscribers' events.

The source calls the opening period “Summer 2025,” not “Mid-2025.” We therefore
use July 15, 2025 as a representative summer anchor instead of copying either
June 15 from the former four-event record or July 1 from the YAML draft. “Early”
year references use February 15, month-only references use the 15th, and
year-only references use July 1. These are calendar anchors, not claims of
day-level source precision. Post-November events remain explicitly marked as
conditional `slowdown` or `race` branches. Existing compatible IDs
`stumbling-agents`, `agent-1`, and `agent-2` are retained; the misleading old
three-event index is not used to rename or re-date the remaining canonical
milestones.
## 2026-08-08: Canonical event UID convention

**Decision:** Event UIDs are `<forecast-id>.<milestone-id>@ai-forecast-calendar`.

**Context:** Before consolidating calendar generation, the preserved feed audit
checked the known project-controlled public channels and found no successful
deployment, release, Pages site, or other distribution. There were therefore no
known public subscribers whose already-published UIDs required a compatibility
map. The audit fixture remains committed as evidence of that check.

**Consequences:** Forecast and milestone IDs are permanent identity fields. If
evidence of an older public feed is discovered later, an explicit milestone-ID
to published-UID map must be introduced before changing any affected event.
