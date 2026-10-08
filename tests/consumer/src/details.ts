import { mount } from "svelte";
import "rom-ui/styles";
import Harness from "./DetailsCompositionHarness.svelte";
mount(Harness,{target: document.getElementById("app")!});
