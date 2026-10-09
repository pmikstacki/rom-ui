import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

test("the document blocks tile redirects outside configured map origins", async ({ page }) => {
  let unapprovedRequests = 0;
  let redirects = 0;
  let receiver = "";
  const policy = readFileSync("dist/index.html", "utf8").match(/<meta http-equiv="Content-Security-Policy"[^>]*>/)?.[0];
  expect(policy).toBeTruthy();
  const target = createServer((_request, response) => {
    unapprovedRequests++;
    response.writeHead(200, { "Access-Control-Allow-Origin": "*" });
    response.end("unapproved");
  });
  await new Promise<void>(resolve => target.listen(0, "127.0.0.1", resolve));
  const targetAddress = target.address();
  if (!targetAddress || typeof targetAddress === "string") throw Error("Missing target address.");
  receiver = `http://127.0.0.1:${targetAddress.port}`;
  const server = createServer((request, response) => {
    if (request.url === "/worker.js") {
      response.writeHead(200, { "Content-Type": "text/javascript" });
      response.end(`onmessage = async () => { try { await fetch("http://${request.headers.host}/map-redirect-fixture"); postMessage(true); } catch { postMessage(false); } };`);
      return;
    }
    if (request.url !== "/map-redirect-fixture") {
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(`<!doctype html><html><head>${policy}</head><body>Controlled map policy receiver</body></html>`);
      return;
    }
    redirects++;
    response.writeHead(302, { location: `${receiver}/tile`, "Access-Control-Allow-Origin": "*" });
    response.end();
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("Missing controlled receiver address.");
  try {
  await page.goto(`http://127.0.0.1:${address.port}/`);
  const outcome = await page.evaluate(async () => {
    const violations: string[] = [];
    const listener = (event: SecurityPolicyViolationEvent) => violations.push(event.blockedURI);
    document.addEventListener("securitypolicyviolation", listener);
    let accepted = false;
    try { await fetch("/map-redirect-fixture"); accepted = true; }
    catch { /* The boundary must reject the redirected request. */ }
    await new Promise(resolve => setTimeout(resolve, 100));
    document.removeEventListener("securitypolicyviolation", listener);
    return { accepted, violations };
  });
  expect(outcome.accepted).toBe(false);
  expect(outcome.violations.length, JSON.stringify(outcome)).toBeGreaterThan(0);
  expect(redirects).toBe(1);
  expect(unapprovedRequests).toBe(0);
  const workerAccepted = await page.evaluate(async () => {
    const source = `import ${JSON.stringify(new URL("/worker.js", location.href).href)};`;
    const blob = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
    const worker = new Worker(blob, { type: "module" });
    try {
      return await new Promise<boolean>((resolve, reject) => {
        worker.onmessage = event => resolve(event.data);
        worker.onerror = event => reject(Error(event.message));
        worker.postMessage(null);
      });
    } finally { worker.terminate(); URL.revokeObjectURL(blob); }
  });
  expect(workerAccepted).toBe(false);
  expect(redirects).toBe(2);
  expect(unapprovedRequests).toBe(0);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await new Promise<void>((resolve, reject) => target.close(error => error ? reject(error) : resolve()));
  }
});
