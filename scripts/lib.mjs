import fs from 'node:fs';

export function readData(path = 'data/forecasts.json') {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function validateData(data) {
  const errors = [];
  if (!data || data.schemaVersion !== 1 || !Array.isArray(data.calendars)) errors.push('root must have schemaVersion 1 and calendars array');
  const calendarIds = new Set();
  for (const [ci, calendar] of (data?.calendars || []).entries()) {
    const at = `calendars[${ci}]`;
    required(calendar, ['id', 'title', 'description', 'sourceUrl', 'publishedAt', 'milestones'], at, errors);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(calendar.id || '')) errors.push(`${at}.id must be a stable slug`);
    if (calendarIds.has(calendar.id)) errors.push(`${at}.id is duplicated`); calendarIds.add(calendar.id);
    url(calendar.sourceUrl, `${at}.sourceUrl`, errors); date(calendar.publishedAt, `${at}.publishedAt`, errors);
    if (!Array.isArray(calendar.milestones) || calendar.milestones.length === 0) errors.push(`${at}.milestones must be non-empty`);
    const eventIds = new Set();
    for (const [mi, event] of (calendar.milestones || []).entries()) {
      const ep = `${at}.milestones[${mi}]`;
      required(event, ['id', 'title', 'sourceTiming', 'calendarDate', 'datePrecision', 'description', 'sourceUrl'], ep, errors);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.id || '')) errors.push(`${ep}.id must be a stable slug`);
      if (eventIds.has(event.id)) errors.push(`${ep}.id is duplicated`); eventIds.add(event.id);
      date(event.calendarDate, `${ep}.calendarDate`, errors); url(event.sourceUrl, `${ep}.sourceUrl`, errors);
      if (!['exact', 'month', 'year', 'range', 'inferred'].includes(event.datePrecision)) errors.push(`${ep}.datePrecision is invalid`);
    }
  }
  return errors;
}

function required(object, keys, path, errors) { for (const key of keys) if (!(key in (object || {})) || object[key] === '') errors.push(`${path}.${key} is required`); }
function date(value, path, errors) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) errors.push(`${path} must be YYYY-MM-DD`); }
function url(value, path, errors) { try { if (new URL(value).protocol !== 'https:') throw Error(); } catch { errors.push(`${path} must be an HTTPS URL`); } }

const escapeIcs = value => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
const day = value => value.replaceAll('-', '');
function fold(line) {
  const chunks = [];
  let current = '';
  for (const char of line) {
    const candidate = current + char;
    if (Buffer.byteLength(candidate) > (chunks.length ? 74 : 75)) { chunks.push(current); current = char; } else current = candidate;
  }
  chunks.push(current);
  return chunks.join('\r\n ');
}

export function generateIcs(calendar) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AI Forecast Calendar//EN', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${escapeIcs(calendar.title)}`];
  for (const event of [...calendar.milestones].sort((a, b) => a.calendarDate.localeCompare(b.calendarDate) || a.id.localeCompare(b.id))) {
    const next = new Date(`${event.calendarDate}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
    const description = `Forecast: ${event.description}\n\nSource timing: ${event.sourceTiming}\nCalendar anchor: ${event.calendarDate}\n\nSource:\n${event.sourceUrl}`;
    lines.push('BEGIN:VEVENT', `UID:${event.id}@${calendar.id}.ai-forecast-calendar`, `DTSTAMP:${calendar.publishedAt.replaceAll('-', '')}T000000Z`, `DTSTART;VALUE=DATE:${day(event.calendarDate)}`, `DTEND;VALUE=DATE:${day(next.toISOString().slice(0, 10))}`, `SUMMARY:${escapeIcs(`${calendar.title}: ${event.title}`)}`, `DESCRIPTION:${escapeIcs(description)}`, `URL:${event.sourceUrl}`, 'TRANSP:TRANSPARENT', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function validateIcs(text) {
  const errors = [];
  if (!text.endsWith('\r\n') || /(^|[^\r])\n/.test(text)) errors.push('file must use CRLF line endings and end with CRLF');
  for (const [i, line] of text.split('\r\n').entries()) if (Buffer.byteLength(line) > 75) errors.push(`physical line ${i + 1} exceeds 75 octets`);
  const unfolded = text.replace(/\r\n[ \t]/g, '').split('\r\n');
  for (const required of ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AI Forecast Calendar//EN', 'END:VCALENDAR']) if (!unfolded.includes(required)) errors.push(`missing ${required}`);
  const events = unfolded.join('\n').match(/BEGIN:VEVENT\n[\s\S]*?\nEND:VEVENT/g) || [];
  if (!events.length) errors.push('calendar has no VEVENT');
  const uids = new Set();
  for (const [i, event] of events.entries()) for (const field of ['UID:', 'DTSTAMP:', 'DTSTART;VALUE=DATE:', 'DTEND;VALUE=DATE:', 'SUMMARY:', 'DESCRIPTION:', 'URL:']) {
    if (!event.split('\n').some(line => line.startsWith(field))) errors.push(`VEVENT ${i + 1} missing ${field}`);
    if (field === 'UID:') { const uid = event.split('\n').find(line => line.startsWith(field)); if (uids.has(uid)) errors.push(`VEVENT ${i + 1} has duplicate UID`); uids.add(uid); }
  }
  return errors;
}
