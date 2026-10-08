<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button } from "../../components/ui/button/index.js";
  import { captureHistory, formatHistoryInstant } from "../history.ts";
  import type { HistoryEntry } from "../history.ts";
  import type { MessageResolver } from "../messages.ts";
  let {
    entries,
    selectedId,
    onSelect,
    messages,
    locale,
    empty,
    label,
    authorityToken,
    maxEntries = 200,
    timeZone = "UTC",
    disabled = false,
  }: {
    entries: readonly HistoryEntry[];
    selectedId: string | null;
    onSelect: (id: string) => void | Promise<void>;
    messages: MessageResolver;
    locale: string;
    empty: string;
    label: string;
    authorityToken: unknown;
    maxEntries?: number;
    timeZone?: string;
    disabled?: boolean;
  } = $props();
  const rows = $derived(captureHistory(entries, maxEntries));
  const number = $derived(new Intl.NumberFormat(locale));
  let pending = $state<string | null>(null);
  let failed = $state(false);
  let epoch = 0;
  $effect(() => {
    authorityToken;
    epoch++;
    pending = null;
    failed = false;
  });
  onDestroy(() => {
    epoch++;
  });
  async function select(id: string) {
    if (disabled || pending !== null) return;
    const ticket = ++epoch;
    const owner = authorityToken;
    pending = id;
    failed = false;
    try {
      await onSelect(id);
    } catch {
      if (ticket === epoch && Object.is(owner, authorityToken)) failed = true;
    } finally {
      if (ticket === epoch && Object.is(owner, authorityToken)) pending = null;
    }
  }
</script>

<div class="min-w-0" aria-busy={pending !== null}>
  {#if rows.length === 0}
    <p class="text-sm text-muted-foreground">{empty}</p>
  {:else}
    <ul aria-label={label} class="grid min-w-0 gap-1">
      {#each rows as entry (entry.id)}
        <li class="min-w-0">
          <Button
            variant={selectedId === entry.id ? "secondary" : "ghost"}
            class="h-auto w-full min-w-0 items-start justify-start whitespace-normal px-3 py-2 text-left"
            aria-label={entry.title}
            aria-current={selectedId === entry.id ? "true" : undefined}
            disabled={disabled || pending !== null}
            onclick={() => select(entry.id)}
          >
            <span class="grid min-w-0 gap-1">
              <span class="min-w-0 break-all font-medium">{entry.title}</span>
              <span
                class="flex flex-wrap gap-x-2 text-xs font-normal text-muted-foreground"
              >
                <time datetime={new Date(entry.instant).toISOString()}
                  >{formatHistoryInstant(entry.instant, locale, timeZone)}</time
                >
                {#if entry.count !== undefined}<span
                    >{messages("history.count", {
                      count: entry.count,
                      formattedCount: number.format(entry.count),
                    })}</span
                  >{/if}
              </span>
            </span>
          </Button>
        </li>
      {/each}
    </ul>
  {/if}
  {#if failed}<p role="status" class="mt-2 text-sm text-destructive">
      {messages("history.selectionFailed")}
    </p>{/if}
</div>
