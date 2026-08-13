# Adding a forecast calendar

Use this process for every forecast after AI 2027. A new calendar must represent a dated, published snapshot; it must not turn commentary, live prediction-market questions, or the project's own interpretation into a forecast.

## 1. Qualify the source

Before extraction, record a short source assessment in the pull request. A suitable source must be:

- **identifiable:** named authors or an accountable publishing organization;
- **published and stable:** a dated report, article, scenario, dataset release, or archived version with a durable HTTPS URL;
- **prospective:** written as a forecast rather than reconstructed after the events;
- **calendar-suitable:** enough explicitly timed, conceptually distinct claims to produce a useful feed without padding;
- **citable:** each event can link to a relevant source section and retain supporting context;
- **faithfully representable:** dates and uncertainty can be preserved without inventing precision or probability.

Reputation alone is not sufficient. Exclude sources whose only timing is an undated sequence, whose milestones would mostly be editorial inventions, or whose claims change continuously without a versioned snapshot. A source may be reputable but unsuitable for this product.

Prefer a portfolio with different authors, organizations, methods, and conclusions. Adding another calendar from the AI 2027 authors may be useful, but it does not by itself solve source diversity.

## 2. Preserve a snapshot

Record the source URL, original publication date, snapshot date, authorship/attribution, version label, and any notes needed to identify exactly what was reviewed. If the source changes, preserve or reference a dated release or archive where licensing and availability allow.

Do not silently replace an existing calendar with a later forecast. A genuinely new edition normally receives a new permanent forecast ID and feed URL.

## 3. Extract candidates

Source-specific extraction scripts are preferred over a generalized scraper. Candidate output belongs in `data/candidates/` and must never feed the production build.

For every candidate, preserve:

- the original timing words;
- supporting source text or a faithful short context note;
- the most specific durable source URL available;
- explicit uncertainty or probability;
- conditional scenario/branch information; and
- extraction provenance sufficient to repeat or audit the work.

Merge passages that describe one conceptual milestone. Do not create events merely to reach a target count.

## 4. Review and normalize

Review every candidate against the source before promotion. Apply the deterministic rules in `SPEC.md`:

- exact date: use the stated date;
- month only: use the 15th;
- year only: use July 1 unless context clearly supports another documented choice;
- range: use its representative midpoint unless a beginning, deadline, or other stated anchor is more meaningful; and
- ambiguous prose: require an explicit human-selected date and explain the inference.

Keep `source_timing` distinct from `calendar_date`. Explain every approximate or inferred anchor in `normalization_rationale`; never imply that the authors selected the project's representative day.

## 5. Create canonical data

Create `data/forecasts/<forecast-id>.json` conforming to `data/forecast.schema.json`. Use lowercase hyphenated permanent IDs.

- The forecast ID becomes `/calendars/<forecast-id>.ics` and must not change after publication.
- A milestone ID becomes part of `<forecast-id>.<milestone-id>@ai-forecast-calendar` and must survive title, date, or ordering corrections.
- Titles should be short and intelligible in an ordinary calendar.
- Summaries and context must describe the source, not endorse it or add project predictions.
- Preserve explicit uncertainty and conditional branches when applicable.

The guarded AI 2027 promotion command is source-specific. For a new adapter, provide equivalent validation and refusal-to-overwrite behavior, or create the canonical file through a directly reviewed commit.

## 6. Validate and inspect

Run the authoritative gate:

```sh
npm run check
```

Then inspect the generated artifacts in `dist/` without committing them:

- `dist/index.html` contains the new listing, attribution, count, date range, preview, source, copy action, and download action;
- `dist/calendars/index.json` contains the new discovery record;
- `dist/calendars/<forecast-id>.ics` contains the expected number of unique all-day events;
- representative descriptions preserve source timing, calendar anchor, context, uncertainty, and source URL; and
- a second clean build is byte-for-byte deterministic.

Add focused fixtures/tests for any new date language, extraction adapter, conditional structure, or serializer edge case introduced by the source.

## 7. Record review and publish

The pull request should state:

- why the source passed qualification;
- who/what performed extraction and who reviewed it;
- milestone count and date range;
- material inclusion, exclusion, merging, or normalization decisions;
- commands run and manual artifact checks performed; and
- any unresolved ambiguity.

Add a changelog entry for the calendar. Add a decision-log entry only for durable interpretation, schema, identity, URL, architecture, or hosting decisions—not routine transcription.

After deployment, run the production smoke test and the applicable checks in `manual-verification.md` and `provider-testing.md`. Provider behavior must be observed against the deployed feed; local validation is not evidence of Apple, Google, or Outlook compatibility.

## Source selection record

Before committing a canonical calendar, use this compact table in the pull request or a review document:

| Criterion | Result | Evidence / notes |
| --- | --- | --- |
| Named, accountable authorship | Pass / Fail | |
| Dated, stable snapshot | Pass / Fail | |
| Durable primary-source URL | Pass / Fail | |
| Prospective forecast | Pass / Fail | |
| Sufficient explicit timing | Pass / Fail | |
| Meaningful, non-duplicative milestones | Pass / Fail | |
| Uncertainty can be preserved | Pass / Fail | |
| No invented claims or probabilities required | Pass / Fail | |
| Adds portfolio diversity | Pass / Neutral | |
| Human fidelity review completed | Pass / Fail | |

Every required row must pass. “Adds portfolio diversity” is a preference rather than a veto, but should affect prioritization.
