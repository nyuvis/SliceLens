<script>
  import { metadata } from '../../../stores.js';
  import CategoricalColorLegend from './CategoricalColorLegend.svelte';
  import ThresholdColorLegend from './ThresholdColorLegend.svelte';
  import Matrix from './Matrix.svelte';
  import * as d3 from 'd3';

  export let showPredictions;
  export let showSize;
  export let visualizationType;

  let color = null;

  $: if (!$metadata.isRegression) {
    color = d3.scaleOrdinal()
      .domain($metadata.labelValues ?? [])
      .range(d3.schemeCategory10)
  } else {
    const threholds = (showPredictions ? $metadata.deltaThresholds : $metadata.labelThresholds) ?? [];
    const interpolator = showPredictions ? d3.interpolatePuOr : d3.interpolateBlues;
    color = d3.scaleThreshold()
      .domain(threholds)
      .range(d3.quantize(interpolator, threholds.length + 1));
  }
</script>

<div id="chart-container">
  {#if !$metadata.isRegression}
    <CategoricalColorLegend {showPredictions} {color}/>
  {:else}
    <ThresholdColorLegend {showPredictions} show={visualizationType !== 'normal histogram' || showPredictions} {color}/>
  {/if}
  <Matrix {showPredictions} {showSize} {color} {visualizationType}/>
</div>

<style>
    #chart-container {
      flex: 1;
      height: 100vh;

      display: flex;
      flex-direction: column;
    }
</style>