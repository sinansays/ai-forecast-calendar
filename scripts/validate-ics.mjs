#!/usr/bin/env node
import fs from 'node:fs';
import { validateIcs } from './lib.mjs';
const path = process.argv[2];
if (!path) { console.error('Usage: node scripts/validate-ics.mjs FILE.ics'); process.exit(2); }
const errors = validateIcs(fs.readFileSync(path, 'utf8'));
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`iCalendar structure valid: ${path}`);
