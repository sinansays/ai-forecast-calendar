# AI Forecast Calendar — Product & Engineering Spec

**Status:** V0 specification  
**Primary implementation agent:** Codex or equivalent agentic coding system  
**Source of truth:** This file

---

## 1. Project Summary

AI Forecast Calendar turns published AI forecasting timelines into ordinary calendar feeds.

Many AI forecasts describe future developments in prose, charts, timelines, or long-form reports. Although these forecasts can be compelling, they remain abstract when encountered on a website.

This project makes them more tangible by translating forecast milestones into dated calendar events that users can subscribe to or import into the calendars they already use.

The basic interaction is:

**Published forecast → dated milestones → subscribable calendar**

The project does not attempt to create new forecasts, adjudicate whether forecasts were correct, or maintain an independent forecasting methodology.

It is a presentation and distribution layer for existing forecasts.

---

## 2. Primary User

The initial user is the project creator.

The subsequent audience is anyone who:

- is curious about AI forecasts;
- wants to experience forecast timelines in a more concrete way;
- wants forecast milestones overlaid on their existing personal calendar;
- wants a simple `.ics` file or calendar subscription URL without needing to manually translate forecasts themselves.

No accounts or personalization are required for V0.

---

## 3. Problem

AI forecasts are typically presented as:

- websites;
- essays;
- charts;
- timelines;
- PDFs;
- forecasting-platform pages.

These formats make future milestones intellectually understandable but temporally abstract.

Users already have a familiar interface for understanding where they are in time: their calendar.

Putting forecast milestones directly onto that calendar makes the forecast feel connected to real life.

Instead of reading:

> “In October 2027, X may happen.”

the user encounters an event in October 2027 while navigating their actual calendar.

The product therefore attempts to make forecasts **temporally concrete rather than abstract**.

---

## 4. Product Principle

The project should remain extremely simple.

It should:

1. identify milestones in an existing published forecast;
2. assign those milestones calendar dates;
3. preserve links and context from the original source;
4. generate a portable calendar feed;
5. provide a simple website from which the calendar can be subscribed to or downloaded.

The project should avoid growing into a general forecasting, prediction-market, scoring, or analysis platform.

---

## 5. V0

V0 should support at least one forecasting project.

The preferred first source is:

**AI 2027**

Additional forecasts from the same group, including **AI 2040**, may follow once the basic system works.

A completed V0 should allow a visitor to:

1. visit the website;
2. see a short explanation of the project;
3. see the available forecast calendar;
4. inspect its major milestones;
5. subscribe using a calendar URL and/or download an `.ics` file;
6. see those events appear correctly in a mainstream calendar application.

V0 should contain enough milestones to make the calendar meaningfully represent the underlying forecast.

A rough expectation is approximately **8–10 milestone events per forecast year when the source material supports that density**.

This is not a quota.

Faithfulness to the source is more important than generating an arbitrary number of events.

---

## 6. Non-Goals

The following are explicitly outside the scope of V0:

- producing original AI forecasts;
- scoring forecasters;
- determining whether forecasts ultimately proved correct;
- marking predictions as successful or failed;
- prediction markets;
- probabilistic forecasting infrastructure;
- user accounts;
- user-generated forecasts;
- community voting;
- comments;
- complex search;
- complex filtering;
- notifications beyond whatever calendar applications provide;
- personalized feeds;
- analytics dashboards;
- comparison tools between forecasters;
- automated prediction resolution;
- monitoring real-world events to update forecast outcomes;
- building an editorial position on the forecasts;
- independently validating the claims made by forecast authors.

These features should not be added merely because they appear useful.

Expansion beyond the project's core purpose should require an explicit decision.

---

## 7. Forecast Sources

Forecasts should come from identifiable, published sources.

Examples could eventually include:

- AI 2027;
- AI 2040;
- other well-developed AI forecast projects;
- selected published forecasting timelines from credible organizations or individuals.

The initial implementation should optimize for a **small number of high-quality, interesting forecast timelines**, not comprehensive coverage.

There may only ever be a relatively small number of calendars.

That is acceptable.

---

## 8. Source Ingestion

The preferred workflow is automated or semi-automated extraction.

The system should attempt to retrieve a forecast source and identify:

- milestone;
- forecast timing;
- supporting text;
- relevant section of the source;
- source URL;
- any probability or uncertainty stated by the authors.

AI-assisted extraction is encouraged.

Manual transcription should not be the normal operating model.

However, extraction does **not** need to be a continuously running automated service.

Forecasts are generally published artifacts that can be processed once.

