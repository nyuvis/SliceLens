<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import * as d3 from "d3";

  import icicle from '../visualization/icicle.js';
  import nodelink from '../visualization/nodelink.js';
  import matrix from '../visualization/matrix.js';

  const dispatch = createEventDispatcher();

  const charts = [
    { value: matrix(), display: 'Matrix' },
    { value: icicle(), display: 'Icicle' },
    { value: nodelink(), display: 'Node Link' },
  ];

  // since this is basically a form component,
  // I wonder if componement binding would be okay
  let chart = charts[0].value;
  $: dispatch('update', chart);
  onMount(() => dispatch('update', chart));
</script>

<div>
  <p class="label">Visualization</p>
  <select bind:value={chart}>
    {#each charts as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>
</div>