/** Headless, host-owned UI composition without ROM runtime dependencies. */
export { createLatestRequest } from "./lib/ui/latest-request.ts";
export { createSelection } from "./lib/ui/selection.ts";
export { resolveSourceLink } from "./lib/ui/source-link.ts";
export type { SourceLink, SourceLinkOptions } from "./lib/ui/source-link.ts";
export { captureExportSnapshot } from "./lib/ui/export-snapshot.ts";
export { attachFollowLatest } from "./lib/ui/follow-latest.ts";
export type {
  FollowLatest,
  FollowLatestOptions,
} from "./lib/ui/follow-latest.ts";
export type {
  CaptureExportOptions,
  CapturedExportIdentity,
  ExportIdentity,
  ExportSnapshot,
} from "./lib/ui/export-snapshot.ts";
export type { Selection, SelectionOptions } from "./lib/ui/selection.ts";
export type {
  LatestRequest,
  LatestRequestOptions,
  LatestRequestState,
} from "./lib/ui/latest-request.ts";
export { validateLayout } from "./lib/ui/layout.ts";
export type {
  LayoutItem,
  LayoutCatalogEntry,
  LayoutOptions,
  LayoutResult,
} from "./lib/ui/layout.ts";

export type { ExportPrincipal } from "./lib/ui/export-snapshot.ts";