The desired workflow is approximately:

```text
forecast source
      ↓
extract milestone candidates
      ↓
normalize dates
      ↓
human review if necessary
      ↓
canonical forecast data
      ↓
website + ICS generation
```

The extraction process should favor faithful representation over clever interpretation.

---

## 9. Immutable Source Principle

Published forecasts should be treated as snapshots.

The project should preserve what the forecast stated when the calendar was created rather than continuously rewriting history.

Each forecast calendar should therefore retain:

- forecast/project name;
- source URL;
- original publication date when available;
- relevant source text or summary;
- extracted milestone date;
- any date-normalization decision made by this project.

If a forecasting organization later publishes a genuinely new forecast, it should generally be treated as a new version or new calendar rather than silently replacing the old forecast.

---

## 10. Milestones

Each calendar event corresponds to one meaningful milestone from the source forecast.

Examples might include:

- release of a major model or agent;
- achievement of a capability threshold;
- deployment at a stated scale;
- economic or organizational changes;
- scientific or technical milestones;
- transitions explicitly identified by the forecast authors.

Milestones should represent the source rather than editorial additions from this project.

A milestone should not be created solely to make the calendar look busier.

---

## 11. Date Normalization

Calendar systems require concrete dates.

Forecasts frequently do not provide exact dates.

The system therefore needs deterministic rules for converting approximate temporal language into calendar dates.

### Exact date

If the source specifies an exact date, use it.

### Month only

If the source specifies a month but not a day:

**use the 15th day of that month.**

Example:

```text
"October 2027" → October 15, 2027
```

### Year only

If a source specifies only a year, the project may use:

```text
July 1 of that year
```

unless another date is clearly more appropriate based on context.

### Date ranges

If the source gives a range, choose a representative midpoint unless the text clearly identifies a beginning, deadline, or other more meaningful anchor.

### Ambiguous prose

If the timing must be inferred from surrounding prose, the project may select a reasonable representative date.

Every inferred or normalized date must preserve the distinction between:

- the source's actual stated timing; and
- the exact calendar date selected by this project.

The calendar event description should make this transparent.

Example:

```text
Source timing: October 2027
Calendar anchor: October 15, 2027
```

The arbitrary choice of a specific calendar day is a presentation mechanism, not an assertion that the forecast named that exact day.

---

## 12. Milestone Identity

For simplicity, each source forecast should normally contain **one calendar event per conceptual milestone**.

Do not create multiple competing dates for the same milestone merely because multiple passages discuss it.

Where useful, supplementary details can appear in the calendar event description.

V0 does not need to reconcile multiple independent forecasters predicting the same milestone.

Those should remain separate forecast calendars.

---

## 13. Probabilities and Uncertainty

If a source explicitly assigns a probability or expresses uncertainty, preserve that information.

It should normally appear in:

- the event description; and/or
- structured metadata used by the website.

Probability information does not need to appear in the event title unless the design later calls for it.

The system should never manufacture probabilities that do not appear in the source.

---

## 14. Calendar Event Structure

A calendar event should contain at minimum:

### Title

A short, human-readable description of the milestone.

Example:

```text
AI 2027: Agent-3 becomes a superhuman AI researcher
```

The exact naming convention may evolve during design work.

### Date

The normalized calendar date.

### Description

Where practical:

```text
Forecast: [plain-language description]

Source timing: October 2027
Calendar anchor: October 15, 2027

Context:
[short description]

Source:
[url]
```

If probability or uncertainty is relevant:

```text
Forecast probability / uncertainty:
[original information]
```

Descriptions should remain readable inside ordinary calendar applications.

### URL

Where supported, link directly to the most relevant original source location.

---

## 15. Calendar Format

The canonical output should use the most portable broadly supported calendar format.

For V0, this means:

**iCalendar / `.ics`**

The implementation should work with mainstream calendar applications including:

- Apple Calendar;
- Google Calendar;
- Microsoft Outlook.

The website should support, where practical:

- a downloadable `.ics` file; and
- a stable subscribable calendar URL.

Subscription is preferable because it does not require the user to manually import a new file if the calendar itself is corrected.

However, the generated forecast content should generally be stable because it represents a published snapshot.

---

## 16. Stable URLs

Each forecast calendar should have a stable slug.

Example:

```text
/calendars/ai-2027
```

The ICS feed might therefore be exposed as something similar to:

```text
/calendars/ai-2027.ics
```

Exact routing is an implementation decision.

Stable URLs are more important than a particular routing scheme.

Do not unnecessarily change published subscription URLs.

---

## 17. Website

