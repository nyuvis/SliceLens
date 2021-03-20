<script>
  import Square from "./Square.svelte";
  import Grid from "./Grid.svelte";
  import XAxis from "./XAxis.svelte";
  import YAxis from "./YAxis.svelte";
  import Tooltip from "./Tooltip.svelte";
  import SizeLegend from "./SizeLegend.svelte";
  import { data, metadata, selectedFeatures } from "../../../stores.js";
  import { onMount } from 'svelte';
  import * as d3 from "d3";

  export let showPredictions;
  export let showSize;
  export let color;

  let div;

  let width = 600;
  let height = 600;
  const padding = 5;
  const axisLineHeight = 20;

  function getScales(selectedFeatures, space, reverse) {
    return selectedFeatures.map((feat) => {
      const domain = d3.range(feat.values.length);

      if (reverse) {
        domain.reverse();
      }

      const scale = d3.scaleBand().domain(domain).range([0, space]);

      space = scale.bandwidth();

      return scale;
    });
  }

  function getPosition(d, features, scales) {
    const splits = features.map((feat) => d.splits.get(feat.name));
    return d3.sum(d3.zip(scales, splits), ([scale, split]) => scale(split));
  }

  $: xFeatures = $selectedFeatures
    .filter((d, i) => i % 2 === 0)
    .map((feat) => $metadata.features[feat]);

  $: yFeatures = $selectedFeatures
    .filter((d, i) => i % 2 !== 0)
    .map((feat) => $metadata.features[feat]);

  $: axisSpace = {
    top: xFeatures.length * axisLineHeight * 2,
    left: yFeatures.length * axisLineHeight * 2,
  };

  $: margin = {
    top: 20 + axisSpace.top,
    left: 20 + axisSpace.left,
    bottom: 30,
    right: 20,
  };

  $: xNumBins = xFeatures
    .map((feat) => feat.values.length)
    .reduce((acc, cur) => (acc *= cur), 1);

  $: yNumBins = yFeatures
    .map((feat) => feat.values.length)
    .reduce((acc, cur) => (acc *= cur), 1);

  $: maxSize = Math.floor(
    Math.min(
      (width - margin.left - margin.right) / xNumBins,
      (height - margin.top - margin.bottom) / yNumBins
    )
  );

  $: maxSideLength = maxSize - 2 * padding;

  $: matrixHeight = maxSize * yNumBins;
  $: matrixWidth = maxSize * xNumBins;

  $: xScales = getScales(xFeatures, matrixWidth, false);
  $: yScales = getScales(yFeatures, matrixHeight, true);

  $: sideLength = d3.scaleSqrt()
    .domain([0, d3.max($data, (d) => d.size)])
    .range([0, maxSideLength]);

  $: topSpace =
    margin.top + (height - matrixHeight - margin.top - margin.bottom) / 2;
  $: leftSpace =
    margin.left + (width - matrixWidth - margin.left - margin.right) / 2;

  // tooltip

  let tooltipData = null;
  let mouse = { x: 0, y: 0};
  let bounds = { x: 0, y: 0};

  function handleMousemove(event, d) {
    // https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element
    // square -> squares' group -> main group -> svg
    const svg = event.currentTarget.parentNode.parentNode.parentNode.getBoundingClientRect();

    // put in coordinates of main group
    mouse.x = event.clientX - svg.x - leftSpace;
    mouse.y = event.clientY - svg.y - topSpace;

    // right and bottom of svg in coordinates of main group
    bounds.x = svg.width - leftSpace;
    bounds.y = svg.height - topSpace;

    tooltipData = d;
  }

  function handleMouseleave() {
    tooltipData = null;
  }

  // window resizing
  // without the delay, the div will occasionally not be at full height yet
  onMount(() => setTimeout(resize, 200));

	function resize() {
		({ width, height } = div.getBoundingClientRect());
	}
</script>

<svelte:window on:resize={resize}/>

<div id="chart" bind:this={div}>
  <svg>
    <!-- https://stackoverflow.com/questions/13069446/simple-fill-pattern-in-svg-diagonal-hatching -->
    <pattern
      id="stripes"
      width="3"
      height="3"
      patternTransform="rotate(45 0 0)"
      patternUnits="userSpaceOnUse"
    >
      <line x1="0" y1="0" x2="0" y2="3" style="stroke:white; stroke-width:3" />
    </pattern>

    {#if showSize}
      <g class="size-legend" transform="translate({leftSpace + padding},{height - margin.bottom})">
        <SizeLegend scale={sideLength}/>
      </g>
    {/if}

    <g class="margins" transform="translate({leftSpace},{topSpace})">
      <Grid {matrixHeight} {matrixWidth} {xScales} {yScales}/>

      <g class="x-axis" transform="translate(0,{-axisSpace.top})">
        <XAxis {xScales} {xFeatures} width={matrixWidth} {maxSideLength} {axisLineHeight} />
      </g>

      <g class="y-axis" transform="translate({-axisSpace.left},0)">
        <YAxis {yScales} {yFeatures} height={matrixHeight} {maxSideLength} {axisLineHeight} />
      </g>

      <g class="squares">
        {#each $data as d}
          <Square
            x={getPosition(d, xFeatures, xScales)}
            y={getPosition(d, yFeatures, yScales)}
            sideLength={showSize ? sideLength(d.size) : maxSideLength}
            {color}
            {showPredictions}
            {d}
            padding={showSize
              ? padding + (maxSideLength - sideLength(d.size)) / 2
              : padding}
            on:mousemove={event => handleMousemove(event, d)}
            on:mouseleave={handleMouseleave}
          />
        {/each}
      </g>

      {#if tooltipData}
        <Tooltip
          {...mouse}
          {bounds}
          {showPredictions}
          d={tooltipData}
        />
      {/if}
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
