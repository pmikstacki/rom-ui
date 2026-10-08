import fs from "node:fs";
import crypto from "node:crypto";

/** Name each installed candidate by its packed bytes, avoiding stale npm file caches. */
export function consumerPackage() {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const packed = fs.readFileSync(pkg.name + "-" + pkg.version + ".tgz");
  const hash = crypto.createHash("sha256").update(packed).digest("hex");
  return { packed, candidate: "rom-ui-" + hash + ".tgz" };
}
