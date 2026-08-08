import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { generateIcs, readData, validateData, validateIcs } from '../scripts/lib.mjs';

test('canonical forecast data satisfies the schema checks', () => assert.deepEqual(validateData(readData()), []));
test('ICS generation is byte-for-byte deterministic', () => {
  const calendar = readData().calendars[0];
  assert.equal(generateIcs(calendar), generateIcs(structuredClone(calendar)));
  assert.deepEqual(validateIcs(generateIcs(calendar)), []);
});
test('production build contains the landing page and validated stable feed', () => {
  execFileSync(process.execPath, ['scripts/build.mjs']);
  const html = fs.readFileSync('dist/index.html', 'utf8');
  assert.match(html, /href="\/calendars\/ai-2027\.ics"/);
  assert.match(html, /3 milestones/);
  assert.match(html, /Agent-3 becomes a superhuman AI researcher/);
  assert.match(html, /rel="canonical" href="https:\/\/ai-forecast-calendar\.org\/"/);
  assert.match(html, /property="og:title"/);
  assert.doesNotMatch(html, /\{\{CALENDARS\}\}/);
  assert.deepEqual(validateIcs(fs.readFileSync('dist/calendars/ai-2027.ics', 'utf8')), []);
});
