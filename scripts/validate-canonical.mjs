#!/usr/bin/env node
import fs from 'node:fs';
export { PRECISIONS, validateCanonical } from '../src/forecast-calendar.js';
import { validateCanonical } from '../src/forecast-calendar.js';

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const path = process.argv[2] || 'data/forecasts/ai-2027.json';
  const errors = validateCanonical(JSON.parse(fs.readFileSync(path, 'utf8')));
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`Canonical forecast valid: ${path}`);
}
