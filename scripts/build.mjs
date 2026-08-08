import fs from 'node:fs';
import path from 'node:path';
import { generateIcs, readData, validateData, validateIcs } from './lib.mjs';

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const formatDate = value => new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
const renderCalendar = calendar => {
  const milestones = [...calendar.milestones].sort((a, b) => a.calendarDate.localeCompare(b.calendarDate));
  const path = `/calendars/${encodeURIComponent(calendar.id)}.ics`;
  const preview = milestones.slice(0, 5).map(item => `<li><time datetime="${escapeHtml(item.calendarDate)}">${escapeHtml(formatDate(item.calendarDate))}</time><strong>${escapeHtml(item.title)}</strong></li>`).join('');
  return `<article class="calendar" aria-labelledby="${escapeHtml(calendar.id)}-title">
    <div>
      <p class="range">${escapeHtml(formatDate(milestones[0].calendarDate))} — ${escapeHtml(formatDate(milestones.at(-1).calendarDate))} · ${milestones.length} milestones</p>
      <h3 id="${escapeHtml(calendar.id)}-title">${escapeHtml(calendar.title)}</h3>
      <p class="description">${escapeHtml(calendar.description)}</p>
      <dl class="metadata"><dt>By</dt><dd><a href="${escapeHtml(calendar.sourceUrl)}">${escapeHtml(calendar.title)} authors — original publication</a></dd><dt>Published</dt><dd><time datetime="${escapeHtml(calendar.publishedAt)}">${escapeHtml(formatDate(calendar.publishedAt))}</time></dd><dt>Date range</dt><dd>${escapeHtml(formatDate(milestones[0].calendarDate))} to ${escapeHtml(formatDate(milestones.at(-1).calendarDate))}</dd><dt>Events</dt><dd>${milestones.length} all-day milestones</dd></dl>
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

const data = readData();
const errors = validateData(data);
if (errors.length) throw new Error(`Invalid forecast data:\n${errors.join('\n')}`);
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/calendars', { recursive: true });
for (const file of fs.readdirSync('site')) {
  if (file !== 'index.html') fs.copyFileSync(path.join('site', file), path.join('dist', file));
}
const siteUrl = (process.env.SITE_URL || 'https://ai-forecast-calendar.org').replace(/\/$/, '');
const template = fs.readFileSync('site/index.html', 'utf8');
const html = template.replaceAll('{{CANONICAL_URL}}', `${siteUrl}/`).replace('{{CALENDARS}}', data.calendars.map(renderCalendar).join('\n'));
fs.writeFileSync('dist/index.html', html);
for (const calendar of data.calendars) {
  const ics = generateIcs(calendar);
  const icsErrors = validateIcs(ics);
  if (icsErrors.length) throw new Error(`Invalid generated ICS: ${icsErrors.join(', ')}`);
  fs.writeFileSync(`dist/calendars/${calendar.id}.ics`, ics);
}
const manifest = data.calendars.map(({ id, title, sourceUrl, milestones }) => ({ id, title, sourceUrl, milestoneCount: milestones.length }));
fs.writeFileSync('dist/calendars/index.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Built ${data.calendars.length} calendar(s) into dist/`);
