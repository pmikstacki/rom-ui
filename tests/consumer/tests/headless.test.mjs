import test from "node:test";
import assert from "node:assert/strict";
import { createSelection, createLatestRequest, captureExportSnapshot, validateLayout } from "rom-ui/ui";

test("installed headless package retains exact IDs, large integers and immutable export context", () => {
  const id = '  α/["local","human","alice"]  ';
  const selection = createSelection({ ids: [id], initial: [], multiple: false });
  selection.toggle(id);
  assert.deepEqual(selection.selected, [id]);
  const value = { count: 9007199254740993n };
  const snapshot = captureExportSnapshot({
    identity: { principal: null, authorityTicket: "public", resource: { kind: "document", id, revision: 9007199254740993n }, selectedDate: null, format: "text", locale: "pl-PL" },
    value, clone: (source) => ({ ...source }),
  });
  value.count = 0n;
  assert.equal(snapshot.value.count, 9007199254740993n);
  assert.equal(snapshot.identity.resource.id, id);
  assert.equal(snapshot.identity.resource.revision, 9007199254740993n);
  assert.throws(() => { snapshot.identity.resource.id = "other"; });
  assert.deepEqual(validateLayout([], { columns: 4, maxRows: 10, maxItems: 2, catalog: [] }), { valid: true, layout: [] });
});

test("installed latest request settles superseded callers and fences late work", async () => {
  const states = [];
  const latest = createLatestRequest({ clone: value => value, classifyError: () => "Unavailable", onState: state => states.push(state) });
  let release;
  const old = latest.run("old", () => new Promise(resolve => { release = resolve; }));
  await latest.run("current", async () => "current value");
  await old;
  release("old private value");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(states.at(-1).identity, "current");
  assert.equal(states.at(-1).value, "current value");
  latest.dispose();
});
