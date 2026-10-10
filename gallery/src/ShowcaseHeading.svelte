<script lang="ts">
  let { title, api, number, level = 3 }: {
    title: string;
    api: string;
    number?: string;
    level?: 2 | 3;
  } = $props();
</script>

<div class="card-heading">
  {#if number}<span class="specimen-number">{number}</span>{/if}
  <svelte:element this={level === 2 ? "h2" : "h3"}>{title}</svelte:element>
  <code>{api}</code>
</div>

<style>
  h2 { font-size: 1rem; margin: 0; }
</style>
