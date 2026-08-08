import { isValidatedForecast } from "./forecast-data.js";

const encoder = new TextEncoder();

export function escapeText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** Fold a content line at 75 UTF-8 octets without splitting a Unicode code point. */
export function foldLine(line) {
  const output = [];
  let part = "";
  let limit = 75;
  for (const character of line) {
    if (encoder.encode(part + character).length > limit) {
      output.push(part);
      part = character;
      limit = 74; // continuation whitespace consumes one octet
    } else {
      part += character;
    }
  }
  output.push(part);
  return output.join("\r\n ");
}

function compactDate(date) {
  return date.replaceAll("-", "");
}

function nextDate(date) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function stableTimestamp(date) {
  return `${compactDate(date)}T000000Z`;
}

function description(forecast, milestone) {
  const sections = [
    `Forecast: ${milestone.description}`,
    `Source timing: ${milestone.source_timing}`,
    `Calendar anchor: ${milestone.calendar_anchor}`,
    `Context: ${milestone.context}`
  ];
  if (milestone.uncertainty) sections.push(`Forecast uncertainty: ${milestone.uncertainty}`);
  sections.push(`Source: ${milestone.source_url}`);
  return sections.join("\n\n");
}

export function generateIcs(forecast) {
  if (!isValidatedForecast(forecast)) {
    throw new TypeError("generateIcs accepts only data returned by validateForecast/readCanonicalForecast");
  }
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Forecast Calendar//Forecast Milestones//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(forecast.title)}`,
    `X-WR-CALDESC:${escapeText(forecast.description)}`
  ];
  for (const milestone of forecast.milestones) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeText(`${forecast.id}.${milestone.id}@ai-forecast-calendar`)}`,
      `DTSTAMP:${stableTimestamp(forecast.published_at)}`,
      `DTSTART;VALUE=DATE:${compactDate(milestone.calendar_date)}`,
      `DTEND;VALUE=DATE:${compactDate(nextDate(milestone.calendar_date))}`,
      `SUMMARY:${escapeText(`${forecast.title}: ${milestone.title}`)}`,
      `DESCRIPTION:${escapeText(description(forecast, milestone))}`,
      `URL:${milestone.source_url}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
