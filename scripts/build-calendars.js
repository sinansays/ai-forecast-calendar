import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

const dataDirectory = new URL("../src/_data/forecasts/", import.meta.url);
const outputDirectory = new URL("../public/calendars/", import.meta.url);
const text = (value = "") => String(value)
  .replaceAll("\\", "\\\\")
  .replaceAll("\n", "\\n")
  .replaceAll(",", "\\,")
  .replaceAll(";", "\\;");
const date = (value) => value.replaceAll("-", "");
const fold = (line) => {
  const chunks = [];
  let remaining = line;
  while (Buffer.byteLength(remaining, "utf8") > 75) {
    let end = 75;
    while (Buffer.byteLength(remaining.slice(0, end), "utf8") > 75) end -= 1;
    chunks.push(remaining.slice(0, end));
    remaining = ` ${remaining.slice(end)}`;
  }
  return [...chunks, remaining].join("\r\n");
};

await mkdir(outputDirectory, { recursive: true });
const files = (await readdir(dataDirectory)).filter((name) => name.endsWith(".json")).sort();

for (const filename of files) {
  const forecast = JSON.parse(await readFile(new URL(filename, dataDirectory), "utf8"));
  const events = forecast.milestones.map((milestone) => {
    const description = [
      `Forecast: ${milestone.description}`,
      `Source timing: ${milestone.source_timing}`,
      `Calendar anchor: ${milestone.calendar_date}`,
      milestone.uncertainty && `Forecast probability / uncertainty: ${milestone.uncertainty}`,
      `Source: ${milestone.source_url || forecast.source_url}`
    ].filter(Boolean).join("\n\n");

    return [
      "BEGIN:VEVENT",
      `UID:${text(`${forecast.id}-${milestone.id}@ai-forecast-calendar`)}`,
      `DTSTAMP:${date(forecast.generated_at || `${forecast.published_at}T000000Z`).replaceAll(":", "")}`,
      `DTSTART;VALUE=DATE:${date(milestone.calendar_date)}`,
      `DTEND;VALUE=DATE:${date(milestone.calendar_date)} `,
      `SUMMARY:${text(`${forecast.title}: ${milestone.title}`)}`,
      `DESCRIPTION:${text(description)}`,
      `URL:${text(milestone.source_url || forecast.source_url)}`,
      "END:VEVENT"
    ];
  });

  // Date-only DTEND is exclusive; omit it rather than imply an incorrect duration.
  for (const event of events) event.splice(4, 1);
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Forecast Calendar//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${text(forecast.title)}`,
    ...events.flat(),
    "END:VCALENDAR",
    ""
  ].map(fold).join("\r\n");

  await writeFile(new URL(`${forecast.id}.ics`, outputDirectory), calendar);
}
