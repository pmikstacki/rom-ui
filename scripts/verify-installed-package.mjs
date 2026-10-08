import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const installed = fs.realpathSync("node_modules/rom-ui");
const modules = fs.realpathSync("node_modules") + path.sep;
assert.ok(installed.startsWith(modules), "Package must live inside consumer node_modules, including pnpm's virtual store");
const source = path.resolve("../..");
function compare(relative) {
  for (const entry of fs.readdirSync(path.join(source, relative), { withFileTypes: true })) {
    const file = path.join(relative, entry.name);
    if (entry.isDirectory()) compare(file);
    else assert.deepEqual(fs.readFileSync(path.join(installed, file)), fs.readFileSync(path.join(source, file)), "Installed source differs: " + file);
  }
}
compare("src");
compare("dist/headless");
const consumer = JSON.parse(fs.readFileSync("package.json", "utf8"));
const archive = path.resolve(consumer.dependencies["rom-ui"].slice("file:".length));
assert.ok(archive.startsWith(source + path.sep), "Candidate must belong to this verifier source");
const packedManifest = JSON.parse(execFileSync("tar", ["-xOf", archive, "package/package.json"], { encoding: "utf8" }));
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(installed, "package.json"))), packedManifest, "Installed manifest differs from packed manifest");
console.log("Installed source and compiled headless modules match the packed candidate");
