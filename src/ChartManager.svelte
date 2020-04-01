<script>
  import { onMount } from 'svelte';
  import matrix from './matrix.js';
  import icicle from './icicle.js';
  import nodelink from './nodelink.js';
  import {getMetadata, getData} from './DataTransformer.js';
  import * as d3 from "d3";

  export let dataset = [];
  export let featureNames = [];
  export let selectedFeatures = [];
  export let splitType = 'interval';
  export let chart = nodelink();
  export let label = '';

  $: metadata = getMetadata(featureNames, dataset, label, splitType);
  $: data = getData(metadata.features, selectedFeatures, dataset);

  let width;
  let height;

  let div;
  let selection;

  // this feels like a hack
  // the intention is to clear the visualization when the dataset
  // or visualization type changes
  $: if ((dataset.length > 0 || chart) && selection !== undefined) {
    selection.select('svg').remove();
  }

  onMount(() => {
    selection = d3.select(div);
  });

  $: if (selection !== undefined) {
    chart.size([width, height]);
    selection.datum({metadata, data, selectedFeatures})
        .call(chart);
  }
</script>

<div bind:this={div} id="chart" bind:clientWidth={width} bind:clientHeight={height}>
</div>

<style>
    #chart {
        flex: 1;
        width: 100%;
        height: 100vh;
    }
</style>