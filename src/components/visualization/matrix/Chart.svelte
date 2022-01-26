<script lang="ts">
  import { dataset } from '../../../stores.js';
  import ClassificationColorLegend from './ClassificationColorLegend.svelte';
  import RegressionColorLegend from './RegressionColorLegend.svelte';
  import Matrix from './Matrix.svelte';
  import * as d3 from 'd3';

  export let showPredictions: boolean;
  export let showSize: boolean;

  let color: any;

  $: if ($dataset.type === 'classification') {
    color = d3.scaleOrdinal<string, string, string>()
        .domain($dataset.labelValues)
        .range(d3.schemeCategory10)
        .unknown('black');
  } else {
    const thresholds = showPredictions ? $dataset.deltaThresholds : $dataset.groundTruthThresholds;
    const interpolator = showPredictions ? d3.interpolatePuOr : d3.interpolateBlues;

    color = d3.scaleThreshold<number, string, string>()
        .domain(thresholds)
        .range(d3.quantize(interpolator, thresholds.length + 1))
        .unknown('black');
  }
</script>

<div id="chart-container">
  {#if $dataset.type === 'classification'}
    <ClassificationColorLegend {showPredictions} {color}/>
  {:else}
    <RegressionColorLegend {showPredictions} {color}/>
  {/if}
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