<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import * as d3 from "d3";

  import icicle from './icicle.js';
  import nodelink from './nodelink.js';
  import matrix from './matrix.js';

  const dispatch = createEventDispatcher();

  const charts = [
    { value: icicle(), display: 'Icicle' },
    { value: nodelink(), display: 'Node Link' },
    { value: matrix(), display: 'Matrix' }
  ];

  // since this is basically a form component,
  // I wonder if componement binding would be okay here
  // same with split selector
  let chart = charts[0].value;
  $: dispatch('update', chart);
  onMount(() => dispatch('update', chart));
</script>

<div>
  <p class="control-label">Visualization</p>
  <select bind:value={chart}>
    {#each charts as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>
</div>