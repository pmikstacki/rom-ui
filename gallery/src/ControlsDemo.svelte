<script lang="ts">
  import {
    Button,
    Input,
    Textarea,
    Label,
    Checkbox,
    Slider,
    NativeSelect,
    NativeSelectOption,
  } from "rom-ui/controls";
  let name = $state("ROM UI");
  let checked = $state(true);
  let intensity = $state([65]);
  let size = $state("medium");
  let description = $state("Jeden zestaw kontrolek. Wiele własnych aplikacji.");
</script>

<div class="demo-grid">
  <section class="demo-card">
    <div class="card-heading">
      <span class="specimen-number">01</span>
      <h3>Przyciski</h3>
      <code>Button</code>
    </div>
    <p class="muted">Warianty, które współdzielą zachowanie i styl.</p>
    <div class="button-row">
      <Button onclick={() => (name = "Nowy projekt")}
        >Utwórz projekt <span aria-hidden="true">↗</span></Button
      ><Button variant="secondary">Drugorzędny</Button><Button variant="outline"
        >Obrys</Button
      ><Button variant="ghost">Bez tła</Button><Button disabled
        >Niedostępny</Button
      >
    </div>
    <div class="code-line">
      import &#123; Button &#125; from 'rom-ui/controls';
    </div>
  </section>
  <section class="demo-card">
    <div class="card-heading">
      <span class="specimen-number">02</span>
      <h3>Pola tekstowe</h3>
      <code>Input · Textarea</code>
    </div>
    <div class="field">
      <Label for="project-name">Nazwa projektu</Label><Input
        id="project-name"
        bind:value={name}
      /><span class="field-caption"
        >Bieżąca wartość: <strong data-testid="control-value">{name}</strong
        ></span
      >
    </div>
    <div class="field">
      <Label for="project-description">Opis</Label><Textarea
        id="project-description"
        bind:value={description}
        rows={3}
      />
    </div>
  </section>
  <section class="demo-card">
    <div class="card-heading">
      <span class="specimen-number">03</span>
      <h3>Wybór i zakres</h3>
      <code>Checkbox · Slider</code>
    </div>
    <div class="checkbox-row">
      <Checkbox id="notifications" bind:checked /><Label for="notifications"
        >Powiadomienia włączone</Label
      ><span class="mini-tag">{checked ? "Tak" : "Nie"}</span>
    </div>
    <div class="field">
      <Label for="intensity">Intensywność · {intensity[0]}%</Label><Slider
        type="multiple"
        id="intensity"
        bind:value={intensity}
        min={0}
        max={100}
        step={1}
        aria-label="Intensywność"
      />
    </div>
    <div class="field">
      <Label for="project-size">Rozmiar projektu</Label><NativeSelect
        id="project-size"
        bind:value={size}
        ><NativeSelectOption value="small">Mały</NativeSelectOption
        ><NativeSelectOption value="medium">Średni</NativeSelectOption
        ><NativeSelectOption value="large">Duży</NativeSelectOption
        ></NativeSelect
      >
    </div>
  </section>
  <section class="demo-card foundation-note">
    <span class="small-kicker">Z ROM STUDIO</span>
    <h3>Podstawa interfejsu,<br />bez logiki Twojej aplikacji.</h3>
    <p>
      Przekazujesz wartości, etykiety i zdarzenia. Kontrolki odpowiadają za
      interakcję, dostępność i wspólny motyw.
    </p>
    <div class="pill-row">
      <span>Klawiatura</span><span>Tryb ciemny</span><span>Svelte 5</span>
    </div>
  </section>
</div>
