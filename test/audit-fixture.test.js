import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const fixtureUrl = new URL("./fixtures/audit/ai-2027-f876779.ics", import.meta.url);
const manifestUrl = new URL("./fixtures/audit/ai-2027-f876779.json", import.meta.url);

test("the pre-reconciliation AI 2027 feed audit fixture is intact", async () => {
  const [fixture, manifestText] = await Promise.all([
    readFile(fixtureUrl),
    readFile(manifestUrl, "utf8"),
  ]);
  const manifest = JSON.parse(manifestText);
  const uids = fixture
    .toString("utf8")
    .split("\r\n")
    .filter((line) => line.startsWith("UID:"))
    .map((line) => line.slice(4));

  assert.equal(fixture.byteLength, manifest.byte_length);
  assert.equal(createHash("sha256").update(fixture).digest("hex"), manifest.sha256);
  assert.deepEqual(uids, manifest.uids);
});
