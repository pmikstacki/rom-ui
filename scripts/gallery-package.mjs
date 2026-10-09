import fs from "node:fs";
import { consumerPackage } from "./consumer-package.mjs";
const { packed, candidate } = consumerPackage();
fs.writeFileSync(candidate, packed);
const path = "gallery/package.json";
const manifest = JSON.parse(fs.readFileSync(path, "utf8"));
const expected = "file:../" + candidate;
if (process.argv.includes("--check") && manifest.dependencies["rom-ui"] !== expected)
  throw new Error("Gallery archive differs from the pinned consumer; update it explicitly.");
manifest.dependencies["rom-ui"] = expected;
fs.writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n");
