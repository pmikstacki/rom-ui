<script lang="ts">
  import type { Snippet } from "svelte";
  import ShowcaseHeading from "./ShowcaseHeading.svelte";
  let { title, api, number, level = 3, class: className = "", children }: {
    title: string;
    api: string;
    number?: string;
    level?: 2 | 3;
    class?: string;
    children: Snippet;
  } = $props();
</script>

<section class={`demo-card showcase ${className}`}>
  <ShowcaseHeading {title} {api} {number} {level} />
  {@render children()}
</section>

<style>
  .showcase { animation: showcase-enter 220ms ease-out both; }
  @keyframes showcase-enter {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .showcase { animation: none; }
  }
</style>
