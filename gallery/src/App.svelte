<script lang="ts">
  import { onMount } from "svelte";
  const version = __ROM_UI_VERSION__;
  const loaders = new Map([
    ["controls", () => import("./ControlsDemo.svelte")],
    ["compositions", () => import("./CompositionsDemo.svelte")],
    ["chat", () => import("./ChatDemo.svelte")],
    ["flow", () => import("./FlowDemo.svelte")],
  ]);
  const sections = [
    {
      id: "overview",
      label: "Przegląd",
      icon: "◈",
      count: "04",
      description: "Zobacz, co możesz zbudować.",
      tags: "galeria wszystkie komponenty",
    },
    {
      id: "controls",
      label: "Podstawy",
      icon: "⊞",
      count: "07",
      description: "Małe kontrolki. Spójne zachowanie.",
      tags: "button input textarea checkbox slider label select",
    },
    {
      id: "compositions",
      label: "Kompozycje",
      icon: "▥",
      count: "06",
      description: "Większe elementy, które łączą kontrolki.",
      tags: "history responsive details reference selection layout",
    },
    {
      id: "chat",
      label: "Czat AI",
      icon: "✳",
      count: "03",
      description: "Przestrzeń na rozmowę z dowolnym modelem.",
      tags: "assistant conversation composer messages astral plane",
    },
    {
      id: "flow",
      label: "Flow",
      icon: "⌘",
      count: "02",
      description: "Interaktywne ścieżki z Svelte Flow.",
      tags: "graph graf węzły madzia xyflow",
    },
  ];
  let current = $state("overview");
  let query = $state("");
  let mobileNav = $state(false);
  let dark = $state(false);
  const demo = $derived(loaders.get(current)?.());
  const section = $derived(
    sections.find((section) => section.id === current) ?? sections[0],
  );
  const matches = $derived(
    sections
      .slice(1)
      .filter((item) =>
        `${item.label} ${item.tags}`
          .toLocaleLowerCase("pl")
          .includes(query.toLocaleLowerCase("pl")),
      ),
  );
  function navigate(id: string) {
    current = id;
    window.location.hash = id;
    mobileNav = false;
    query = "";
    window.scrollTo({ top: 0 });
  }
  function setTheme() {
    dark = !dark;
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("rom-ui-theme", dark ? "dark" : "light");
    } catch {}
  }
  onMount(() => {
    const route = () => {
      const id = location.hash.slice(1);
      current = sections.some((section) => section.id === id) ? id : "overview";
    };
    route();
    window.addEventListener("hashchange", route);
    try {
      dark = localStorage.getItem("rom-ui-theme") === "dark";
    } catch {}
    document.documentElement.classList.toggle("dark", dark);
    return () => window.removeEventListener("hashchange", route);
  });
</script>

<svelte:head><title>{section.label} · ROM UI</title></svelte:head>
<a
  class="skip-link"
  href="#main"
  onclick={(event) => {
    event.preventDefault();
    document.getElementById("main")?.focus();
    document.getElementById("main")?.scrollIntoView({ block: "start" });
  }}>Przejdź do treści</a
