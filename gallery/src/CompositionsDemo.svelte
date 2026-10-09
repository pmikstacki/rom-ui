<script lang="ts">
  import { Button, Input, Label } from "rom-ui/controls";
  import {
    ResponsiveDetails,
    HistoryList,
    SelectionCard,
    LayoutControls,
    ReferencePicker,
  } from "rom-ui/ui/components";
  let open = $state(false);
  let opener = $state<HTMLElement | null>(null);
  let draft = $state("Projekt demonstracyjny");
  let selected = $state("project");
  let choice = $state(false);
  let reference = $state("project/demo");
  let layout = $state<readonly import("rom-ui/ui").LayoutItem[]>([
    { id: "card", x: 0, y: 0, width: 2, height: 2, visible: true },
  ]);
  const layoutOptions = {
    columns: 6,
    maxRows: 4,
    maxItems: 1,
    catalog: [
      { id: "card", minWidth: 1, maxWidth: 4, minHeight: 1, maxHeight: 3 },
    ],
  };
  const layoutLabels = {
    left: "W lewo",
    right: "W prawo",
    up: "W górę",
    down: "W dół",
    wider: "Poszerz",
    narrower: "Zwęź",
    taller: "Podwyższ",
    shorter: "Obniż",
    show: "Pokaż",
    hide: "Ukryj",
    invalid: "Niepoprawny układ",
    failed: "Zmiana odrzucona",
    unknown: "Wynik nieznany",
  };
  const lookup = {
    descriptor: () => ({
      kind: "projects",
      version: 1,
      fields: [],
      actions: [],
      action_inputs: [],
    }),
    lookup: async (_kind: string, search: string) => ({
      status: "ready" as const,
      candidates: [
        { id: "project/demo", title: "Projekt demonstracyjny" },
        { id: "project/gallery", title: "Galeria komponentów" },
      ].filter((item) =>
        item.title
          .toLocaleLowerCase("pl")
          .includes(search.toLocaleLowerCase("pl")),
      ),
      limited: false,
    }),
  };
  const entries = [
    {
      id: "project",
      title: "Projekt interfejsu",
      instant: 1791504000000,
      count: 6,
    },
    {
      id: "flow",
      title: "Przegląd przepływu",
      instant: 1791417600000,
      count: 3,
    },
    { id: "chat", title: "Pierwsza rozmowa", instant: 1791331200000, count: 2 },
  ];
</script>

<div class="demo-grid compositions">
  <section class="demo-card">
    <div class="card-heading">
      <span class="specimen-number">01</span>
      <h3>Historia</h3>
      <code>HistoryList</code>
    </div>
    <p class="muted">Wybór rozmowy lub wersji. Dane i zapis kontroluje host.</p>
    <HistoryList
      {entries}
      selectedId={selected}
      onSelect={(id) => {
        selected = id;
      }}
      authorityToken="gallery"
      locale="pl-PL"
      label="Przykładowa historia"
      empty="Brak historii"
      messages={(key, values) =>
        key === "history.count"
          ? `${values?.formattedCount} wiadomości`
          : "Nie udało się wybrać."}
    />
  </section>
  <section class="demo-card">
    <div class="card-heading">
      <span class="specimen-number">02</span>
      <h3>Karta wyboru</h3>
      <code>SelectionCard</code>
    </div>
    <p class="muted">Jednoznaczny wybór z obsługą wyniku operacji.</p>
    <SelectionCard
      id="example"
      title="Prosty widok"
      selected={choice}
      authorityToken="gallery"
      failedLabel="Operacja odrzucona"
      unknownLabel="Wynik nieznany"
      onToggle={() => {
        choice = !choice;
        return "accepted";
      }}
      ><span class="muted">Wybierz kartę, aby zmienić lokalny stan.</span
      ></SelectionCard
    >
  </section>
  <section class="demo-card">
    <div class="card-heading">
      <span class="specimen-number">04</span>
      <h3>Układ kart</h3>
      <code>LayoutControls</code>
    </div>
    <LayoutControls
      {layout}
      options={layoutOptions}
      label="Układ przykładowej karty"
      itemLabel={() => "Karta"}
      labels={layoutLabels}
      authorityToken="gallery"
      onChange={(_command, proposal) => {
        layout = proposal;
        return "accepted";
      }}
    />
    <p class="muted">
      Pozycja: {layout[0].x}, {layout[0].y} · Rozmiar: {layout[0].width} × {layout[0]
        .height} · {layout[0].visible ? "Widoczna" : "Ukryta"}
    </p>
  </section>
  <section class="demo-card">
    <div class="card-heading">
      <span class="specimen-number">05</span>
      <h3>Odwołanie do zasobu</h3>
      <code>ReferencePicker</code>
    </div>
    <ReferencePicker
      kind="projects"
      value={reference}
      label="Projekt powiązany"
      {lookup}
      normalizeId={(value) => value}
      authorityToken="gallery"
      onchange={(value) => {
        reference = String(value);
      }}
      messages={{
        chooseLabel: "Wybierz projekt",
        searchLabel: "Szukaj projektów",
        valueLabel: "Identyfikator projektu",
        idPlaceholder: "Dokładny identyfikator",
        searchPlaceholder: "Szukaj w przykładach…",
        loading: "Wczytywanie…",
        candidateHint: "Przykładowe zasoby",
        empty: "Brak wyników",
        manualHint: "Możesz podać dokładny identyfikator.",
        more: "Dostępne są dalsze wyniki.",
        unavailable: "Wybór niedostępny.",
        failed: "Nie udało się pobrać.",
        searchTooLong: "Skróć zapytanie.",
        attemptsExceeded: "Spróbuj ponownie później.",
        invalidId: "Niepoprawny identyfikator.",
      }}
    />
    <p class="muted">Wybrany identyfikator: {reference}</p>
  </section>
  <section class="demo-card wide">
    <div class="card-heading">
      <span class="specimen-number">03</span>
      <h3>Responsywne szczegóły</h3>
      <code>ResponsiveDetails</code>
    </div>
    <p class="muted">
      Panel na szerokim ekranie, szuflada na telefonie. Ten sam edytor i ten sam
      szkic.
    </p>
    <Button
      bind:ref={opener}
      onclick={() => {
        open = true;
      }}>Otwórz szczegóły <span aria-hidden="true">↗</span></Button
    >
    <div class="details-example">
      <ResponsiveDetails
        bind:open
        {opener}
        id="gallery-details"
        title="Szczegóły projektu"
        description="Przykładowy edytor zachowujący szkic podczas zmiany szerokości."
        closeLabel="Zamknij szczegóły"
        breakpoint="(max-width: 799px)"
      >
        <div class="field">
          <Label for="detail-name">Tytuł projektu</Label><Input
            id="detail-name"
            bind:value={draft}
          />
          <p class="muted">
            Zmień tytuł i szerokość okna. Wartość pozostaje w edytorze.
          </p>
        </div>
      </ResponsiveDetails>
    </div>
  </section>
</div>
