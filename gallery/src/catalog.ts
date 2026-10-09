import type { Component } from "svelte";

export interface GallerySection {
  id: string; label: string; icon: string; count: string;
  description: string; tags: string;
  load?: () => Promise<{ default: Component }>;
}

const entries: GallerySection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "◈",
    count: "",
    description: "See what you can build.",
    tags: "gallery all components",
  },
  {
    id: "controls",
    load: () => import("./ControlsDemo.svelte"),
    label: "Controls",
    icon: "⊞",
    count: "11",
    description: "Small controls. Consistent behavior.",
    tags: "button input textarea checkbox slider label select badge switch",
  },
  {
    id: "compositions",
    load: () => import("./CompositionsDemo.svelte"),
    label: "Compositions",
    icon: "▥",
    count: "06",
    description: "Larger elements that combine controls.",
    tags: "history responsive details reference selection layout",
  },
  {
    id: "chat",
    load: () => import("./ChatDemo.svelte"),
    label: "AI Chat",
    icon: "✳",
    count: "04",
    description: "A space to chat with any model.",
    tags: "assistant conversation composer messages astral plane",
  },
  {
    id: "flow",
    load: () => import("./FlowDemo.svelte"),
    label: "Flow",
    icon: "⌘",
    count: "02",
    description: "Interactive paths with Svelte Flow.",
    tags: "graph nodes madzia xyflow",
  },
  {
    id: "overlays",
    load: () => import("./OverlaysDemo.svelte"),
    label: "Dialogs & feedback",
    icon: "▢",
    count: "04",
    description: "Dialogs, panels, popovers and inline notifications.",
    tags: "dialog sheet modal popover alert notifications feedback",
  },
  {
    id: "forms",
    load: () => import("./FormsDemo.svelte"),
    label: "Forms",
    icon: "▦",
    count: "18",
    description: "Descriptor-driven fields from ROM Studio.",
    tags: "resource form semantic date time datetime color email url decimal json nullable optional readonly",
  },
  {
    id: "studio-primitives",
    load: () => import("./StudioPrimitivesDemo.svelte"),
    label: "Studio primitives",
    icon: "▤",
    count: "14",
    description: "Shared building blocks used by ROM Studio.",
    tags: "switch select tabs badge menu table sidebar alert card breadcrumb tooltip skeleton separator",
  },
  {
    id: "maps",
    load: () => import("./MapsDemo.svelte"),
    label: "Maps",
    icon: "◎",
    count: "16",
    description: "Resources and layers on MapLibre maps.",
    tags: "mapcn maplibre geojson map marker route resources",
  },
  {
    id: "flex",
    load: () => import("./FlexDemo.svelte"),
    label: "Flex",
    icon: "⇄",
    count: "02",
    description: "View transitions with Animotion and the View Transitions API.",
    tags: "transition animation motion view flex",
  },
];

export const sections = entries;
export const families = sections.slice(1);
sections[0].count = String(families.length).padStart(2, "0");
export function resolveSection(id: string): GallerySection {
  return sections.find(section => section.id === id) ?? sections[0];
}
