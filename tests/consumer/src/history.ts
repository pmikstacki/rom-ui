import { mount } from "svelte";
import "rom-ui/styles";
import Harness from "./HistoryCompositionHarness.svelte";
mount(Harness,{target: document.getElementById("app")!});
