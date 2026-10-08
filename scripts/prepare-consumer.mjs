import fs from "node:fs";
import { consumerPackage } from "./consumer-package.mjs";
const { packed, candidate } = consumerPackage();
const consumer = JSON.parse(fs.readFileSync("tests/consumer/package.json", "utf8"));
if (consumer.dependencies["rom-ui"] !== "file:../../" + candidate) {
  throw new Error("Packed source changed. Review the candidate and update the consumer manifest and lock explicitly.");
}
fs.writeFileSync(candidate, packed);