The website should be a small, polished microsite.

It does not need to behave like a large application.

### Landing page

The landing page should communicate approximately this idea:

> AI forecasts can feel abstract when experienced as reports and timelines. This project places their milestones directly into your calendar, making it possible to experience those predicted futures alongside your actual life as the dates approach and pass.

The final copy should be concise.

### Available calendars

The page should show available forecast projects.

Each forecast should provide:

- forecast name;
- one-sentence description;
- source attribution;
- approximate number/date range of milestones;
- subscribe action;
- `.ics` download;
- optionally, a simple preview of milestone events.

No account should be required.

---

## 18. Visual Design

The project should look intentional, restrained, and editorial.

It should **not** look like a generic AI-generated SaaS landing page.

Avoid default aesthetics associated with rapidly generated Tailwind projects, including unnecessary:

- gradient-heavy hero areas;
- rounded cards everywhere;
- giant pill buttons;
- excessive drop shadows;
- decorative dashboards;
- fake metrics;
- stock illustrations;
- generic AI imagery;
- excessive use of badges.

Prefer:

- a small design vocabulary;
- calendar/timeline-inspired visual details where useful;
- restrained interaction;
- an editorial or publication-like feeling;
- responsive design.

The project owner expects to shape visual design after the first implementation.

The underlying implementation should therefore make design iteration easy.

---

## 19. Search and Navigation

V0 does not need search.

V0 does not need complicated filters.

The anticipated number of forecast projects is small enough for straightforward browsing.

Complex information architecture should not be invented prematurely.

---

## 20. Data Model

The implementation agent may select an appropriate data representation.

A relational database is **not required** for V0.

Static structured files may be preferable.

A forecast project needs approximately:

```yaml
id: ai-2027
title: AI 2027
source_url: https://...
published_at: YYYY-MM-DD
description: ...
milestones:
  - id: ...
    title: ...
    source_timing: October 2027
    calendar_date: 2027-10-15
    date_precision: month
    description: ...
    source_url: ...
```

The actual schema may differ.

Important requirements are:

- human readability;
- stable IDs;
- source provenance;
- deterministic ICS generation;
- easy manual correction;
- easy addition of new forecast calendars;
- compatibility with agentic maintenance.

Do not introduce database infrastructure unless it provides a concrete advantage.

---

## 21. Architecture

Prefer a simple architecture with as few moving parts as possible.

A plausible system is:

```text
structured forecast data
        ↓
static/site build
     ↙       ↘
website     ICS feeds
```

A static deployment is acceptable and may be preferable.

Server-side infrastructure should only be introduced where necessary.

---

## 22. Technology Selection

The implementation agent may select the stack.

Selection criteria, in priority order:

1. simplicity;
2. maintainability;
3. excellent support for static deployment;
4. easy generation of `.ics` feeds;
5. strong frontend design control;
6. minimal operational burden;
7. compatibility with GitHub-based workflows;
8. suitability for agentic coding.

Avoid unnecessary framework complexity.

Avoid dependencies whose only purpose is solving trivial problems.

---

## 23. Repository and Hosting

The project should live in a new repository in the **General Cognitions** GitHub organization.

The implementation should be easy to deploy from GitHub.

The agent should prefer simple hosting appropriate to a static or mostly-static microsite.

Possible deployment targets may include GitHub Pages, Vercel, Cloudflare Pages, or similar infrastructure.

The specific host can be selected based on what best supports stable `.ics` subscription URLs and straightforward deployment.

Do not create infrastructure requiring substantial ongoing administration.

---

## 24. Content Extraction Tooling

The first source should be processed in a way that can reasonably be reused for later forecast projects.

A source-ingestion tool or script may:

1. retrieve source content;
2. identify prospective milestones;
3. extract temporal references;
4. generate structured candidate records;
5. preserve source excerpts or references;
6. normalize approximate dates;
7. output human-reviewable structured data.

Use LLM assistance if it significantly reduces manual effort.

Avoid building a generalized web-scraping framework unless actual sources require it.

Source-specific adapters are acceptable.

---

## 25. Human Review

Complete automation is not required.

An agent may generate milestone candidates, but ambiguous editorial decisions should remain easy for a human to inspect and correct.

The goal is:

**near-zero tedious transcription**, not necessarily zero human judgment.

The canonical structured data should be readily editable.

---

## 26. Corrections

The project may correct:

- transcription errors;
- broken URLs;
- clearly incorrect date normalization;
- formatting;
- factual metadata about the source.

Corrections should not silently alter what the underlying source forecast actually claimed.

