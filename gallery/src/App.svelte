<script lang="ts">
  import { onMount } from "svelte";
  import { ROMUIFlex } from "rom-ui/flex";
  import ComponentSnippets from "./ComponentSnippets.svelte";
  import {
    componentExamples,
    type ExampleCategory,
  } from "./component-examples";
  import { sections, families, resolveSection } from "./catalog";
  import CategoryGrid from "./CategoryGrid.svelte";
  let pageFlex: ROMUIFlex;
  let navigation = 0;
  const version = __ROM_UI_VERSION__;
  let current = $state("overview");
  let query = $state("");
  let mobileNav = $state(false);
  let dark = $state(false);
  const demo = $derived(resolveSection(current).load?.());
  const snippetCategory = $derived(
    Object.hasOwn(componentExamples, current)
      ? (current as ExampleCategory)
      : null,
  );
  const section = $derived(
    resolveSection(current),
  );
  const matches = $derived(
    families
      .filter((item) =>
        `${item.label} ${item.tags}`
          .toLocaleLowerCase("en")
          .includes(query.toLocaleLowerCase("en")),
      ),
  );
  async function navigate(id: string) {
    const ticket = ++navigation;
    mobileNav = false;
    query = "";
    await resolveSection(id).load?.()
      .catch(() => undefined);
    if (ticket !== navigation) return;
    const update = () => {
      current = id;
      window.location.hash = id;
      window.scrollTo({ top: 0 });
    };
    if (pageFlex) await pageFlex.run(update, { focus: () => document.getElementById("main") });
    else update();
  }
  function setTheme() {
    dark = !dark;
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
    try {
      localStorage.setItem("rom-ui-theme", dark ? "dark" : "light");
    } catch {}
  }
  onMount(() => {
    const route = () => {
      const id = location.hash.slice(1);
      current = resolveSection(id).id;
    };
    route();
    window.addEventListener("hashchange", route);
    try {
      dark = localStorage.getItem("rom-ui-theme") === "dark";
    } catch {}
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
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
  }}>Skip to content</a
>
<div class="gallery-shell">
  <aside class="sidebar" class:mobile-open={mobileNav}>
    <a
      class="brand"
      href="#overview"
      onclick={() => {
        mobileNav = false;
      }}
      aria-label="ROM UI — overview"
      ><span class="brand-symbol" aria-hidden="true">r.</span><span
        >ROM<span class="brand-ui"> / UI</span></span
      ><span class="alpha-tag">alpha</span></a
    >
    <div class="sidebar-section-label">COMPONENT LIBRARY</div>
    <nav aria-label="Component gallery">
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
      <span class="status-dot"></span> Extracted from real applications.
    </div>
    <div class="sidebar-footer">
      <a
        href="https://github.com/pmikstacki/rom-ui"
        target="_blank"
        rel="noopener noreferrer"
        >Repository <span aria-hidden="true">↗</span></a
      ><span>Svelte 5 · pnpm</span>
    </div>
  </aside>
  <div class="main-column">
    <header class="topbar">
      <button
        class="mobile-toggle icon-button"
        aria-label={mobileNav ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileNav}
        onclick={() => {
          mobileNav = !mobileNav;
        }}>☰</button
      >
      <div class="breadcrumb">
        Gallery <span>/</span> <strong>{section.label}</strong>
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
            aria-label="Search components"
            placeholder="Search components…"
            bind:value={query}
          /></label
        ><button
          class="icon-button theme-toggle"
          aria-label="Toggle theme"
          aria-pressed={dark}
          onclick={setTheme}>{dark ? "☀" : "◐"}</button
        >
      </div>
    </header>
    <main id="main" tabindex="-1">
      <ROMUIFlex bind:this={pageFlex} native={true} label="Gallery view">
        {#if query}
          <div class="page-heading">
            <span class="small-kicker">SEARCH</span>
            <h1>Results for “{query}”</h1>
            <p class="muted">
              Choose a component family to open working examples.
            </p>
          </div>
          <CategoryGrid items={matches} {navigate} />
          {#if !matches.length}<p class="empty-search">
              No matching components. Try “chat”, “slider”, or “flow”.
            </p>{/if}
        {:else if current === "overview"}
          <section class="hero">
            <div class="hero-copy">
              <span class="hero-kicker"
                ><span class="status-dot"></span> ROM UI · {version}</span
              >
              <h1>Components that fit your application.</h1>
              <p>
                From a single field to a complete conversation. A set of Svelte
                controls, extracted from ROM Studio and developed in real
                applications.
              </p>
              <div class="hero-actions">
                <button
                  class="primary-link"
                  onclick={() => navigate("controls")}
                  >Explore components <span aria-hidden="true">↗</span></button
                ><a
                  href="https://github.com/pmikstacki/rom-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  >View source <span aria-hidden="true">↗</span></a
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
              <span class="small-kicker">COMPONENT FAMILIES</span>
              <h2>Try it yourself</h2>
            </div>
            <span class="muted">Live examples, your own data</span>
          </div>
          <CategoryGrid items={families} {navigate} />
          <section class="principles">
            <div>
              <span class="small-kicker">YOUR HOST, YOUR RULES</span>
              <h2>
                Presentation is shared.<br />Logic belongs to your application.
              </h2>
            </div>
            <p>
              Controls accept values and events. Compositions arrange the
              interface. The AI model, history, permissions, and data storage
              remain where you define them.
            </p>
            <div class="pill-row">
              <span>Public API</span><span>Installed package</span><span
                >Optional Flow</span
              >
            </div>
          </section>
        {:else}
          <div class="page-heading">
            <span class="small-kicker"
              >ROM UI / {section.label.toLocaleUpperCase("en")}</span
            >
            <h1>{section.label}</h1>
            <p class="muted">{section.description}</p>
          </div>
          {#await demo}<p class="muted" role="status">
              Loading examples…
            </p>{:then loaded}{#if loaded}<loaded.default />{/if}{:catch}<p
              role="alert"
            >
              Could not load examples. Refresh the page.
            </p>{/await}
        {/if}
        {#if snippetCategory}<ComponentSnippets
            category={snippetCategory}
          />{/if}
      </ROMUIFlex>
      <footer class="page-footer">
        <span>ROM UI · Component gallery</span><span
          >MIT · {version} · <a href="/licenses.txt">Licenses</a></span
        >
      </footer>
    </main>
  </div>
</div>
