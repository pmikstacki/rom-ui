import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createFlexController } from '../../src/lib/flex/controller.ts';

const deferred = () => { let resolve!: () => void; const promise = new Promise<void>(r => { resolve = r; }); return { promise, resolve }; };
test('fallback commits caller state and animates', async () => {
  let state = 'list'; let animated = 0;
  const flex = createFlexController({ animate: async () => { animated++; } });
  assert.equal(await flex.run(() => { state = 'detail'; }), 'finished');
  assert.equal(state, 'detail'); assert.equal(animated, 1);
});
test('reduced motion commits without animation', async () => {
  let committed = false;
  const flex = createFlexController({ reducedMotion: () => true, animate: async () => { throw Error('animation'); } });
  await flex.run(() => { committed = true; }); assert.equal(committed, true);
});
test('rejected host update propagates and the next update works', async () => {
  const flex = createFlexController({ animate: async () => {} });
  await assert.rejects(flex.run(() => { throw Error('host rejected'); }), /host rejected/);
  assert.equal(await flex.run(() => {}), 'finished');
});
test('rapid switches are serialized without stale commits', async () => {
  const gate = deferred(); const states: number[] = []; let count = 0;
  const flex = createFlexController({ animate: () => ++count === 1 ? gate.promise : Promise.resolve() });
  const first = flex.run(() => { states.push(1); });
  const second = flex.run(() => { states.push(2); });
  await new Promise(r => setImmediate(r)); assert.deepEqual(states, [1]);
  gate.resolve(); await Promise.all([first, second]); assert.deepEqual(states, [1, 2]);
});
test('destroy cancels active animation and prevents queued updates', async () => {
  const gate = deferred(); let updates = 0; let cancelled = 0;
  const flex = createFlexController({ animate: () => gate.promise, cancel: () => { cancelled++; } });
  const first = flex.run(() => { updates++; }); const second = flex.run(() => { updates++; });
  await new Promise(r => setImmediate(r)); flex.destroy();
  assert.deepEqual(await Promise.all([first, second]), ['disposed', 'disposed']);
  assert.equal(updates, 1); assert.equal(cancelled, 1);
});
test('native snapshot callback commits once and skips fallback', async () => {
  let updates = 0; let animations = 0;
  const flex = createFlexController({ animate: async () => { animations++; }, startViewTransition: update => {
    const updated = Promise.resolve().then(update);
    return { updateCallbackDone: updated, finished: updated, skipTransition() {} };
  } });
  await flex.run(() => { updates++; }); assert.equal(updates, 1); assert.equal(animations, 0);
});
test('native animation rejection falls back without repeating host update', async () => {
  let updates = 0; let animations = 0;
  const flex = createFlexController({ animate: async () => { animations++; }, startViewTransition: update => {
    const updated = Promise.resolve().then(update);
    return { updateCallbackDone: updated, finished: updated.then(() => { throw Error('snapshot failed'); }), skipTransition() {} };
  } });
  await flex.run(() => { updates++; }); assert.equal(updates, 1); assert.equal(animations, 1);
});
test('native update rejection propagates without a fallback commit', async () => {
  let animated = 0;
  const flex = createFlexController({ animate: async () => { animated++; }, startViewTransition: update => {
    const updated = Promise.resolve().then(update);
    return { updateCallbackDone: updated, finished: updated, skipTransition() {} };
  } });
  await assert.rejects(flex.run(() => { throw Error('denied'); }), /denied/); assert.equal(animated, 0);
});
test('destroy before a delayed snapshot callback prevents host mutation', async () => {
  const gate = deferred(); let updates = 0; let skipped = 0;
  const flex = createFlexController({ animate: async () => {}, startViewTransition: update => {
    const updated = gate.promise.then(update);
    return { updateCallbackDone: updated, finished: updated, skipTransition() { skipped++; } };
  } });
  const job = flex.run(() => { updates++; }); await new Promise(r => setImmediate(r));
  flex.destroy(); gate.resolve(); assert.equal(await job, 'disposed');
  await new Promise(r => setImmediate(r)); assert.equal(updates, 0); assert.equal(skipped, 1);
});
test('a native starter exception still commits once through fallback', async () => {
  let updates = 0; let animations = 0;
  const flex = createFlexController({ animate: async () => { animations++; }, startViewTransition: () => { throw Error('unsupported'); } });
  await flex.run(() => { updates++; }); assert.equal(updates, 1); assert.equal(animations, 1);
});
test('snapshot ready rejection is observed without losing the accepted update', async () => {
  let updated = false;
  const flex = createFlexController({ animate: async () => {}, startViewTransition: update => {
    const done = Promise.resolve().then(update);
    return { ready: Promise.reject(Error('no snapshot')), updateCallbackDone: done, finished: done, skipTransition() {} };
  } });
  await flex.run(() => { updated = true; }); assert.equal(updated, true);
});

test('document queue coordinates independent native instances', async () => {
  const { serializeDocument } = await import('../../src/lib/flex/document-queue.ts');
  const document = Object.create(null); const gate = deferred(); const order: number[] = [];
  const first = serializeDocument(document, async () => { order.push(1); await gate.promise; });
  const second = serializeDocument(document, async () => { order.push(2); });
  await new Promise(r => setImmediate(r)); assert.deepEqual(order, [1]);
  gate.resolve(); await Promise.all([first, second]); assert.deepEqual(order, [1, 2]);
});