Material corrections should be documented in the changelog.

---

## 27. Project Documentation

The repository should maintain useful Markdown documentation as the project evolves.

At minimum:

```text
SPEC.md
README.md
CHANGELOG.md
```

The agent may introduce additional files such as:

```text
DECISIONS.md
CONTRIBUTING.md
docs/
```

when they provide concrete value.

Do not create documentation files purely for ceremony.

---

## 28. Decision Log

Meaningful product or architectural decisions should be recorded.

Examples:

- framework selection;
- hosting platform;
- ICS URL design;
- canonical date-normalization rules;
- major schema changes;
- important interpretation decisions.

If `DECISIONS.md` exists, entries should briefly state:

```text
Decision
Context
Rationale
Consequences
```

Routine implementation details do not require decision-log entries.

---

## 29. Changelog

`CHANGELOG.md` should record meaningful project changes.

Examples:

- forecast calendar added;
- milestones materially changed;
- date normalization corrected;
- source ingestion methodology changed;
- subscription URLs changed;
- substantial product features added.

Minor refactors do not need user-facing changelog entries.

---

## 30. Agent Operating Instructions

An implementation agent should begin by reading this specification in full.

This document defines product intent.

The agent should then inspect the existing repository before making assumptions about implementation.

### The agent may autonomously:

- select routine libraries;
- structure components;
- refactor code;
- create tests;
- create supporting documentation;
- improve accessibility;
- fix bugs;
- improve responsive behavior;
- improve build tooling;
- make minor visual refinements;
- add source-ingestion utilities;
- make reversible technical decisions.

### The agent should preserve:

- product simplicity;
- source fidelity;
- stable calendar URLs;
- portable ICS output;
- low operational complexity;
- visual restraint.

### The agent should avoid autonomously:

- turning the project into a forecasting platform;
- adding user accounts;
- adding prediction resolution;
- scoring forecasters;
- adding social/community features;
- adding unrelated AI features;
- introducing substantial backend infrastructure;
- materially changing the project's purpose.

If such changes appear beneficial, document them as proposals rather than implementing them by default.

---

## 31. Definition of Done for V0

V0 is complete when:

- the site is publicly deployable;
- AI 2027 has been converted into a curated set of calendar milestones;
- each milestone has a concrete calendar date;
- approximate dates clearly indicate how they were normalized;
- source provenance is preserved;
- a valid `.ics` feed is generated;
- the feed can be downloaded;
- a stable subscription URL is available;
- the feed has been tested in at least Apple Calendar and Google Calendar;
- forecast events display intelligibly inside those applications;
- the landing page clearly explains the concept;
- the site works well on desktop and mobile;
- there are no accounts or unnecessary application features;
- repository documentation explains how to add another forecast.

---

## 32. First Implementation Sequence

Unless repository constraints suggest otherwise, begin with:

### Phase 1 — Project foundation

- initialize repository;
- choose lightweight stack;
- configure local development;
- configure deployment;
- add this specification;
- create README and changelog.

### Phase 2 — AI 2027 data

- retrieve the canonical AI 2027 source;
- identify major dated milestones;
- extract candidate events;
- normalize dates according to this specification;
- create canonical structured data;
- manually inspect for fidelity.

### Phase 3 — ICS generation

- implement deterministic `.ics` generation;
- assign stable UIDs;
- create subscription endpoint/file;
- validate feed format;
- test Apple Calendar;
- test Google Calendar.

### Phase 4 — Microsite

Build:

- project explanation;
- AI 2027 calendar listing;
- milestone preview;
- calendar subscription;
- `.ics` download;
- source attribution.

### Phase 5 — Polish

- responsive design;
- accessibility;
- typography;
- metadata / Open Graph;
- basic error handling;
- deployment verification;
- documentation for adding additional forecasts.

---

## 33. Future Possibilities

These are **not V0 commitments**.

Possible later extensions include:

- AI 2040;
- additional forecasting organizations;
- multiple calendar feeds;
- an “all forecasts” calendar;
- lightweight categories;
- historical forecast archives;
- visual timeline previews;
- source-version browsing;
- automated extraction workflows;
- one-click provider-specific calendar subscription affordances.

These should only be pursued after the core calendar experience proves useful.

---

## 34. Guiding Test

When evaluating a proposed feature, ask:

> Does this make it easier for someone to experience an existing AI forecast as part of their real-world calendar?

If yes, it may belong.

If it instead helps users **make forecasts, debate forecasts, score forecasts, analyze forecasters, or build a forecasting community**, it probably belongs somewhere else.