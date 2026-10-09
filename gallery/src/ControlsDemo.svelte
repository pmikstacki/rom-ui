<script lang="ts">
  import Showcase from "./Showcase.svelte";
  import {
    Button,
    Badge,
    Switch,
    Input,
    Textarea,
    Label,
    Checkbox,
    Slider,
    NativeSelect,
    NativeSelectOption,
    NativeSelectOptGroup,
  } from "rom-ui/controls";
  let name = $state("ROM UI");
  let checked = $state(true);
  let live = $state(false);
  let intensity = $state([65]);
  let size = $state("medium");
  let description = $state(
    "One set of controls. Many applications of your own.",
  );
</script>

<div class="demo-grid">
  <Showcase title="Buttons" api="Button" number="01" level={3}>
    <p class="muted">Variants that share behavior and style.</p>
    <div class="button-row">
      <Button onclick={() => (name = "New project")}
        >Create project <span aria-hidden="true">↗</span></Button
      ><Button variant="secondary">Secondary</Button><Button variant="outline"
        >Outline</Button
      ><Button variant="ghost">Ghost</Button><Button disabled>Disabled</Button>
    </div>
    <div class="code-line">
      import &#123; Button &#125; from 'rom-ui/controls';
    </div>
  </Showcase>
  <Showcase title="Text fields" api="Input · Textarea" number="02" level={3}>
    <div class="field">
      <Label for="project-name">Project name</Label><Input
        id="project-name"
        bind:value={name}
      /><span class="field-caption"
        >Current value: <strong data-testid="control-value">{name}</strong
        ></span
      >
    </div>
    <div class="field">
      <Label for="project-description">Description</Label><Textarea
        id="project-description"
        bind:value={description}
        rows={3}
      />
    </div>
  </Showcase>
  <Showcase title="Selection and range" api="Checkbox · Slider" number="03" level={3}>
    <div class="checkbox-row">
      <Checkbox id="notifications" bind:checked /><Label for="notifications"
        >Notifications enabled</Label
      ><span class="mini-tag">{checked ? "Yes" : "No"}</span>
    </div>
    <div class="field">
      <Label for="intensity">Intensity · {intensity[0]}%</Label><Slider
        type="multiple"
        id="intensity"
        bind:value={intensity}
        min={0}
        max={100}
        step={1}
        aria-label="Intensity"
      />
    </div>
    <div class="field">
      <Label for="project-size">Project size</Label><NativeSelect
        id="project-size"
        bind:value={size}
        ><NativeSelectOptGroup label="Project sizes"
          ><NativeSelectOption value="small">Small</NativeSelectOption
          ><NativeSelectOption value="medium">Medium</NativeSelectOption
          ><NativeSelectOption value="large">Large</NativeSelectOption
          ></NativeSelectOptGroup
        ></NativeSelect
      >
    </div>
  </Showcase>
  <Showcase title="Status and live updates" api="Badge · Switch" number="04" level={3}>
    <div class="checkbox-row">
      <Switch id="live-updates" bind:checked={live} /><Label for="live-updates"
        >Live updates</Label
      ><Badge variant={live ? "default" : "outline"}
        >{live ? "Live" : "Paused"}</Badge
      >
    </div>
    <p class="muted">The host owns the status and subscription lifecycle.</p>
  </Showcase>
  <section class="demo-card foundation-note">
    <span class="small-kicker">FROM ROM STUDIO</span>
    <h3>
      An interface foundation,<br />with your application logic kept separate.
    </h3>
    <p>
      You provide values, labels, and events. Controls handle interaction,
      accessibility, and the shared theme.
    </p>
    <div class="pill-row">
      <span>Keyboard</span><span>Dark mode</span><span>Svelte 5</span>
    </div>
  </section>
</div>
