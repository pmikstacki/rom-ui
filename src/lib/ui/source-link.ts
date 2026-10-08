export interface SourceLink {
  readonly href: string;
  readonly external: boolean;
}

export interface SourceLinkOptions {
  /** Absolute HTTP(S) base without credentials. */
  readonly base: string;
  /** Validate the normalized pathname, search, and hash of a same-origin link. */
  readonly internal: (path: string) => boolean;
  /** Complete HTTP(S) origins. Paths, credentials, queries, and fragments are forbidden. */
  readonly externalOrigins: readonly string[];
}

const MAX_LINK_BYTES = 8192;
const controls = /[\u0000-\u001f\u007f]/;

function httpUrl(raw: string, base?: URL): URL | null {
  try {
    const url = new URL(raw, base);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    return url;
  } catch {
    return null;
  }
}

/** Resolve an explicitly permitted display link. Does not fetch or authorize its destination. */
export function resolveSourceLink(
  raw: string,
  options: SourceLinkOptions,
): SourceLink | null {
  const base = httpUrl(options.base);
  if (!base || controls.test(options.base))
    throw new TypeError("Invalid source-link base");
  const origins = new Set<string>();
  for (const rawOrigin of options.externalOrigins) {
    const origin = httpUrl(rawOrigin);
    if (
      !origin ||
      controls.test(rawOrigin) ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash
    ) {
      throw new TypeError("Invalid source-link external origin");
    }
    origins.add(origin.origin);
  }
  if (
    typeof raw !== "string" ||
    !raw.trim() ||
    raw.length > MAX_LINK_BYTES ||
    controls.test(raw)
  )
    return null;
  if (new TextEncoder().encode(raw).byteLength > MAX_LINK_BYTES) return null;
  const url = httpUrl(raw, base);
  if (!url) return null;
  if (url.origin === base.origin) {
    try {
      const decision: unknown = options.internal(
        url.pathname + url.search + url.hash,
      );
      if (decision !== true) {
        // Invalid JS async validators never approve links; consume their rejection.
        if (
          decision !== null &&
          (typeof decision === "object" || typeof decision === "function")
        ) {
          void Promise.resolve(decision).catch(() => undefined);
        }
        return null;
      }
    } catch {
      return null;
    }
    return Object.freeze({ href: url.href, external: false });
  }
  return origins.has(url.origin)
    ? Object.freeze({ href: url.href, external: true })
    : null;
}
