#!/usr/bin/env node
import { readData, validateData } from './lib.mjs';
const path = process.argv[2] || 'data/forecasts.json';
const errors = validateData(readData(path));
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Forecast schema valid: ${path}`);
