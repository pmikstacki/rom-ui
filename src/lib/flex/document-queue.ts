const queues = new WeakMap<Document, Promise<unknown>>();
/** Native snapshots belong to the document, so ROMUIFlex instances share a queue. */
export function serializeDocument<T>(
  document: Document,
  run: () => Promise<T>,
): Promise<T> {
  const job = (queues.get(document) ?? Promise.resolve()).then(run);
  queues.set(
    document,
    job.catch(() => {}),
  );
  return job;
}
