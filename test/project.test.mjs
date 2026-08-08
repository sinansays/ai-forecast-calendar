import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { generateIcs, validateForecast } from '../src/forecast-calendar.js';
import { validateIcs } from '../scripts/lib.mjs';

test('ICS generation is byte-for-byte deterministic', () => {
  const record = JSON.parse(fs.readFileSync('data/forecasts/ai-2027.json', 'utf8'));
  assert.equal(generateIcs(validateForecast(record)), generateIcs(validateForecast(structuredClone(record))));
  assert.deepEqual(validateIcs(generateIcs(validateForecast(record))), []);
});
test('canonical data produces matching production site, manifest, and feed output', () => {
  const record = validateForecast(JSON.parse(fs.readFileSync('data/forecasts/ai-2027.json', 'utf8')));
  execFileSync('npm', ['run', 'build']);
  const html = fs.readFileSync('dist/index.html', 'utf8');
  const feed = fs.readFileSync('dist/calendars/ai-2027.ics', 'utf8');
  const manifest = JSON.parse(fs.readFileSync('dist/calendars/index.json', 'utf8'));
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
  assert.equal(record.milestones.length, 24, 'canonical data must retain the final reviewed milestone set');
  const milestoneIds = new Set(record.milestones.map(({ id }) => id));
  for (const id of ['stumbling-agents', 'agent-4-2027-09', 'slowdown-choice-2027-11', 'race-space-expansion-2030']) {
    assert.ok(milestoneIds.has(id), `canonical data must retain stable milestone ID ${id}`);
    assert.match(feed, new RegExp(`UID:ai-2027\\.${id}@ai-forecast-calendar`));
  }
  const websiteCount = Number(html.match(/data-forecast-id="ai-2027" data-milestone-count="(\d+)"/)?.[1]);
  const eventCount = (feed.match(/BEGIN:VEVENT\r\n/g) || []).length;
  assert.equal(websiteCount, record.milestones.length);
  assert.equal(websiteCount, eventCount, 'website milestone count must equal generated VEVENT count');
  assert.deepEqual(manifest, [{
    id: record.id,
    title: record.title,
    sourceUrl: record.source_url,
    milestoneCount: record.milestones.length,
  }]);
  for (const milestone of record.milestones) {
    assert.match(feed, new RegExp(`UID:${record.id}\\.${milestone.id}@ai-forecast-calendar`));
  }
  assert.match(html, /rel="canonical" href="https:\/\/ai-forecast-calendar\.org\/"/);
  assert.match(html, /property="og:title"/);
  assert.doesNotMatch(html, /\{\{CALENDARS\}\}/);
  assert.deepEqual(validateIcs(feed), []);
});

test('build validates every JSON record in the selected data directory before replacing dist', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'forecast-build-'));
  try {
    const canonical = JSON.parse(fs.readFileSync('data/forecasts/ai-2027.json', 'utf8'));
    fs.writeFileSync(path.join(directory, 'ai-2027.json'), JSON.stringify(canonical));
    const second = structuredClone(canonical);
    second.id = 'ai-2027-copy';
    second.title = 'AI 2027 test copy';
    fs.writeFileSync(path.join(directory, 'second.json'), JSON.stringify(second));

    execFileSync('node', ['scripts/build.mjs', directory]);
    assert.ok(fs.existsSync('dist/calendars/ai-2027.ics'));
    assert.ok(fs.existsSync('dist/calendars/ai-2027-copy.ics'));

    fs.writeFileSync('dist/validation-sentinel', 'must survive failed validation');
    second.milestones[0].calendar_date = 'not-a-date';
    fs.writeFileSync(path.join(directory, 'second.json'), JSON.stringify(second));
    assert.throws(
      () => execFileSync('node', ['scripts/build.mjs', directory], { stdio: 'pipe' }),
      /Command failed/,
    );
    assert.equal(fs.readFileSync('dist/validation-sentinel', 'utf8'), 'must survive failed validation');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
    execFileSync('npm', ['run', 'build']);
  }
});
