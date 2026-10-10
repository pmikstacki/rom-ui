<script lang="ts">
  import Snippet from "./Snippet.svelte";
  import {
    componentExamples,
    type ExampleCategory,
  } from "./component-examples";
  let { category }: { category: ExampleCategory } = $props();
</script>

<section class="usage" aria-label="Component usage examples">
  <div class="usage-heading">
    <h2>Build with these components</h2>
    <p>
      Open an example. Copy its imports, state and markup into a Svelte 5
      component.
    </p>
  </div>
  <div class="snippet-grid">
    {#each componentExamples[category] as example (example.name)}<Snippet
        {example}
      />{/each}
  </div>
</section>

<style>
  .usage {
    min-width: 0;
    margin-top: 2.5rem;
  }
  .usage-heading {
    margin-bottom: 1rem;
  }
  h2 {
    font-size: 1.15rem;
    letter-spacing: -0.025em;
    margin: 0 0 0.5rem;
  }
  p {
    font-size: 0.85rem;
    color: var(--muted-foreground);
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
  .snippet-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 0.8rem;
  }
  @media (max-width: 799px) {
    .snippet-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
