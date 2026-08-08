# AI Forecast Calendar

Converts published AI forecast timelines into calendar feeds and ICS files, making future milestones easier to compare against real life.

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
