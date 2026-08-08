import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateForecast } from "../src/forecast-data.js";
import { escapeText, foldLine, generateIcs } from "../src/ics.js";

const fixture = {
  id: "forecast-stable",
  title: "Forecast, One; 测试",
  description: "A deterministic calendar fixture.",
  source_url: "https://example.com/forecast",
  published_at: "2024-02-29",
  milestones: [{
    id: "milestone-stable",
    title: "Unicode 🚀, punctuation; and escaping",
    calendar_date: "2027-12-31",
    source_timing: "Late 2027",
    calendar_anchor: "December 31, 2027",
    description: "A backslash \\ and a line\nbreak, with commas; semicolons.",
    context: "多言語 content ".repeat(12),
    uncertainty: "Roughly 50%; explicitly stated.",
    source_url: "https://example.com/forecast#milestone"
  }]
};

test("only validated canonical data can be generated", () => {
  assert.throws(() => generateIcs(fixture), /only data returned/);
  assert.throws(() => validateForecast({ ...fixture, milestones: [] }), /non-empty array/);
  assert.throws(() => validateForecast({ ...fixture, published_at: "2024-02-30" }), /real date/);
});

test("escapes all iCalendar TEXT special characters", () => {
  assert.equal(escapeText("a\\b,c;d\r\ne"), "a\\\\b\\,c\\;d\\ne");
});

test("generation is deterministic and has stable identity and all-day semantics", () => {
  const first = generateIcs(validateForecast(structuredClone(fixture)));
  const second = generateIcs(validateForecast(structuredClone(fixture)));
  assert.equal(first, second);
  assert.match(first, /UID:forecast-stable\.milestone-stable@ai-forecast-calendar\r\n/);
  assert.match(first, /DTSTAMP:20240229T000000Z\r\n/);
  assert.match(first, /DTSTART;VALUE=DATE:20271231\r\nDTEND;VALUE=DATE:20280101\r\n/);
  assert.match(first, /SUMMARY:Forecast\\, One\\; 测试: Unicode 🚀\\, punctuation\\; and escaping/);
  assert.match(first, /Forecast uncertainty: Roughly 50%\\; explicitly stated/);
  assert.doesNotMatch(first, /(?<!\r)\n/);
});

test("folds Unicode content lines to no more than 75 UTF-8 octets", () => {
  const folded = foldLine(`DESCRIPTION:${"é🚀漢字".repeat(30)}`);
  const physicalLines = folded.split("\r\n");
  assert.ok(physicalLines.length > 1);
  for (const line of physicalLines) assert.ok(Buffer.byteLength(line) <= 75, `${Buffer.byteLength(line)} octets`);
  assert.ok(physicalLines.slice(1).every((line) => line.startsWith(" ")));
});

test("fixture matches the committed golden calendar and required properties", async () => {
  const actual = generateIcs(validateForecast(fixture));
  const golden = await readFile(new URL("fixtures/expected.ics", import.meta.url), "utf8");
  assert.equal(actual, golden);
  for (const property of ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", "UID:", "DTSTAMP:", "DTSTART;VALUE=DATE:", "DTEND;VALUE=DATE:", "SUMMARY:", "DESCRIPTION:", "URL:", "END:VEVENT", "END:VCALENDAR"]) {
    assert.ok(actual.includes(property), `missing ${property}`);
  }
});
