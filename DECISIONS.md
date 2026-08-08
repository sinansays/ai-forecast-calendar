# Decision Log

## 2026-08-08 — Reconciled production architecture

**Decision:** Use one dependency-free static pipeline. [`scripts/build.mjs`](scripts/build.mjs) validates all canonical forecasts, renders [`site/index.html`](site/index.html), copies [`site/styles.css`](site/styles.css), and generates the website, discovery manifest, and iCalendar feeds in `dist/`. This supersedes the earlier Eleventy/Nunjucks proposal and every parallel static-site implementation.

**Rationale:** The site has no runtime application or server requirements. One standard-library build keeps the HTML and feeds derived from the same validated records and eliminates competing templates and generators.

**Consequences:** `dist/` is disposable and uncommitted. `npm run check` is the authoritative pre-deployment gate. Production source code is limited to the selected builder, templates, validator, and serializer.

## 2026-08-08 — Canonical forecast schema and location

**Decision:** One UTF-8 JSON file per reviewed forecast lives in [`data/forecasts/`](data/forecasts/) and conforms to [`data/forecast.schema.json`](data/forecast.schema.json). No compatibility index, generated manifest, candidate file, or published feed is canonical.

**Required record shape:** A forecast has a stable ID, title, description, HTTPS source URL, publication date, version/snapshot metadata, attribution, and milestones. Every milestone has a stable ID, title, original source timing, normalized ISO calendar date, precision, summary, source context, HTTPS source URL, and normalization rationale; uncertainty and conditional branch are supported where applicable.

**Consequences:** Candidate records remain isolated in [`data/candidates/`](data/candidates/) until manual review and guarded promotion. Both HTML and ICS output consume only validated canonical records. Material source interpretations and date corrections require changelog entries.

## 2026-08-08 — Stable feed identity and UID policy

**Decision:** Publish each feed at `/calendars/<forecast-id>.ics`. Every VEVENT UID is `<forecast-id>.<milestone-id>@ai-forecast-calendar`.

**Rationale:** Calendar clients use feed paths and event UIDs as durable identities. IDs—not build time, array position, titles, or normalized dates—therefore control identity.

**Consequences:** Published forecast and milestone IDs are permanent. Corrections retain IDs; a genuinely new forecast version normally receives a new forecast ID. The pre-reconciliation audit found no successful public deployment or known subscribers requiring an older UID compatibility map. If contrary evidence appears, add an explicit published-UID map before changing an affected event.

## 2026-08-08 — GitHub Pages hosting

**Decision:** GitHub Pages, deployed by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), is the only supported production hosting target. A custom domain is required before subscription URLs are publicized.

**Rationale:** Pages directly hosts the immutable `dist/` artifact with no server operations. A custom domain preserves the public origin across a future infrastructure migration.

**Consequences:** Alternative-host configuration is not retained. The deployment workflow must fetch the deployed `/calendars/ai-2027.ics` and verify its actual HTTP `Content-Type` contains `text/calendar`; repository configuration alone is not evidence. The domain and stable `/calendars/<forecast-id>.ics` paths must survive any future hosting change.

## 2026-08-08 — AI 2027 milestone reconciliation

**Decision:** [`data/forecasts/ai-2027.json`](data/forecasts/ai-2027.json) contains the consolidated 24-milestone reviewed snapshot, including both conditional post-November `slowdown` and `race` branches.

**Source/date interpretation:** The source says “Summer 2025,” not “Mid-2025”; the representative anchor is 2025-07-15. “Early” year references use February 15, month-only references use the 15th, and year-only references use July 1. These anchors do not claim day-level source precision. Existing compatible IDs including `stumbling-agents`, `agent-1`, and `agent-2` remain stable.
