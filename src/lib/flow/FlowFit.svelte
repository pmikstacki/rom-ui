<script lang="ts">
  import { tick, untrack } from "svelte";
  import {
    useSvelteFlow,
    useNodesInitialized,
    useViewportInitialized,
    useStore,
    getViewportForBounds,
  } from "@xyflow/svelte";
  let {
    signature,
    focusIds = [],
    active = true,
    padding = 0.2,
    minZoom = 0.25,
    maxZoom = 1,
    duration = 320,
  }: {
    signature: unknown;
    focusIds?: readonly string[];
    active?: boolean;
    padding?: number;
    minZoom?: number;
    maxZoom?: number;
    duration?: number;
  } = $props();
  const {
    getNodes,
    getInternalNode,
    getNodesBounds,
    getViewport,
    setViewport,
  } = useSvelteFlow();
  const store = useStore();
  const nodesReady = useNodesInitialized();
  const viewportReady = useViewportInitialized();
  const nodeCount = $derived(getNodes().length);
  $effect(() => {
    signature;
    const focused = focusIds.map((id) => ({ id }));
    const options = {
      nodes: focused.length ? focused : undefined,
      padding,
      minZoom,
      maxZoom,
      duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
    };
    if (
      !active ||
      !nodesReady.current ||
      !viewportReady.current ||
      nodeCount === 0
    )
      return;
    let canceled = false;
    let animating = false;
    let first: number | undefined;
    let second: number | undefined;
    void tick().then(() => {
      if (canceled) return;
      first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => {
          if (
            !canceled &&
            active &&
            nodesReady.current &&
            viewportReady.current &&
            getNodes().length > 0
          ) {
            const reducedMotion = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            const animationDuration = reducedMotion ? 0 : options.duration;
            const requestedIds = options.nodes?.map((node) => node.id);
            const nodes = getNodes(requestedIds).filter((node) => {
              const internal = getInternalNode(node.id);
              return !node.hidden && !!internal?.measured.width && !!internal?.measured.height;
            });
            if (nodes.length === 0 || store.width <= 0 || store.height <= 0) return;
            const target = getViewportForBounds(
              getNodesBounds(nodes), store.width, store.height,
              options.minZoom, options.maxZoom, options.padding,
            );
            // Avoid the shared queued fit: interrupted upstream fits can replay
            // when replacement nodes initialize, even after their owner is gone.
            animating = animationDuration > 0;
            void setViewport(target, { duration: animationDuration }).then(
              () => {
                animating = false;
              },
            );
          }
        });
      });
    });
    return () => {
      canceled = true;
      if (animating) {
        // Interrupt this fit at its current viewport before a replacement can start.
        untrack(() => void setViewport(getViewport(), { duration: 0 }));
        animating = false;
      }
      if (first !== undefined) cancelAnimationFrame(first);
      if (second !== undefined) cancelAnimationFrame(second);
    };
  });
</script>
