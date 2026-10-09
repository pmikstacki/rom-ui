import 'rom-ui/styles';
import '@xyflow/svelte/dist/style.css';
import { mount } from 'svelte';
import FlowLifetimeHarness from './FlowLifetimeHarness.svelte';
mount(FlowLifetimeHarness, { target: document.getElementById('app')! });
