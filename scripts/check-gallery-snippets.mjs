import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { componentExamples } from "../gallery/src/component-examples.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = fs.mkdtempSync(
  path.join(os.tmpdir(), "rom-ui-gallery-snippets-"),
);
fs.mkdirSync(path.join(fixture, "src"));
fs.symlinkSync(
  path.join(root, "gallery/node_modules"),
  path.join(fixture, "node_modules"),
);
fs.copyFileSync(
  path.join(root, "gallery/tsconfig.json"),
  path.join(fixture, "tsconfig.json"),
);
fs.writeFileSync(
  path.join(fixture, "src/styles.d.ts"),
  'declare module "rom-ui/styles";\ndeclare module "@xyflow/svelte/dist/style.css";\n',
);
let count = 0;
for (const [category, examples] of Object.entries(componentExamples)) {
  for (const example of examples) {
    const filename = path.join(
      fixture,
      "src",
      `${category}-${example.name}.svelte`,
    );
    compile(example.code, { filename, generate: "client" });
    fs.writeFileSync(filename, example.code);
    count++;
  }
}
console.log(
  `Checking ${count} copyable examples against the installed archive: ${fixture}`,
);
const result = spawnSync(
  "corepack",
  [
    "pnpm",
    "--dir",
    path.join(root, "gallery"),
    "exec",
    "svelte-check",
    "--workspace",
    fixture,
    "--tsconfig",
    path.join(fixture, "tsconfig.json"),
  ],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
