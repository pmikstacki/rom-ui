import { mount } from "svelte";
import "rom-ui/styles";
import Harness from "./ReferenceCompositionHarness.svelte";
mount(Harness,{target:document.getElementById("app")!});
