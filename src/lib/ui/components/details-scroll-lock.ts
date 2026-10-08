interface Lock {
  users: number;
  previous: string;
}
const locks = new WeakMap<HTMLElement, Lock>();

/** Share the body lock across independent details lifetimes; release only our last lock. */
export function lockDetailsScroll(body: HTMLElement): () => void {
  let lock = locks.get(body);
  if (lock) lock.users++;
  else {
    lock = { users: 1, previous: body.style.overflow };
    locks.set(body, lock);
  }
  body.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--lock.users === 0) {
      locks.delete(body);
      if (body.style.overflow === "hidden") body.style.overflow = lock.previous;
    }
  };
}
