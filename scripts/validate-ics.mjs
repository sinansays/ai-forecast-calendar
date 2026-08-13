#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { validateIcs } from './lib.mjs';
const inputs = process.argv.slice(2);
if (!inputs.length) { console.error('Usage: node scripts/validate-ics.mjs FILE_OR_DIRECTORY [...]'); process.exit(2); }
const files = inputs.flatMap(input => fs.statSync(input).isDirectory()
  ? fs.readdirSync(input).filter(file => file.endsWith('.ics')).sort().map(file => path.join(input, file))
  : [input]);
if (!files.length) { console.error('No iCalendar files found'); process.exit(2); }
let failed = false;
for (const file of files) {
  const errors = validateIcs(fs.readFileSync(file, 'utf8'));
  if (errors.length) { console.error(`${file}:\n${errors.join('\n')}`); failed = true; }
  else console.log(`iCalendar structure valid: ${file}`);
}
if (failed) process.exit(1);
