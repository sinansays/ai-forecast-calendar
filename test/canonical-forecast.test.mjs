import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { validateCanonical } from '../scripts/validate-canonical.mjs';
import { assertUniqueForecastIds, validateForecast } from '../src/forecast-calendar.js';

const canonical = () => JSON.parse(fs.readFileSync('data/forecasts/ai-2027.json', 'utf8'));

test('the canonical AI 2027 record and all 24 reviewed milestones validate', () => {
  const record = canonical();
  assert.equal(record.milestones.length, 24);
  assert.deepEqual(validateCanonical(record), []);
});

test('canonical validation requires provenance', () => {
  const record = canonical();
  delete record.milestones[0].source_context;
  assert.match(validateCanonical(record).join('\n'), /source_context is required/);
});

test('canonical validation rejects duplicate IDs', () => {
  const record = canonical();
  record.milestones[1].id = record.milestones[0].id;
  assert.match(validateCanonical(record).join('\n'), /id is duplicated/);
});

test('forecast collections reject duplicate forecast IDs', () => {
  const first = validateForecast(canonical());
  const secondRecord = canonical();
  secondRecord.title = 'A second forecast with a colliding ID';
  const second = validateForecast(secondRecord);
  assert.throws(
    () => assertUniqueForecastIds([first, second]),
    /Duplicate forecast id: ai-2027/,
  );
});

test('canonical validation rejects invalid dates and precision values', () => {
  const record = canonical();
  record.milestones[0].calendar_date = '2025-02-30';
  record.milestones[1].date_precision = 'inferred';
  const errors = validateCanonical(record).join('\n');
  assert.match(errors, /real calendar date/);
  assert.match(errors, /date_precision is invalid/);
});

test('canonical validation rejects unexplained approximate dates', () => {
  const record = canonical();
  delete record.milestones[0].normalization_rationale;
  assert.match(validateCanonical(record).join('\n'), /normalization_rationale is required/);
});
