import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { generateIcs, validateForecast } from '../src/forecast-calendar.js';
import { validateIcs } from '../scripts/lib.mjs';

test('ICS generation is byte-for-byte deterministic', () => {
  const record = JSON.parse(fs.readFileSync('data/forecasts/ai-2027.json', 'utf8'));
  assert.equal(generateIcs(validateForecast(record)), generateIcs(validateForecast(structuredClone(record))));
  assert.deepEqual(validateIcs(generateIcs(validateForecast(record))), []);
});
test('production build contains the landing page and validated stable feed', () => {
  execFileSync('npm', ['run', 'build']);
  const html = fs.readFileSync('dist/index.html', 'utf8');
  const template = fs.readFileSync('site/index.html', 'utf8');
  const [templateStart, templateEnd] = template
    .replaceAll('{{CANONICAL_URL}}', 'https://ai-forecast-calendar.org/')
    .split('{{CALENDARS}}');
  assert.ok(html.startsWith(templateStart), 'build must use the selected static HTML template');
  assert.ok(html.endsWith(templateEnd), 'build must use the selected static HTML template');
  assert.equal(
    fs.readFileSync('dist/styles.css', 'utf8'),
    fs.readFileSync('site/styles.css', 'utf8'),
    'build must copy the selected static stylesheet',
  );
  assert.match(html, /href="\/calendars\/ai-2027\.ics"/);
  assert.match(html, /24 milestones/);
  assert.match(html, /Stumbling agents begin changing work/);
  assert.match(html, /rel="canonical" href="https:\/\/ai-forecast-calendar\.org\/"/);
  assert.match(html, /property="og:title"/);
  assert.doesNotMatch(html, /\{\{CALENDARS\}\}/);
  assert.deepEqual(validateIcs(fs.readFileSync('dist/calendars/ai-2027.ics', 'utf8')), []);
});
