/** Host identity metadata; this type does not authorize disclosure. */
export interface ExportPrincipal { authority: string; kind: "embedded" | "human" | "service"; subject: string }

export interface ExportIdentity {
  /** Null records explicitly public host data; it does not establish a disclosure grant. */
  principal: ExportPrincipal | null;
  authorityTicket: string;
  resource: { kind: string; id: string; revision: bigint };
  selectedDate: string | null;
  format: string;
  locale: string;
}

export interface CapturedExportIdentity {
  readonly principal: Readonly<ExportPrincipal> | null;
  readonly authorityTicket: string;
  readonly resource: Readonly<ExportIdentity["resource"]>;
  readonly selectedDate: string | null;
  readonly format: string;
  readonly locale: string;
}

export interface ExportSnapshot<T> {
  readonly identity: CapturedExportIdentity;
  /** A new host clone for each renderer or retry. */
  readonly value: T;
}

export interface CaptureExportOptions<T> {
  identity: ExportIdentity;
  value: T;
  /** Validate and detach bounded host data. Exact wire values require ROM codecs. */
  clone(value: T): T;
}

/**
 * Capture display context before rendering. Does not authorize, render, or write a file.
 * Hosts must recheck current authority and request ownership before disclosure and manual save.
 */
export function captureExportSnapshot<T>(
  options: CaptureExportOptions<T>,
): ExportSnapshot<T> {
  const source = options.identity;
  const identity: CapturedExportIdentity = Object.freeze({
    principal:
      source.principal === null
        ? null
        : Object.freeze({
            authority: source.principal.authority,
            kind: source.principal.kind,
            subject: source.principal.subject,
          }),
    authorityTicket: source.authorityTicket,
    resource: Object.freeze({
      kind: source.resource.kind,
      id: source.resource.id,
      revision: source.resource.revision,
    }),
    selectedDate: source.selectedDate,
    format: source.format,
    locale: source.locale,
  });
  const clone = options.clone;
  const retained = clone(options.value);
  return Object.freeze({
    identity,
    get value() {
      return clone(retained);
    },
  });
}
