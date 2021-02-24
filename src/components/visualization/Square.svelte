<script>
  import { onMount, tick } from 'svelte';
  import { dataset, data, metadata, selectedFeatures } from '../../stores.js';
  import ColorLegend from './ColorLegend.svelte';
  import * as d3 from 'd3';

  export let showPredictions;
  export let showSize;
  export let color;


  function getScales(selectedFeatures, metadata, space) {
    const scales = [];

    for (let i = 0; i < selectedFeatures.length; i += 1) {
      const feat = metadata.features[selectedFeatures[i]];

      const scale = d3.scaleBand()
          .domain(d3.range(feat.values.length))
          .range([0, space]);

      scales.push(scale);

      space = scale.bandwidth();
    }
  }

  function getPosition(d, features, scales) {
    const splits = features.map(feat => d.splits.get(feat));
    return d3.sum(d3.zip(scales, splits), ([split, scale]) => scale(split));
  }

  $: xFeatures = $selectedFeatures.filter((d, i) => i === 0);
  $: yFeatures = $selectedFeatures.filter((d, i) => i !== 0);

  $: xScales = getScales(xFeatures, $metadata, width);
  $: yScales = getScales(yFeatures, $metadata, height);

  let width;
  let height;
</script>

<div id="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <!-- https://stackoverflow.com/questions/13069446/simple-fill-pattern-in-svg-diagonal-hatching -->
    <pattern id="stripes" width="3" height="3" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="3" style="stroke:white; stroke-width:3" />
    </pattern>

    <g>
      {#each $data as d}
        <rect x={getPosition(d, xFeatures, xScales)} y={getPosition(d, yFeatures, yScales)} width="100" height="100" fill="red"></rect>
      {/each}
    </g>
  </svg>
</div>

<style>
    #chart {
      flex: 1;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
</style>