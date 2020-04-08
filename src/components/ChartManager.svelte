<script>
  import { onMount } from 'svelte';
  import { dataset, data, metadata, selectedFeatures } from '../stores.js';
  import matrix from '../visualization/matrix.js';
  import icicle from '../visualization/icicle.js';
  import nodelink from '../visualization/nodelink.js';
  import * as d3 from 'd3';

  export let chart;

  let width = 800;
  let height = 600;

  let svg;
  let selection;

  // this feels like a hack
  // the intention is to clear the visualization when the dataset
  // or visualization type changes
  $: if (($dataset.length > 0 || chart) && svg !== undefined) {
    svg.innerHTML = '';
  }

  onMount(() => {
    selection = d3.select(svg);
  });

  $: if (selection !== undefined && $data !== null) {
    chart.size([width, height]);
    
    const chartData = {
      metadata: $metadata,
      data: $data,
      selectedFeatures: $selectedFeatures
    };

    selection.datum(chartData)
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