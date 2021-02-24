<script>
  import { data, metadata, selectedFeatures } from '../../stores.js';
  import * as d3 from 'd3';

  export let showPredictions;
  export let showSize;
  export let color;

  let width = 600;
  let height = 600;
  const padding = 5;

  function getScales(selectedFeatures, space, reverse) {
    return selectedFeatures.map(feat => {
      const domain = d3.range(feat.values.length);

      if (reverse) {
        domain.reverse();
      }

      const scale = d3.scaleBand()
          .domain(domain)
          .range([0, space]);

      space = scale.bandwidth();

      return scale;
    });
  }

  function getPosition(d, features, scales) {
    const splits = features.map(feat => d.splits.get(feat.name));
    return d3.sum(d3.zip(scales, splits), ([scale, split]) => scale(split));
  }

  $: xFeatures = $selectedFeatures
    .filter((d, i) => i % 2 === 0)
    .map(feat => $metadata.features[feat]);

  $: yFeatures = $selectedFeatures
    .filter((d, i) => i % 2 !== 0)
    .map(feat => $metadata.features[feat]);

  $: xNumBins = xFeatures
      .map(feat => feat.values.length)
      .reduce((acc, cur) => acc *= cur, 1);

  $: yNumBins = yFeatures
      .map(feat => feat.values.length)
      .reduce((acc, cur) => acc *= cur, 1);

  $: maxSize = Math.min(width / xNumBins, height / yNumBins);
  $: maxSideLength = maxSize - padding;

  $: xScales = getScales(xFeatures, maxSize * xNumBins, false);
  $: yScales = getScales(yFeatures, maxSize * yNumBins, true);
</script>

<div id="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <!-- https://stackoverflow.com/questions/13069446/simple-fill-pattern-in-svg-diagonal-hatching -->
    <pattern id="stripes" width="3" height="3" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="3" style="stroke:white; stroke-width:3" />
    </pattern>

    <g>
      {#each $data as d}
        <rect
          x={getPosition(d, xFeatures, xScales)}
          y={getPosition(d, yFeatures, yScales)}
          width={maxSideLength}
          height={maxSideLength}
          fill="red">
        </rect>
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