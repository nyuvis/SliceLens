<script>
  import { metadata } from '../../stores.js';
  import ColorLegend from './ColorLegend.svelte';
  import Matrix from './Matrix.svelte';
  import * as d3 from 'd3';

  export let showPredictions;
  export let showSize;

  $: color = d3.scaleOrdinal()
      .domain($metadata.labelValues)
      .range(d3.schemeCategory10);
</script>

<div id="chart-container">
  <ColorLegend {showPredictions} {color}/>
  <Matrix {showPredictions} {showSize} {color}/>
</div>

<style>
    #chart-container {
      flex: 1;
      height: 100vh;

      display: flex;
      flex-direction: column;
    }
</style>