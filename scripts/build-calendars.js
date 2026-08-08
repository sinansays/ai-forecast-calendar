import { mkdir, writeFile } from "node:fs/promises";
import { readCanonicalForecast } from "../src/forecast-data.js";
import { generateIcs } from "../src/ics.js";

const forecast = await readCanonicalForecast(new URL("../data/forecasts/ai-2027.json", import.meta.url));
await mkdir(new URL("../public/calendars/", import.meta.url), { recursive: true });
await writeFile(new URL("../public/calendars/ai-2027.ics", import.meta.url), generateIcs(forecast), "utf8");
