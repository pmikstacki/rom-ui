import type { ComponentExample } from "./component-examples";
function family(
  name: string,
  path: string,
  script: string,
  markup: string,
  note: string,
): ComponentExample {
  return {
    name,
    note,
    code: `<script lang="ts">\n  import * as ${name} from "rom-ui/primitives/${path}";\n${script}\n</script>\n\n${markup}`,
  };
}
export const studioPrimitiveExamples: ComponentExample[] = [
  {
    name: "Badge",
    note: "Labels and links preserve the exact host text. The host supplies status meaning.",
    code: '<script lang="ts">\n  import {Badge, type BadgeVariant} from "rom-ui/controls";\n  const variant: BadgeVariant = "outline";\n</script>\n\n<Badge {variant} href="#resource">Resource 9007199254740993</Badge>',
  },
  {
    name: "Switch",
    note: "Bind host state and pass disabled explicitly. This control does not persist changes.",
    code: '<script lang="ts">\n  import {Switch} from "rom-ui/controls";\n  let enabled = $state(false);\n</script>\n\n<label for="updates">Live updates</label>\n<Switch id="updates" bind:checked={enabled} />',
  },
  family(
    "Select",
    "select",
    '  let value = $state("list");',
    '<Select.Root type="single" bind:value>\n  <Select.Trigger aria-label="View"><Select.Value placeholder="Choose view" /></Select.Trigger>\n  <Select.Content><Select.Item value="list">List</Select.Item><Select.Item value="grid">Grid</Select.Item></Select.Content>\n</Select.Root>',
    "The shared popup hides departing options and returns focus to its trigger.",
  ),
  family(
    "Tabs",
    "tabs",
    '  let value = $state("details");',
    '<Tabs.Root bind:value>\n  <Tabs.List aria-label="Resource sections"><Tabs.Trigger value="details">Details</Tabs.Trigger><Tabs.Trigger value="history">History</Tabs.Trigger></Tabs.List>\n  <Tabs.Content value="details">Host values</Tabs.Content><Tabs.Content value="history">Host history</Tabs.Content>\n</Tabs.Root>',
    "The host supplies tab content. Keyboard navigation updates the bound value.",
  ),
  family(
    "DropdownMenu",
    "dropdown-menu",
    "  let inspected = $state(false);",
    '<DropdownMenu.Root>\n  <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>\n  <DropdownMenu.Content><DropdownMenu.Item onclick={() => inspected = true}>Inspect</DropdownMenu.Item><DropdownMenu.Item disabled>Unavailable</DropdownMenu.Item></DropdownMenu.Content>\n</DropdownMenu.Root>\n<p role="status">{inspected ? "Inspected locally" : "Ready"}</p>',
    "Authorization and action execution belong to the host.",
  ),
  family(
    "AlertDialog",
    "alert-dialog",
    "  let changed = $state(false);\n  let open = $state(false);",
    '<AlertDialog.Root bind:open>\n  <AlertDialog.Trigger>Confirm change</AlertDialog.Trigger>\n  <AlertDialog.Content><AlertDialog.Title>Confirm change</AlertDialog.Title><AlertDialog.Description>The host applies the change.</AlertDialog.Description><AlertDialog.Cancel>Cancel</AlertDialog.Cancel><AlertDialog.Action onclick={() => { changed = true; open = false; }}>Confirm</AlertDialog.Action></AlertDialog.Content>\n</AlertDialog.Root>\n<p>{changed ? "Confirmed locally" : "Unchanged"}</p>',
    "Cancel leaves host state unchanged. Confirmation does not itself establish a committed ROM action.",
  ),
  family(
    "Alert",
    "alert",
    "",
    '<Alert.Root variant="destructive"><Alert.Title>Save rejected</Alert.Title><Alert.Description>Candidate values remain available.</Alert.Description></Alert.Root>',
    "Use sanitized host messages. The component preserves destructive text contrast.",
  ),
  family(
    "Card",
    "card",
    "",
    "<Card.Root><Card.Header><Card.Title>Resource</Card.Title><Card.Description>Authorized summary</Card.Description></Card.Header><Card.Content>Exact ID 9007199254740993</Card.Content><Card.Footer>Host supplied values</Card.Footer></Card.Root>",
    "Compose disclosed values inside the shared card.",
  ),
  family(
    "Breadcrumb",
    "breadcrumb",
    "",
    '<Breadcrumb.Root><Breadcrumb.List><Breadcrumb.Item><Breadcrumb.Link href="#resources">Resources</Breadcrumb.Link></Breadcrumb.Item><Breadcrumb.Separator/><Breadcrumb.Item><Breadcrumb.Page>Current resource</Breadcrumb.Page></Breadcrumb.Item></Breadcrumb.List></Breadcrumb.Root>',
    "Navigation targets belong to the host.",
  ),
  family(
    "Table",
    "table",
    "",
    "<Table.Root><Table.Caption>Resources</Table.Caption><Table.Header><Table.Row><Table.Head>ID</Table.Head><Table.Head>State</Table.Head></Table.Row></Table.Header><Table.Body><Table.Row><Table.Cell>9007199254740993</Table.Cell><Table.Cell>Ready</Table.Cell></Table.Row></Table.Body></Table.Root>",
    "The generic table keeps IDs as text. ROM owns query, revision and authorization semantics.",
  ),
  family(
    "Tooltip",
    "tooltip",
    "",
    "<Tooltip.Provider delayDuration={0}><Tooltip.Root><Tooltip.Trigger>Explain state</Tooltip.Trigger><Tooltip.Content>The host owns authorization.</Tooltip.Content></Tooltip.Root></Tooltip.Provider>",
    "Use a named keyboard-focusable trigger. Escape dismisses the tooltip.",
  ),
  family(
    "Separator",
    "separator",
    "",
    '<Separator.Separator orientation="horizontal" />',
    "Decorative and semantic separator options use the shared Bits UI contract.",
  ),
  family(
    "Skeleton",
    "skeleton",
    "",
    '<Skeleton.Skeleton aria-label="Loading resource" style="height: 1rem; width: 8rem" />',
    "The host controls loading lifetime and supplies an accessible status where needed.",
  ),
  family(
    "Sidebar",
    "sidebar",
    "  let open = $state(true);\n  let trigger = $state<HTMLButtonElement | null>(null);",
    '<Sidebar.Provider keyboardShortcut={false} persistState={false} bind:open>\n  <Sidebar.Root onMobileCloseAutoFocus={(event) => { event.preventDefault(); trigger?.focus(); }}>\n    <Sidebar.Content><Sidebar.Group><Sidebar.GroupLabel>Resources</Sidebar.GroupLabel><Sidebar.Menu><Sidebar.MenuItem><Sidebar.MenuButton>Choose resource</Sidebar.MenuButton></Sidebar.MenuItem></Sidebar.Menu></Sidebar.Group></Sidebar.Content>\n  </Sidebar.Root>\n  <Sidebar.Inset><Sidebar.Trigger bind:ref={trigger} aria-label="Toggle resource navigation" />Host content</Sidebar.Inset>\n</Sidebar.Provider>',
    "Preserve the mobile focus callback. Defaults preserve Studio: Ctrl/Cmd+B toggles and writes sidebar_state. Disable both policies for embedded frames. The host controls Resource selection.",
  ),
];
