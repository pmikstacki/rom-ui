import fs from "node:fs";
import { consumerPackage } from "./consumer-package.mjs";
const { packed, candidate } = consumerPackage();
fs.writeFileSync(candidate, packed);
const path = "tests/consumer/package.json";
const consumer = JSON.parse(fs.readFileSync(path, "utf8"));
consumer.dependencies["rom-ui"] = "file:../../" + candidate;
fs.writeFileSync(path, JSON.stringify(consumer, null, 2) + "\n");
