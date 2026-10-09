import type { ComponentExample } from "./component-examples.ts";
const panel = (name: "Dialog" | "Sheet" | "Popover", title: string): ComponentExample => ({
  name,
  note: "Shared focus, dismissal and portal behavior. The host supplies content and persistence actions. Reduced motion disables the content animation.",
  code: `<script lang="ts">\n  import * as ${name} from "rom-ui/primitives/${name.toLowerCase()}";\n</script>\n\n<${name}.Root>\n  <${name}.Trigger>Open ${name.toLowerCase()}</${name}.Trigger>\n  <${name}.Content class="motion-reduce:animate-none!">\n    <${name}.Header>\n      <${name}.Title>${title}</${name}.Title>\n      <${name}.Description>Application-owned content and actions.</${name}.Description>\n    </${name}.Header>\n    <${name}.Close>Close</${name}.Close>\n  </${name}.Content>\n</${name}.Root>`,
});
export const overlayExamples: ComponentExample[] = [
  panel("Dialog", "Resource editor"),
  panel("Sheet", "Resource details"),
  panel("Popover", "View options"),
  {
    name: "Alert",
    note: "An inline notification with an application-owned lifetime. Announce confirmed outcomes only after the ROM host resolves its action receipt.",
    code: `<script lang="ts">\n  import * as Alert from "rom-ui/primitives/alert";\n  import { Button } from "rom-ui/controls";\n  let message = $state("");\n</script>\n\n<Button onclick={() => message = "Local preview ready."}>Show notification</Button>\n{#if message}\n  <Alert.Root role="status" aria-live="polite">\n    <Alert.Title>Local feedback</Alert.Title>\n    <Alert.Description>{message}</Alert.Description>\n    <Alert.Action><Button onclick={() => message = ""}>Dismiss</Button></Alert.Action>\n  </Alert.Root>\n{/if}`,
  },
];
