import fs from 'node:fs';
import path from 'node:path';
import { generateIcs, validateForecast } from '../src/forecast-calendar.js';
import { validateIcs } from './lib.mjs';

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const formatDate = value => new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
const renderCalendar = calendar => {
  const milestones = [...calendar.milestones].sort((a, b) => a.calendar_date.localeCompare(b.calendar_date));
  const path = `/calendars/${encodeURIComponent(calendar.id)}.ics`;
  const preview = milestones.slice(0, 5).map(item => `<li data-milestone-id="${escapeHtml(item.id)}"><time datetime="${escapeHtml(item.calendar_date)}">${escapeHtml(formatDate(item.calendar_date))}</time><strong>${escapeHtml(item.title)}</strong></li>`).join('');
  return `<article class="calendar" aria-labelledby="${escapeHtml(calendar.id)}-title" data-forecast-id="${escapeHtml(calendar.id)}" data-milestone-count="${milestones.length}">
    <div>
      <p class="range">${escapeHtml(formatDate(milestones[0].calendar_date))} — ${escapeHtml(formatDate(milestones.at(-1).calendar_date))} · ${milestones.length} milestones</p>
      <h3 id="${escapeHtml(calendar.id)}-title">${escapeHtml(calendar.title)}</h3>
      <p class="description">${escapeHtml(calendar.description)}</p>
      <dl class="metadata"><dt>Attribution</dt><dd>${escapeHtml(calendar.attribution.display)}</dd><dt>Published</dt><dd><time datetime="${escapeHtml(calendar.publication_date)}">${escapeHtml(formatDate(calendar.publication_date))}</time></dd><dt>Snapshot</dt><dd><time datetime="${escapeHtml(calendar.version.snapshot_date)}">${escapeHtml(formatDate(calendar.version.snapshot_date))}</time> · ${escapeHtml(calendar.version.label)}</dd><dt>Date range</dt><dd>${escapeHtml(formatDate(milestones[0].calendar_date))} to ${escapeHtml(formatDate(milestones.at(-1).calendar_date))}</dd><dt>Milestones</dt><dd>${milestones.length} all-day events</dd><dt>Source</dt><dd><a href="${escapeHtml(calendar.source_url)}">${escapeHtml(calendar.source_url)}</a></dd></dl>
      <div class="milestones"><h4>Milestone preview</h4><ol class="timeline">${preview}</ol></div>
    </div>
    <aside class="action-panel" aria-label="${escapeHtml(calendar.title)} calendar options">
      <p class="action-label">No account required</p><h4>Put these milestones on your calendar</h4>
      <button class="action" type="button" data-copy-path="${escapeHtml(path)}">Copy subscription URL</button>
      <span class="copy-status" role="status" aria-live="polite"></span>
      <a class="action download" href="${escapeHtml(path)}" download>Download ${escapeHtml(calendar.title)} .ics file</a>
      <p class="subscription-url"><span class="visually-hidden">Subscription path: </span>${escapeHtml(path)}</p>
    </aside>
  </article>`;
};

const dataDirectory = process.argv[2] || process.env.FORECAST_DATA_DIR || 'data/forecasts';
const forecastFiles = fs.readdirSync(dataDirectory, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
  .map(entry => entry.name)
  .sort();
if (!forecastFiles.length) throw new Error(`No canonical forecasts found in ${dataDirectory}`);

// Finish loading and validating the entire input set before touching dist/. The
// branded objects returned here are the sole inputs to both output formats.
const forecasts = forecastFiles
  .map(file => validateForecast(JSON.parse(fs.readFileSync(path.join(dataDirectory, file), 'utf8'))));
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/calendars', { recursive: true });
for (const file of fs.readdirSync('site')) {
  if (file !== 'index.html') fs.copyFileSync(path.join('site', file), path.join('dist', file));
}
const siteUrl = (process.env.SITE_URL || 'https://ai-forecast-calendar.org').replace(/\/$/, '');
const template = fs.readFileSync('site/index.html', 'utf8');
const html = template.replaceAll('{{CANONICAL_URL}}', `${siteUrl}/`).replace('{{CALENDARS}}', forecasts.map(renderCalendar).join('\n'));
fs.writeFileSync('dist/index.html', html);
for (const calendar of forecasts) {
  const ics = generateIcs(calendar);
  const icsErrors = validateIcs(ics);
  if (icsErrors.length) throw new Error(`Invalid generated ICS: ${icsErrors.join(', ')}`);
  fs.writeFileSync(`dist/calendars/${calendar.id}.ics`, ics);
}
const manifest = forecasts.map(({ id, title, source_url: sourceUrl, milestones }) => ({ id, title, sourceUrl, milestoneCount: milestones.length }));
fs.writeFileSync('dist/calendars/index.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Built ${forecasts.length} calendar(s) into dist/`);
