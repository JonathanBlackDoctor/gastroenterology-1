import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function readJavaScript(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(entries.map(async (entry) => {
    const target = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) return readJavaScript(target);
    return entry.name.endsWith(".js") ? readFile(target, "utf8") : "";
  }));
  return contents.join("\n");
}

const serverFile = await readJavaScript(new URL("../dist/server/", import.meta.url));

test("build includes the tracker identity and study surfaces", () => {
  assert.match(serverFile, /진도실/);
  assert.match(serverFile, /노트북 LM/);
  assert.match(serverFile, /예열/);
  assert.match(serverFile, /직후 회상/);
});

test("starter preview content is removed", () => {
  assert.doesNotMatch(serverFile, /SkeletonPreview/);
  assert.doesNotMatch(serverFile, /Starter Project/);
});
