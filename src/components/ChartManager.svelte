<script>
  import { onMount, tick } from 'svelte';
  import { dataset, data, metadata, selectedFeatures } from '../stores.js';
  import matrix from '../visualization/matrix.js';
  import * as d3 from 'd3';

  export let showPredictions;
  export let showSize;

  let chart = matrix();

  let width = 800;
  let height = 600;

  let svg;
  let selection;
  let color;

  $: if ($metadata !== null) {
    color = d3.scaleOrdinal()
      .domain($metadata.labelValues)
      .range(d3.schemeCategory10);
  }

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
      .color(color)
      .showPredictions(showPredictions && $metadata.hasPredictions)
      .showSize(showSize);

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

<div id="chart-container">
  <div id="legend">
    {#if $metadata !== null}
      {#each $metadata.labelValues as label}
        <div class="legend-cell">
          <div class="legend-square" style="background: {color(label)}"></div>
          <p class="small legend-label">{label}
          </p>
        </div>
      {/each}
      {#if showPredictions && $metadata.hasPredictions}
        <div class="legend-cell">
            <div class="legend-square" id="incorrect"></div>
            <p class="small legend-label">Incorrect</p>
        </div>
      {/if}
    {/if}
  </div>

  <div id="chart" bind:clientWidth={width} bind:clientHeight={height}>
    <svg>
      <!-- https://stackoverflow.com/questions/13069446/simple-fill-pattern-in-svg-diagonal-hatching -->
      <pattern id="stripes" width="3" height="3" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="3" style="stroke:white; stroke-width:3" />
      </pattern>
      <g bind:this={svg}></g>
    </svg>
  </div>
</div>

<style>
    #chart-container {
      flex: 1;
      height: 100vh;

      display: flex;
      flex-direction: column;
    }

    #chart {
      flex: 1;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    #legend {
      flex: 0 0 20px;
      max-height: 20px;
      margin-top: 5px;

      display: flex;
    }

    .legend-cell {
      display: flex;
      align-items: center;
    }

    .legend-square {
      width: 14px;
      height: 14px;
      margin-right: 0.5em;
      margin-left: 1em;
    }

    #incorrect {
      background: repeating-linear-gradient(
        135deg,
        black,
        black 2px,
        white 2px,
        white 4px
      );
    }
</style>