import { readFile } from "node:fs/promises";

const validatedForecast = Symbol("validated forecast");
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function fail(path, message) {
  throw new TypeError(`${path}: ${message}`);
}

function text(value, path) {
  if (typeof value !== "string" || value.trim() === "") fail(path, "must be a non-empty string");
  return value;
}

function date(value, path) {
  text(value, path);
  if (!datePattern.test(value)) fail(path, "must use YYYY-MM-DD");
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) fail(path, "must be a real date");
  return value;
}

function url(value, path) {
  text(value, path);
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
  } catch {
    fail(path, "must be an HTTP(S) URL");
  }
  return value;
}

/** Validate untrusted JSON and return the only value accepted by the ICS generator. */
export function validateForecast(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) fail("forecast", "must be an object");
  const ids = new Set();
  const milestones = input.milestones;
  if (!Array.isArray(milestones) || milestones.length === 0) fail("milestones", "must be a non-empty array");

  const result = {
    id: text(input.id, "id"),
    title: text(input.title, "title"),
    description: text(input.description, "description"),
    source_url: url(input.source_url, "source_url"),
    published_at: date(input.published_at, "published_at"),
    milestones: milestones.map((item, index) => {
      const path = `milestones[${index}]`;
      if (!item || typeof item !== "object" || Array.isArray(item)) fail(path, "must be an object");
      const id = text(item.id, `${path}.id`);
      if (ids.has(id)) fail(`${path}.id`, "must be unique within the forecast");
      ids.add(id);
      const milestone = {
        id,
        title: text(item.title, `${path}.title`),
        calendar_date: date(item.calendar_date, `${path}.calendar_date`),
        source_timing: text(item.source_timing, `${path}.source_timing`),
        calendar_anchor: text(item.calendar_anchor, `${path}.calendar_anchor`),
        description: text(item.description, `${path}.description`),
        context: text(item.context, `${path}.context`),
        source_url: url(item.source_url, `${path}.source_url`)
      };
      if (item.uncertainty !== undefined) milestone.uncertainty = text(item.uncertainty, `${path}.uncertainty`);
      return Object.freeze(milestone);
    })
  };
  result.milestones = Object.freeze(result.milestones);
  Object.defineProperty(result, validatedForecast, { value: true });
  return Object.freeze(result);
}

export async function readCanonicalForecast(path) {
  return validateForecast(JSON.parse(await readFile(path, "utf8")));
}

export function isValidatedForecast(value) {
  return value?.[validatedForecast] === true;
}
