import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const [binary, assets, output] = process.argv.slice(2);
if (!binary || !assets || !output) throw Error("Expected binary, gallery assets, and new image context directory.");
if (fs.existsSync(output)) throw Error("Image context already exists.");
const dependencies = spawnSync("ldd", [binary], { encoding: "utf8" });
if (dependencies.status !== 0 || dependencies.stdout.includes("not found")) throw Error("Cannot resolve host runtime dependencies.");
const libraries = [...new Set(dependencies.stdout.match(/\/nix\/store\/[^\s()]+/g) ?? [])];
if (!libraries.length) throw Error("This image preparer requires the verified Nix-linked host binary.");
fs.mkdirSync(output, { recursive: true });
const hashes = {};
function copy(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  hashes[path.relative(output, target)] = crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex");
}
for (const library of libraries) copy(library, path.join(output, "runtime", library));
const executable = path.join(output, "runtime/gallery/rom-ui-gallery-host");
copy(binary, executable);
fs.chmodSync(executable, 0o755);
copy("/etc/ssl/certs/ca-certificates.crt", path.join(output, "runtime/etc/ssl/certs/ca-certificates.crt"));
function copyAssets(directory, target) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    const destination = path.join(target, entry.name);
    if (entry.isDirectory()) copyAssets(source, destination);
    else if (entry.isFile()) copy(source, destination);
    else throw Error("Gallery assets must contain only regular files and directories.");
  }
}
copyAssets(assets, path.join(output, "assets"));
copy(new URL("host.Dockerfile", import.meta.url), path.join(output, "Dockerfile"));
fs.writeFileSync(path.join(output, "runtime-inputs.json"), JSON.stringify(hashes, null, 2) + "\n");
console.log(`Prepared ${libraries.length} runtime libraries and the host binary.`);
