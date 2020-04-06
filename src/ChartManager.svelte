<script>
  import { onMount } from 'svelte';
  import matrix from './matrix.js';
  import icicle from './icicle.js';
  import nodelink from './nodelink.js';
  import * as d3 from 'd3';

  export let dataset;
  export let chart;
  export let metadata;
  export let data;
  export let selectedFeatures;

  let width = 800;
  let height = 600;

  $: console.log(width);
  $: console.log(height);

  let svg;
  let selection;

  // this feels like a hack
  // the intention is to clear the visualization when the dataset
  // or visualization type changes
  $: if ((dataset.length > 0 || chart) && svg !== undefined) {
    svg.innerHTML = '';
  }

  onMount(() => {
    selection = d3.select(svg);
  });

  $: if (selection !== undefined) {
    chart.size([width, height]);
    selection.datum({metadata, data, selectedFeatures})
        .call(chart);
  }
</script>

<div id="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg bind:this={svg}></svg>
</div>

<style>
    #chart {
        flex: 1;
        height: 100vh;
    }

    svg {
      width: 100%;
      height: 100%;
    }
</style>