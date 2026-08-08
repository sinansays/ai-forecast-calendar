#!/usr/bin/env node
import fs from 'node:fs';

export const PRECISIONS = new Set(['exact', 'month', 'year', 'range', 'ambiguous']);

export function validateCanonical(record) {
  const errors = [];
  const required = (object, fields, at) => fields.forEach(field => {
    if (typeof object?.[field] === 'undefined' || object[field] === '' || object[field] === null) errors.push(`${at}.${field} is required`);
  });
  const strictDate = (value, at) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return errors.push(`${at} must be a strict YYYY-MM-DD date`);
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) errors.push(`${at} must be a real calendar date`);
  };
  const httpsUrl = (value, at) => { try { if (new URL(value).protocol !== 'https:') throw new Error(); } catch { errors.push(`${at} must be an HTTPS URL`); } };

  required(record, ['id', 'title', 'description', 'source_url', 'publication_date', 'version', 'attribution', 'milestones'], 'forecast');
  httpsUrl(record?.source_url, 'forecast.source_url');
  strictDate(record?.publication_date, 'forecast.publication_date');
  required(record?.version, ['label', 'snapshot_date', 'notes'], 'forecast.version');
  strictDate(record?.version?.snapshot_date, 'forecast.version.snapshot_date');
  required(record?.attribution, ['authors', 'organization', 'display'], 'forecast.attribution');
  if (!Array.isArray(record?.attribution?.authors) || !record.attribution.authors.length) errors.push('forecast.attribution.authors must be non-empty');
  if (!Array.isArray(record?.milestones) || !record.milestones.length) errors.push('forecast.milestones must be non-empty');

  const ids = new Set();
  for (const [index, milestone] of (record?.milestones || []).entries()) {
    const at = `forecast.milestones[${index}]`;
    required(milestone, ['id', 'title', 'source_timing', 'calendar_date', 'date_precision', 'summary', 'source_context', 'source_url', 'normalization_rationale'], at);
    if (ids.has(milestone.id)) errors.push(`${at}.id is duplicated`);
    ids.add(milestone.id);
    strictDate(milestone.calendar_date, `${at}.calendar_date`);
    httpsUrl(milestone.source_url, `${at}.source_url`);
    if (!PRECISIONS.has(milestone.date_precision)) errors.push(`${at}.date_precision is invalid`);
    if (milestone.date_precision !== 'exact' && !milestone.normalization_rationale) errors.push(`${at} approximate date requires normalization_rationale`);
  }
  return errors;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const path = process.argv[2] || 'data/forecasts/ai-2027.json';
  const errors = validateCanonical(JSON.parse(fs.readFileSync(path, 'utf8')));
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`Canonical forecast valid: ${path}`);
}
