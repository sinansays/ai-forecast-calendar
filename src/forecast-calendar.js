import { readFile } from "node:fs/promises";

const validatedForecast = Symbol("validated forecast");
const encoder = new TextEncoder();
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
export const PRECISIONS = new Set(["exact", "month", "year", "range", "ambiguous"]);

function validationErrors(input) {
  const errors = [];
  const required = (object, fields, at) => fields.forEach((field) => {
    if (typeof object?.[field] === "undefined" || object[field] === "" || object[field] === null) errors.push(`${at}.${field} is required`);
  });
  const strictDate = (value, at) => {
    if (!datePattern.test(value || "")) return errors.push(`${at} must be a strict YYYY-MM-DD date`);
    const parsed = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) errors.push(`${at} must be a real calendar date`);
  };
  const httpsUrl = (value, at) => {
    try { if (new URL(value).protocol !== "https:") throw new Error(); } catch { errors.push(`${at} must be an HTTPS URL`); }
  };

  if (!input || typeof input !== "object" || Array.isArray(input)) return ["forecast must be an object"];
  required(input, ["id", "title", "description", "source_url", "publication_date", "version", "attribution", "milestones"], "forecast");
  httpsUrl(input.source_url, "forecast.source_url");
  strictDate(input.publication_date, "forecast.publication_date");
  required(input.version, ["label", "snapshot_date", "notes"], "forecast.version");
  strictDate(input.version?.snapshot_date, "forecast.version.snapshot_date");
  required(input.attribution, ["authors", "organization", "display"], "forecast.attribution");
  if (!Array.isArray(input.attribution?.authors) || !input.attribution.authors.length) errors.push("forecast.attribution.authors must be non-empty");
  if (!Array.isArray(input.milestones) || !input.milestones.length) errors.push("forecast.milestones must be non-empty");

  const ids = new Set();
  for (const [index, milestone] of (input.milestones || []).entries()) {
    const at = `forecast.milestones[${index}]`;
    required(milestone, ["id", "title", "source_timing", "calendar_date", "date_precision", "summary", "source_context", "source_url", "normalization_rationale"], at);
    if (ids.has(milestone.id)) errors.push(`${at}.id is duplicated`);
    ids.add(milestone.id);
    strictDate(milestone.calendar_date, `${at}.calendar_date`);
    httpsUrl(milestone.source_url, `${at}.source_url`);
    if (!PRECISIONS.has(milestone.date_precision)) errors.push(`${at}.date_precision is invalid`);
    if (milestone.date_precision !== "exact" && !milestone.normalization_rationale) errors.push(`${at} approximate date requires normalization_rationale`);
  }
  return errors;
}

/** Return validation messages without changing the supplied canonical record. */
export function validateCanonical(input) {
  return validationErrors(input);
}

/** Validate untrusted canonical JSON and brand the immutable result for serialization. */
export function validateForecast(input) {
  const errors = validationErrors(input);
  if (errors.length) throw new TypeError(errors.join("\n"));
  const result = structuredClone(input);
  result.milestones = Object.freeze(result.milestones.map((milestone) => Object.freeze(milestone)));
  Object.defineProperty(result, validatedForecast, { value: true });
  return Object.freeze(result);
}

/** Reject forecast collections that would map more than one record to one feed. */
export function assertUniqueForecastIds(forecasts) {
  const ids = new Set();
  for (const forecast of forecasts) {
    if (ids.has(forecast.id)) throw new TypeError(`Duplicate forecast id: ${forecast.id}`);
    ids.add(forecast.id);
  }
}

export async function readCanonicalForecast(path) {
  return validateForecast(JSON.parse(await readFile(path, "utf8")));
}

export function escapeText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** Fold a content line at 75 UTF-8 octets without splitting a code point. */
export function foldLine(line) {
  const output = [];
  let part = "";
  let limit = 75;
  for (const character of line) {
    if (encoder.encode(part + character).length > limit) {
      output.push(part);
      part = character;
      limit = 74;
    } else part += character;
  }
  output.push(part);
  return output.join("\r\n ");
}

const compactDate = (date) => date.replaceAll("-", "");
const stableTimestamp = (forecast) => `${compactDate(forecast.version.snapshot_date)}T000000Z`;
function nextDate(date) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

function eventDescription(milestone) {
  const sections = [
    `Forecast: ${milestone.summary}`,
    `Source timing: ${milestone.source_timing}`,
    `Calendar anchor: ${milestone.calendar_date} (${milestone.normalization_rationale})`,
    `Source context: ${milestone.source_context}`,
  ];
  if (milestone.uncertainty) sections.push(`Forecast uncertainty: ${milestone.uncertainty}`);
  sections.push(`Source: ${milestone.source_url}`);
  return sections.join("\n\n");
}

export function generateIcs(forecast) {
  if (forecast?.[validatedForecast] !== true) throw new TypeError("generateIcs accepts only data returned by validateForecast/readCanonicalForecast");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AI Forecast Calendar//Forecast Milestones//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${escapeText(forecast.title)}`, `X-WR-CALDESC:${escapeText(forecast.description)}`];
  for (const milestone of forecast.milestones) {
    lines.push("BEGIN:VEVENT", `UID:${escapeText(`${forecast.id}.${milestone.id}@ai-forecast-calendar`)}`, `DTSTAMP:${stableTimestamp(forecast)}`, `DTSTART;VALUE=DATE:${compactDate(milestone.calendar_date)}`, `DTEND;VALUE=DATE:${compactDate(nextDate(milestone.calendar_date))}`, `SUMMARY:${escapeText(`${forecast.title}: ${milestone.title}`)}`, `DESCRIPTION:${escapeText(eventDescription(milestone))}`, `URL:${milestone.source_url}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
