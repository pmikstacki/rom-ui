<script lang="ts">
  import type { ComponentExample } from "./component-examples";
  let { example }: { example: ComponentExample } = $props();
  let status = $state("");
  let copying = $state(false);
  async function copy() {
    copying = true;
    status = "";
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(example.code);
      status = "Copied to clipboard.";
    } catch {
      status = "Could not copy. Select the code and copy it manually.";
    } finally {
      copying = false;
    }
  }
</script>

<details class="snippet" data-component={example.name}>
  <summary><code>{example.name}</code><span>Usage</span></summary>
  <div class="snippet-content">
    <p>{example.note}</p>
    <div class="copy-row">
      <button
        type="button"
        onclick={copy}
        disabled={copying}
        aria-label={`Copy ${example.name} example`}
        >{copying ? "Copying…" : "Copy code"}</button
      ><span role="status" aria-live="polite">{status}</span>
    </div>
    <!-- Keyboard users need access to this horizontal scroll region. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre tabindex="0" aria-label={`${example.name} usage code`}><code
        >{example.code}</code
      ></pre>
  </div>
</details>

<style>
  .snippet {
    min-width: 0;
    border: 1px solid var(--border);
    border-radius: 0.8rem;
    background: var(--card);
  }
  summary {
    cursor: pointer;
    padding: 1rem;
    font-size: 0.9rem;
  }
  summary code {
    margin-left: 0.4rem;
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  summary span {
    float: right;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  .snippet-content {
    min-width: 0;
    padding: 0 1rem 1rem;
  }
  p {
    font-size: 0.8rem;
    line-height: 1.65;
    color: var(--muted-foreground);
    overflow-wrap: anywhere;
  }
  .copy-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.7rem;
    margin: 0.8rem 0;
  }
  button {
    cursor: pointer;
    border: 1px solid var(--border);
    border-radius: 0.4rem;
    padding: 0.4rem 0.65rem;
    background: var(--background);
    color: var(--foreground);
    font: inherit;
    font-size: 0.75rem;
  }
  button:focus-visible,
  summary:focus-visible,
  pre:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 3px;
  }
  .copy-row span {
    font-size: 0.75rem;
    overflow-wrap: anywhere;
    flex: 1;
    min-width: 8rem;
  }
  pre {
    max-width: 100%;
    overflow-x: auto;
    padding: 1rem;
    border-radius: 0.5rem;
    background: var(--muted);
    color: var(--foreground);
    font-size: 0.72rem;
    line-height: 1.7;
  }
</style>
