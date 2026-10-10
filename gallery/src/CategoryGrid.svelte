<script lang="ts">
  import type { GallerySection } from "./catalog";
  let { items, navigate }: {
    items: GallerySection[];
    navigate: (id: string) => Promise<void>;
  } = $props();
</script>

<div class="category-grid">
  {#each items as item (item.id)}
    <button class="category-card" onclick={() => navigate(item.id)}>
      <span class="category-icon" aria-hidden="true">{item.icon}</span>
      <span class="category-index">{item.count} / components</span>
      <h2>{item.label}</h2>
      <p>{item.description}</p>
      <span class="category-footer">Open examples <span aria-hidden="true">↗</span></span>
    </button>
  {/each}
</div>
