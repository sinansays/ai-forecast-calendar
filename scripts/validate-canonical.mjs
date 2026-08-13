#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
export { PRECISIONS, validateCanonical } from '../src/forecast-calendar.js';
import { validateCanonical } from '../src/forecast-calendar.js';

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const inputs = process.argv.slice(2);
  const requested = inputs.length ? inputs : ['data/forecasts'];
  const files = requested.flatMap(input => fs.statSync(input).isDirectory()
    ? fs.readdirSync(input).filter(file => file.endsWith('.json')).sort().map(file => path.join(input, file))
    : [input]);
  if (!files.length) { console.error('No canonical JSON files found'); process.exit(2); }
  let failed = false;
  for (const file of files) {
    const errors = validateCanonical(JSON.parse(fs.readFileSync(file, 'utf8')));
    if (errors.length) { console.error(`${file}:\n${errors.join('\n')}`); failed = true; }
    else console.log(`Canonical forecast valid: ${file}`);
  }
  if (failed) process.exit(1);
}