>
<div class="gallery-shell">
  <aside class="sidebar" class:mobile-open={mobileNav}>
    <a
      class="brand"
      href="#overview"
      onclick={() => {
        mobileNav = false;
      }}
      aria-label="ROM UI — przegląd"
      ><span class="brand-symbol" aria-hidden="true">r.</span><span
        >ROM<span class="brand-ui"> / UI</span></span
      ><span class="alpha-tag">alpha</span></a
    >
    <div class="sidebar-section-label">BIBLIOTEKA KOMPONENTÓW</div>
    <nav aria-label="Galeria komponentów">
      {#each sections as item}<button
          class:active={current === item.id}
          aria-current={current === item.id ? "page" : undefined}
          onclick={() => navigate(item.id)}
          ><span class="nav-icon" aria-hidden="true">{item.icon}</span><span
            >{item.label}</span
          ><span class="nav-count" aria-hidden="true">{item.count}</span
          ></button
        >{/each}
    </nav>
    <div class="sidebar-note">
      <span class="status-dot"></span> Wyodrębnione z prawdziwych aplikacji.
    </div>
    <div class="sidebar-footer">
      <a
        href="https://github.com/pmikstacki/rom-ui"
        target="_blank"
        rel="noopener noreferrer"
        >Repozytorium <span aria-hidden="true">↗</span></a
      ><span>Svelte 5 · pnpm</span>
    </div>
  </aside>
  <div class="main-column">
    <header class="topbar">
      <button
        class="mobile-toggle icon-button"
        aria-label={mobileNav ? "Zamknij nawigację" : "Otwórz nawigację"}
        aria-expanded={mobileNav}
        onclick={() => {
          mobileNav = !mobileNav;
        }}>☰</button
      >
      <div class="breadcrumb">
        Galeria <span>/</span> <strong>{section.label}</strong>
      </div>
      <div class="topbar-actions">
        <label class="search"
          ><svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            ><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg
          ><input
            type="search"
            aria-label="Szukaj komponentów"
            placeholder="Szukaj komponentów…"
            bind:value={query}
          /></label
        ><button
          class="icon-button theme-toggle"
          aria-label="Zmień motyw"
          aria-pressed={dark}
          onclick={setTheme}>{dark ? "☀" : "◐"}</button
        >
      </div>
    </header>
    <main id="main" tabindex="-1">
      {#if query}
        <div class="page-heading">
          <span class="small-kicker">WYSZUKIWANIE</span>
          <h1>Wyniki dla „{query}”</h1>
          <p class="muted">
            Wybierz rodzinę komponentów, aby otworzyć działające przykłady.
          </p>
        </div>
        <div class="category-grid">
          {#each matches as item}<button
              class="category-card"
              onclick={() => navigate(item.id)}
              ><span class="category-icon" aria-hidden="true">{item.icon}</span>
              <h2>{item.label}</h2>
              <p>{item.description}</p>
              <span class="category-footer"
                >Otwórz przykłady <span aria-hidden="true">↗</span></span
              ></button
            >{/each}
        </div>
        {#if !matches.length}<p class="empty-search">
            Brak pasujących komponentów. Spróbuj „chat”, „slider” lub „flow”.
          </p>{/if}
      {:else if current === "overview"}
        <section class="hero">
          <div class="hero-copy">
            <span class="hero-kicker"
              ><span class="status-dot"></span> ROM UI · {version}</span
            >
            <h1>Komponenty, które pasują do Twojej aplikacji.</h1>
            <p>
              Od pojedynczego pola do całej rozmowy. Zestaw kontrolek Svelte,
              wydzielony z ROM Studio i rozwijany w rzeczywistych aplikacjach.
            </p>
            <div class="hero-actions">
              <button class="primary-link" onclick={() => navigate("controls")}
                >Poznaj komponenty <span aria-hidden="true">↗</span></button
              ><a
                href="https://github.com/pmikstacki/rom-ui"
                target="_blank"
                rel="noopener noreferrer"
                >Zobacz kod <span aria-hidden="true">↗</span></a
              >
            </div>
          </div>
          <div class="hero-art" aria-hidden="true">
            <div class="art-orbit orbit-one"></div>
            <div class="art-orbit orbit-two"></div>
            <div class="art-orbit orbit-three"></div>
            <div class="art-tile art-tile-one">⊞</div>
            <div class="art-tile art-tile-two">✳</div>
            <div class="art-tile art-tile-three">⌘</div>
            <div class="art-center">r<span>.</span></div>
            <div class="art-caption">COMPOSE YOUR INTERFACE</div>
          </div>
        </section>
        <div class="section-heading">
          <div>
            <span class="small-kicker">CZTERY PUNKTY STARTOWE</span>
            <h2>Sprawdź w praktyce</h2>
          </div>
          <span class="muted">Żywe przykłady, własne dane</span>
        </div>
        <div class="category-grid">
          {#each sections.slice(1) as item}<button
              class="category-card"
              onclick={() => navigate(item.id)}
              ><span class="category-icon" aria-hidden="true">{item.icon}</span
              ><span class="category-index">{item.count} / komponenty</span>
              <h2>{item.label}</h2>
              <p>{item.description}</p>
              <span class="category-footer"
                >Otwórz przykłady <span aria-hidden="true">↗</span></span
              ></button
            >{/each}
        </div>
        <section class="principles">
          <div>
            <span class="small-kicker">TWÓJ HOST, TWOJE REGUŁY</span>
            <h2>Prezentacja jest wspólna.<br />Logika należy do aplikacji.</h2>
          </div>
          <p>
            Kontrolki przyjmują wartości i zdarzenia. Kompozycje układają
            interfejs. Model AI, historia, uprawnienia i zapis danych pozostają
            tam, gdzie je definiujesz.
          </p>
          <div class="pill-row">
            <span>Publiczne API</span><span>Instalowany pakiet</span><span
              >Opcjonalny Flow</span
            >
          </div>
        </section>
      {:else}
        <div class="page-heading">
          <span class="small-kicker"
            >ROM UI / {section.label.toLocaleUpperCase("pl")}</span
          >
          <h1>{section.label}</h1>
          <p class="muted">{section.description}</p>
        </div>
        {#await demo}<p class="muted" role="status">
            Wczytywanie przykładów…
          </p>{:then loaded}{#if loaded}<loaded.default />{/if}{:catch}<p
            role="alert"
          >
            Nie udało się wczytać przykładów. Odśwież stronę.
          </p>{/await}
      {/if}
      <footer class="page-footer">
        <span>ROM UI · Galeria komponentów</span><span>MIT · {version}</span>
      </footer>
    </main>
  </div>
</div>
