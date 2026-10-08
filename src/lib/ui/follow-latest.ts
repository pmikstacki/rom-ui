export interface FollowLatestOptions {
  readonly thresholdPx: number;
  readonly reducedMotion: boolean;
  readonly onFollowing: (following: boolean) => void;
}

export interface FollowLatest {
  notifyContent(): void;
  resume(): void;
  snapshot(): { readonly following: boolean };
  dispose(): void;
}

/**
 * Follow new content while the reader remains near the end.
 * Call notifyContent after content updates; ResizeObserver also handles viewport resizing.
 * Scrolling is instant in both motion modes, so automatic movement never animates past manual intent.
 */
export function attachFollowLatest(
  element: HTMLElement,
  options: FollowLatestOptions,
): FollowLatest {
  const { thresholdPx, onFollowing } = options;
  if (!Number.isFinite(thresholdPx) || thresholdPx < 0)
    throw new TypeError("Invalid follow-latest threshold");
  const view = element.ownerDocument.defaultView;
  if (!view)
    throw new TypeError("Follow-latest requires an owned browser window");
  let disposed = false;
  let frame: number | null = null;
  const nearEnd = () =>
    element.scrollHeight - element.clientHeight - element.scrollTop <=
    thresholdPx;
  let following = nearEnd();
  let lastTop = element.scrollTop;
  function setFollowing(value: boolean) {
    if (disposed || following === value) return;
    following = value;
    onFollowing(value);
  }
  function notifyContent() {
    if (disposed || !following || frame !== null) return;
    frame = view!.requestAnimationFrame(() => {
      frame = null;
      if (disposed || !following) return;
      element.scrollTo({
        top: Math.max(0, element.scrollHeight - element.clientHeight),
        behavior: "instant",
      });
      lastTop = element.scrollTop;
    });
  }
  const onScroll = () => {
    if (disposed) return;
    const top = element.scrollTop;
    const movedUp = top < lastTop;
    const end = Math.max(0, element.scrollHeight - element.clientHeight);
    const clampedToEnd = lastTop > end && top === end;
    lastTop = top;
    if (movedUp && !clampedToEnd) setFollowing(false);
  };
  const observer = new view.ResizeObserver(notifyContent);
  observer.observe(element);
  element.addEventListener("scroll", onScroll, { passive: true });
  return {
    notifyContent,
    resume() {
      if (disposed) return;
      setFollowing(true);
      notifyContent();
    },
    snapshot() {
      return Object.freeze({ following });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame !== null) view.cancelAnimationFrame(frame);
      frame = null;
      observer.disconnect();
      element.removeEventListener("scroll", onScroll);
    },
  };
}
