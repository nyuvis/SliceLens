<script>
  import { onMount, tick } from 'svelte';
  import { dataset, data, metadata, selectedFeatures } from '../stores.js';
  import matrix from '../visualization/matrix.js';
  import icicle from '../visualization/icicle.js';
  import nodelink from '../visualization/nodelink.js';
  import * as d3 from 'd3';

  export let chart;
  export let showPredictions;

  let width = 800;
  let height = 600;

  let svg;
  let selection;

  // clear the visualization when dataset or chart type changes
  $: if (($dataset.length > 0 || chart) && svg !== undefined) {
    svg.innerHTML = '';
  }

  onMount(() => {
    selection = d3.select(svg);
  });

  // TODO: better ways to keep showPredictions and $metadata.hasPredictions in sync?
  $: if (selection !== undefined && $data !== null) {
    chart
      .size([width, height])
      .showPredictions(showPredictions && $metadata.hasPredictions);

    const chartData = {
      metadata: $metadata,
      data: $data,
      selectedFeatures: $selectedFeatures
    };

    tick().then(() => {
      selection.datum(chartData)
        .call(chart);
    });
  }
</script>

<div id="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <!-- https://stackoverflow.com/questions/13069446/simple-fill-pattern-in-svg-diagonal-hatching -->
    <pattern id="stripes" width="3" height="3" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="3" style="stroke:white; stroke-width:3" />
    </pattern>
    <g bind:this={svg}></g>
  </svg>
</div>

<style>
    #chart {
      flex: 1;
      height: 100vh;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
</style>