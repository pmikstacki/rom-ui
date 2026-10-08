<script lang="ts">
  import { untrack } from "svelte";
  import { Input } from "../../components/ui/input/index.js";
  import * as Popover from "../../components/ui/popover/index.js";
  import * as Command from "../../components/ui/command/index.js";
  import SearchIcon from "@lucide/svelte/icons/search";
  import {
    type ReferenceLookup,
    type ReferenceLookupResult,
  } from "./reference-lookup.ts";
  import {
    admitReferenceResult,
    referenceSearchAllowed,
    type ReferencePickerMessages,
  } from "./reference-picker.ts";
  let {
    kind,
    normalizeId,
    lookup,
    authorityToken,
    messages = {},
    value,
    label,
    path = label,
    onchange,
    onerror = () => {},
    readonly = false,
    showLabel = true,
  }: {
    kind: string;
    normalizeId: (text: string, kind: string, path: string) => string;
    lookup?: ReferenceLookup;
    authorityToken: unknown;
    messages?: Partial<ReferencePickerMessages>;
    value: unknown;
    label: string;
    path?: string;
    onchange: (value: unknown) => void;
    onerror?: (message: string) => void;
    readonly?: boolean;
    showLabel?: boolean;
  } = $props();
  const text = $derived({
    valueLabel: `${label} value`,
    chooseLabel: `Choose ${label} reference`,
    searchLabel: `Search ${label} candidates`,
    idPlaceholder: `Resource ID in ${kind}`,
    searchPlaceholder: "Search these candidates",
    loading: "Loading authorized candidates…",
    empty: "No matches in these authorized candidates.",
    candidateHint: "Search checks up to 20 authorized candidates.",
    more: "More Resources may exist.",
    manualHint: "Enter an exact ID for another Resource.",
    unavailable: "Candidates are unavailable. Enter an exact ID.",
    failed: "Reference lookup failed. Enter an exact Resource ID.",
    searchTooLong: "Reference search is too long.",
    attemptsExceeded:
      "Reference search limit reached. Enter an exact Resource ID.",
    invalidId: "Invalid reference ID.",
    ...messages,
  });
  const descriptor = $derived(lookup?.descriptor(kind));
  let open = $state(false),
    search = $state(""),
    loading = $state(false),
    invalid = $state("");
  let result = $state.raw<ReferenceLookupResult | undefined>();
  let chosen = $state.raw<
    | {
        id: string;
        title: string;
        descriptor: object;
        authority: unknown;
        lookup: ReferenceLookup;
        normalizer: typeof normalizeId;
      }
    | undefined
  >();
  let requestCount = 0;
  const chosenTitle = $derived(
    chosen && chosen.id === value &&
      chosen.descriptor === descriptor &&
      Object.is(chosen.authority, authorityToken) &&
      chosen.lookup === lookup && chosen.normalizer === normalizeId
      ? chosen.title
      : "",
  );
  function input(text: string) {
    if (readonly) return;
    if (chosen?.id !== text) chosen = undefined;
    try {
      if (text.length > 65536) throw Error("Field input limit reached.");
      const next = normalizeId(text, kind, path);
      if (typeof next !== "string") throw TypeError("Invalid normalized reference ID.");
      invalid = "";
      onerror("");
      onchange(next);
    } catch (problem) {
      invalid =
        problem instanceof Error ? problem.message : "Invalid reference ID.";
      onerror(invalid);
    }
  }
  function choose(id: string, title: string) {
    if (!descriptor || readonly) return;
    const acceptedDescriptor = descriptor,
      acceptedAuthority = authorityToken,
      acceptedLookup = lookup,
      acceptedNormalizer = normalizeId;
    input(id);
    if (
      readonly ||
      descriptor !== acceptedDescriptor ||
      lookup !== acceptedLookup ||
      normalizeId !== acceptedNormalizer ||
      !Object.is(authorityToken, acceptedAuthority) ||
      invalid
    )
      return;
    chosen = {
      id,
      title,
      descriptor: acceptedDescriptor,
      authority: acceptedAuthority,
      lookup: acceptedLookup!,
      normalizer: acceptedNormalizer,
    };
    open = false;
  }
  let previousScope:
    | {
        authority: unknown;
        lookup: ReferenceLookup | undefined;
        descriptor: object | undefined;
        kind: string;
        readonly: boolean;
        normalizer: typeof normalizeId;
      }
    | undefined;
  $effect(() => {
    const scope = {
      authority: authorityToken,
      lookup,
      descriptor,
      kind,
      readonly,
      normalizer: normalizeId,
    };
    if (
      previousScope &&
      (!Object.is(previousScope.authority, scope.authority) ||
        previousScope.lookup !== scope.lookup ||
        previousScope.descriptor !== scope.descriptor ||
        previousScope.kind !== scope.kind ||
        previousScope.readonly !== scope.readonly ||
        previousScope.normalizer !== scope.normalizer)
    ) {
      untrack(() => {
        chosen = undefined;
        result = undefined;
        loading = false;
        open = false;
        search = "";
        requestCount = 0;
      });
    }
    previousScope = scope;
  });
  $effect(() => {
    const currentDescriptor = descriptor,
      term = search,
      authority = authorityToken,
      currentLookup = lookup,
      currentKind = kind,
      currentNormalizer = normalizeId;
    if (!open || readonly || !currentLookup || !currentDescriptor) {
      if (readonly || !lookup || !currentDescriptor) open = false;
      if (!lookup || !currentDescriptor) chosen = undefined;
      result = undefined;
      loading = false;
      requestCount = 0;
      return;
    }
    result = undefined;
    chosen = undefined;
    loading = true;
    const controller = new AbortController();
    const current = () => {
      const observed = currentLookup.descriptor(currentKind);
      return (
        !controller.signal.aborted &&
        Object.is(authorityToken, authority) &&
        lookup === currentLookup &&
        normalizeId === currentNormalizer &&
        kind === currentKind &&
        !readonly &&
        open &&
        observed === currentDescriptor
      );
    };
    const timer = setTimeout(
      async () => {
        if (controller.signal.aborted) return;
        if (!referenceSearchAllowed(term)) {
          result = {
            status: "error",
            message: text.searchTooLong,
          };
          loading = false;
          return;
        }
        if (requestCount >= 8) {
          result = {
            status: "error",
            message: text.attemptsExceeded,
          };
          loading = false;
          return;
        }
        requestCount++;
        try {
          if (!current()) return;
          const next = await currentLookup.lookup(
            currentKind,
            term,
            controller.signal,
          );
          if (current()) {
            const admitted = admitReferenceResult(next);
            if (current()) result = admitted;
          }
        } catch {
          if (current())
            result = {
              status: "error",
              message: text.failed,
            };
        } finally {
          if (!controller.signal.aborted) loading = false;
        }
      },
      term ? 250 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  });
</script>

<div class="min-w-0 space-y-1.5">
  {#if showLabel}<span class="text-sm">{label}</span>{/if}
  <div class="flex min-w-0 items-center gap-2">
    <Input
      type="search"
      aria-label={text.valueLabel}
      value={typeof value === "string" ? value : ""}
      placeholder={text.idPlaceholder}
      disabled={readonly}
      aria-invalid={!!invalid}
      class="min-w-0 flex-1"
      oninput={(event) => input(event.currentTarget.value)}
    />
    {#if lookup && descriptor}
      <Popover.Root bind:open>
        <Popover.Trigger
          type="button"
          disabled={readonly}
          aria-label={text.chooseLabel}
          class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-input hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          ><SearchIcon class="size-4" /></Popover.Trigger
        >
        <Popover.Content
          align="end"
          class="w-[min(24rem,calc(100vw-2rem))] gap-2 p-2"
        >
          <Command.Root shouldFilter={false}>
            <Command.Input
              bind:value={search}
              aria-label={text.searchLabel}
              placeholder={text.searchPlaceholder}
              maxlength={256}
            />
            <Command.List class="max-h-64 overflow-y-auto">
              {#if loading}<p role="status" class="p-3 text-sm">
                  {text.loading}
                </p>
              {:else if result?.status === "ready"}
                {#if result.candidates.length === 0}<p
                    role="status"
                    class="p-3 text-sm"
                  >
                    {text.empty}
                  </p>{/if}
                {#each result.candidates as candidate, index (candidate.id)}
                  <Command.Item
                    value={String(index)}
                    onSelect={() => choose(candidate.id, candidate.title)}
                    ><span class="min-w-0 space-y-0.5"
                      ><span class="block break-words">{candidate.title}</span
                      ><span
                        class="block break-all text-xs text-muted-foreground"
                        >{candidate.id}</span
                      ></span
                    ></Command.Item
                  >
                {/each}
              {:else if result}<p role="status" class="p-3 text-sm">
                  {result.message}
                </p>{/if}
            </Command.List>
          </Command.Root>
          <p class="px-2 text-xs text-muted-foreground">
            {text.candidateHint}{#if result?.status === "ready" && result.limited}
              {text.more}{/if}
            {text.manualHint}
          </p>
        </Popover.Content>
      </Popover.Root>
    {/if}
  </div>
  {#if chosenTitle}<p class="break-words text-sm">{chosenTitle}</p>{/if}
  {#if showLabel}<p class="text-xs text-muted-foreground">
      {text.idPlaceholder}.{#if !descriptor}
        Candidates are unavailable. Enter an exact ID.{/if}
    </p>{/if}
  {#if invalid}<p role="alert">{invalid}</p>{/if}
</div>
