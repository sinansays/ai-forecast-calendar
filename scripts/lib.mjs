export function validateIcs(text) {
  const errors = [];
  if (!text.endsWith('\r\n') || /(^|[^\r])\n/.test(text)) errors.push('file must use CRLF line endings and end with CRLF');
  for (const [i, line] of text.split('\r\n').entries()) if (Buffer.byteLength(line) > 75) errors.push(`physical line ${i + 1} exceeds 75 octets`);
  const unfolded = text.replace(/\r\n[ \t]/g, '').split('\r\n');
  for (const required of ['BEGIN:VCALENDAR', 'VERSION:2.0', 'END:VCALENDAR']) if (!unfolded.includes(required)) errors.push(`missing ${required}`);
  if (!unfolded.some(line => line.startsWith('PRODID:'))) errors.push('missing PRODID:');
  const events = unfolded.join('\n').match(/BEGIN:VEVENT\n[\s\S]*?\nEND:VEVENT/g) || [];
  if (!events.length) errors.push('calendar has no VEVENT');
  const uids = new Set();
  for (const [i, event] of events.entries()) for (const field of ['UID:', 'DTSTAMP:', 'DTSTART;VALUE=DATE:', 'DTEND;VALUE=DATE:', 'SUMMARY:', 'DESCRIPTION:', 'URL:']) {
    if (!event.split('\n').some(line => line.startsWith(field))) errors.push(`VEVENT ${i + 1} missing ${field}`);
    if (field === 'UID:') { const uid = event.split('\n').find(line => line.startsWith(field)); if (uids.has(uid)) errors.push(`VEVENT ${i + 1} has duplicate UID`); uids.add(uid); }
  }
  return errors;
}
