<script lang="ts">
  import { tick } from "svelte";
  import { useSvelteFlow } from "@xyflow/svelte";
  let {
    signature,
    focusIds = [],
    active = true,
    padding = 0.2,
    minZoom = 0.25,
    maxZoom = 1,
  }: {
    signature: unknown;
    focusIds?: readonly string[];
    active?: boolean;
    padding?: number;
    minZoom?: number;
    maxZoom?: number;
  } = $props();
  const { fitView } = useSvelteFlow();
  $effect(() => {
    signature;
    const focused = focusIds.map((id) => ({ id }));
    const options = {
      nodes: focused.length ? focused : undefined,
      padding,
      minZoom,
      maxZoom,
      duration: 0,
    };
    if (!active) return;
    let canceled = false;
    let first: number | undefined;
    let second: number | undefined;
    void tick().then(() => {
      if (canceled) return;
      first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => {
          if (!canceled) void fitView(options);
        });
      });
    });
    return () => {
      canceled = true;
      if (first !== undefined) cancelAnimationFrame(first);
      if (second !== undefined) cancelAnimationFrame(second);
    };
  });
</script>
