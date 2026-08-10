#!/usr/bin/env node
const base = (process.argv[2] || process.env.DEPLOY_URL || '').replace(/\/+$/, '');
if (!base) { console.error('Usage: npm run smoke -- https://deployment.example'); process.exit(2); }
const expectedOrigin = process.env.SITE_URL || new URL(base).origin;
const expectedSiteUrl = `${expectedOrigin.replace(/\/+$/, '')}/`;

const failures = [];
async function check(path, contentType, bodyChecks = []) {
  let response;
  try { response = await fetch(`${base}${path}`, { redirect: 'follow' }); }
  catch (error) { failures.push(`${path}: request failed (${error.message})`); return; }
  const body = await response.text();
  if (!response.ok) failures.push(`${path}: returned ${response.status}`);
  if (!response.headers.get('content-type')?.toLowerCase().includes(contentType)) failures.push(`${path}: expected Content-Type containing ${contentType}, got ${response.headers.get('content-type')}`);
  for (const value of bodyChecks) if (!body.includes(value)) failures.push(`${path}: response does not contain ${value}`);
  console.log(`${response.status} ${path} (${response.headers.get('content-type')})`);
}

await check('/', 'text/html', [
  'AI Forecast Calendar',
  'https://ai-2027.com/',
  '/calendars/ai-2027.ics',
  `<link rel="canonical" href="${expectedSiteUrl}">`,
  `<meta property="og:url" content="${expectedSiteUrl}">`,
]);
await check('/calendars/ai-2027.ics', 'text/calendar', ['BEGIN:VCALENDAR', 'END:VCALENDAR', 'https://ai-2027.com/']);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('Deployment smoke check passed (landing, canonical/Open Graph metadata, source links, download/subscription path, and media types).');
