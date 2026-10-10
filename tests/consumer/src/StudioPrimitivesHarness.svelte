<script lang="ts">
  import { Badge, type BadgeVariant } from "rom-ui/controls";
  import { Switch } from "rom-ui/primitives/switch";
  import * as Select from "rom-ui/primitives/select";
  import * as Tabs from "rom-ui/primitives/tabs";
  import * as Menu from "rom-ui/primitives/dropdown-menu";
  import * as AlertDialog from "rom-ui/primitives/alert-dialog";
  import * as Alert from "rom-ui/primitives/alert";
  import * as Card from "rom-ui/primitives/card";
  import * as Breadcrumb from "rom-ui/primitives/breadcrumb";
  import * as Table from "rom-ui/primitives/table";
  import * as Tooltip from "rom-ui/primitives/tooltip";
  import * as Sidebar from "rom-ui/primitives/sidebar";
  import { Separator } from "rom-ui/primitives/separator";
  import { Skeleton } from "rom-ui/primitives/skeleton";
  let enabled = $state(false);
  let choice = $state("first");
  let tab = $state("details");
  let changes = $state(0);
  let disabled = $state(false);
  let confirmOpen = $state(false);
  let sidebarOpen = $state(true);
  let embeddedOpen = $state(true);
  let trigger = $state<HTMLButtonElement | null>(null);
  let badgeRef = $state<HTMLAnchorElement | null>(null);
  const variant: BadgeVariant = "outline";
</script>

<main>
  <h1>Installed Studio primitives</h1>
  <Badge {variant} href="#destination" bind:ref={badgeRef}>Resource badge</Badge
  >
  <Badge variant="secondary">Read only badge</Badge>
  <p data-testid="badge-ref">{badgeRef?.tagName}</p>
  <button onclick={() => (disabled = !disabled)}>Toggle disabled</button>
  <label for="shared-switch">Live updates</label>
  <Switch id="shared-switch" bind:checked={enabled} {disabled} />
  <Select.Root type="single" bind:value={choice} {disabled}>
    <Select.Trigger aria-label="Resource view"
      ><Select.Value placeholder="Select view" /></Select.Trigger
    >
    <Select.Content
      ><Select.Item value="first">First view</Select.Item><Select.Item
        value="second">Second view</Select.Item
      ></Select.Content
    >
  </Select.Root>
  <Tabs.Root bind:value={tab}>
    <Tabs.List aria-label="Resource sections"
      ><Tabs.Trigger value="details">Details</Tabs.Trigger><Tabs.Trigger
        value="history">History</Tabs.Trigger
      ></Tabs.List
    >
    <Tabs.Content value="details">Current resource values</Tabs.Content
    ><Tabs.Content value="history">Committed resource history</Tabs.Content>
  </Tabs.Root>
  <Menu.Root
    ><Menu.Trigger>Resource actions</Menu.Trigger><Menu.Content
      ><Menu.Item onclick={() => changes++}>Inspect resource</Menu.Item
      ><Menu.Item disabled>Unavailable action</Menu.Item></Menu.Content
    ></Menu.Root
  >
  <AlertDialog.Root bind:open={confirmOpen}
    ><AlertDialog.Trigger>Confirm change</AlertDialog.Trigger
    ><AlertDialog.Content
      ><AlertDialog.Title>Confirm resource change</AlertDialog.Title
      ><AlertDialog.Description
        >The host applies this action.</AlertDialog.Description
      ><AlertDialog.Cancel>Keep resource</AlertDialog.Cancel><AlertDialog.Action
        onclick={() => {
          changes++;
          confirmOpen = false;
        }}>Apply change</AlertDialog.Action
      ></AlertDialog.Content
    ></AlertDialog.Root
  >
  <Alert.Root variant="destructive"
    ><Alert.Title>Save rejected</Alert.Title><Alert.Description
      >Candidate values remain available.</Alert.Description
    ></Alert.Root
  >
  <Card.Root
    ><Card.Header
      ><Card.Title>Resource card</Card.Title><Card.Description
        >Authorized summary</Card.Description
      ></Card.Header
    ><Card.Content>Exact ID resource/9007199254740993</Card.Content><Card.Footer
      >Host supplied data</Card.Footer
    ></Card.Root
  >
  <Breadcrumb.Root
    ><Breadcrumb.List
      ><Breadcrumb.Item
        ><Breadcrumb.Link href="#resources">Resources</Breadcrumb.Link
        ></Breadcrumb.Item
      ><Breadcrumb.Separator /><Breadcrumb.Item
        ><Breadcrumb.Page>Current resource</Breadcrumb.Page></Breadcrumb.Item
      ></Breadcrumb.List
    ></Breadcrumb.Root
  >
  <Separator />
  <Table.Root
    ><Table.Caption>Resource projection</Table.Caption><Table.Header
      ><Table.Row
        ><Table.Head>ID</Table.Head><Table.Head>State</Table.Head></Table.Row
      ></Table.Header
    ><Table.Body
      ><Table.Row
        ><Table.Cell>9007199254740993</Table.Cell><Table.Cell>Ready</Table.Cell
        ></Table.Row
      ></Table.Body
    ></Table.Root
  >
  <Tooltip.Provider delayDuration={0}
    ><Tooltip.Root
      ><Tooltip.Trigger>Explain state</Tooltip.Trigger><Tooltip.Content
        >The host owns authorization.</Tooltip.Content
      ></Tooltip.Root
    ></Tooltip.Provider
  >
  <Skeleton aria-label="Loading resource" style="height: 1rem; width: 8rem" />
  <Sidebar.Provider bind:open={sidebarOpen} style="min-height: 12rem">
    <Sidebar.Root
      collapsible="icon"
      onMobileCloseAutoFocus={(event) => {
        event.preventDefault();
        trigger?.focus();
      }}
    >
      <Sidebar.Content
        ><Sidebar.Group
          ><Sidebar.GroupLabel>Resource navigation</Sidebar.GroupLabel
          ><Sidebar.Menu
            ><Sidebar.MenuItem
              ><Sidebar.MenuButton onclick={() => changes++}
                >Choose resource</Sidebar.MenuButton
              ></Sidebar.MenuItem
            ></Sidebar.Menu
          ></Sidebar.Group
        ></Sidebar.Content
      >
    </Sidebar.Root>
    <Sidebar.Inset
      ><Sidebar.Trigger
        bind:ref={trigger}
        aria-label="Toggle resource navigation"
      />Panel content</Sidebar.Inset
    >
  </Sidebar.Provider>
  <Sidebar.Provider
    keyboardShortcut={false}
    persistState={false}
    bind:open={embeddedOpen}
    style="min-height: 1rem"
  >
    <Sidebar.Trigger aria-label="Toggle embedded navigation" />
  </Sidebar.Provider>
  <output data-testid="embedded-state">{String(embeddedOpen)}</output>
  <output data-testid="primitive-state"
    >{JSON.stringify({ enabled, choice, tab, changes, sidebarOpen })}</output
  >
</main>

<style>
  main {
    padding: 1rem;
    display: grid;
    gap: 1rem;
  }
  main :global([data-slot="sidebar-container"]) {
    position: relative;
    height: 12rem;
  }
  main :global([data-slot="sidebar-gap"]) {
    display: none;
  }
</style>
