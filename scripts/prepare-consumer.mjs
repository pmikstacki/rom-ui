import fs from "node:fs";
import crypto from "node:crypto";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const packed = fs.readFileSync(pkg.name + "-" + pkg.version + ".tgz");
const hash = crypto.createHash("sha256").update(packed).digest("hex");
const candidate = "rom-ui-" + hash + ".tgz";
const consumer = JSON.parse(fs.readFileSync("tests/consumer/package.json", "utf8"));
if (consumer.dependencies["rom-ui"] !== "file:../../" + candidate) {
  throw new Error("Packed source changed. Review the candidate and update the consumer manifest and lock explicitly.");
}
fs.writeFileSync(candidate, packed);
