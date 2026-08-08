import { readdir, readFile } from "node:fs/promises";

export default async function () {
  const directory = new URL("./forecasts/", import.meta.url);
  const filenames = (await readdir(directory))
    .filter((filename) => filename.endsWith(".json"))
    .sort();

  return Promise.all(
    filenames.map(async (filename) =>
      JSON.parse(await readFile(new URL(filename, directory), "utf8"))
    )
  );
}
