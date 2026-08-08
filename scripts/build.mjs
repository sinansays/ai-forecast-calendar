import fs from 'node:fs';
import path from 'node:path';
import { generateIcs, readData, validateData, validateIcs } from './lib.mjs';

const data = readData();
const errors = validateData(data);
if (errors.length) throw new Error(`Invalid forecast data:\n${errors.join('\n')}`);
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/calendars', { recursive: true });
for (const file of fs.readdirSync('site')) fs.copyFileSync(path.join('site', file), path.join('dist', file));
for (const calendar of data.calendars) {
  const ics = generateIcs(calendar);
  const icsErrors = validateIcs(ics);
  if (icsErrors.length) throw new Error(`Invalid generated ICS: ${icsErrors.join(', ')}`);
  fs.writeFileSync(`dist/calendars/${calendar.id}.ics`, ics);
}
const manifest = data.calendars.map(({ id, title, sourceUrl, milestones }) => ({ id, title, sourceUrl, milestoneCount: milestones.length }));
fs.writeFileSync('dist/calendars/index.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Built ${data.calendars.length} calendar(s) into dist/`);
