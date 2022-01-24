<script lang="ts">
  import { dataset } from '../../../stores.js';
  import ColorLegend from './ColorLegend.svelte';
  import Matrix from './Matrix.svelte';
  import * as d3 from 'd3';

  export let showPredictions: boolean;
  export let showSize: boolean;

  let color: d3.ScaleOrdinal<string, string, string>;
  $: color = d3.scaleOrdinal<string>()
      .domain($dataset.labelValues)
      .range(d3.schemeCategory10)
      .unknown("black");
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