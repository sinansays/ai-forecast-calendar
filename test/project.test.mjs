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
  assert.match(fs.readFileSync('dist/index.html', 'utf8'), /href="\/calendars\/ai-2027\.ics"/);
  assert.deepEqual(validateIcs(fs.readFileSync('dist/calendars/ai-2027.ics', 'utf8')), []);
});
