<script>
  import Square from "./Square.svelte";
  import SquareDiff from "./SquareDiff.svelte";
  import SquareBar from "./SquareBar.svelte";
  import SquareWide from "./SquareWide.svelte";
  import SquareLine from "./SquareLine.svelte";
  import Grid from "./Grid.svelte";
  import XAxis from "./XAxis.svelte";
  import YAxis from "./YAxis.svelte";
  import Tooltip from "./Tooltip.svelte";
  import SizeLegend from "./SizeLegend.svelte";
  import { data, metadata, selectedFeatures } from "../../../stores.js";
  import { getScales, getPositionOfSquare } from "../../../DataTransformer.js"
  import { onMount } from 'svelte';
  import * as d3 from "d3";

  export let showPredictions;
  export let showSize;
  export let color;
  export let visualizationType;

  let div;

  // size of the div that the matrix is in
  let width = 600;
  let height = 600;

  // bounding box of the div
  let divBoundingBox = { left: 0, right: 0, top: 0, bottom: 0 };

  // space between rows and columns in the matrix
  const padding = 5;

  // height of one line of axis labels
  const axisLineHeight = 20;

  // feature objects that along the x axis
  $: xFeatures = $selectedFeatures
    .filter((d, i) => i % 2 === 0)
    .map((feat) => $metadata.features[feat]);

  // feature objects that are along the y axis
  $: yFeatures = $selectedFeatures
    .filter((d, i) => i % 2 !== 0)
    .map((feat) => $metadata.features[feat]);

  // extra space needed for labels
  $: axisSpace = {
    top: xFeatures.length * axisLineHeight * 2,
    left: yFeatures.length * axisLineHeight * 2,
  };

  // total amount of extra space around matrix
  // includes space for labels
  $: margin = {
    top: 20 + axisSpace.top,
    left: 20 + axisSpace.left,
    bottom: 30,
    right: 20,
  };

  // total number of columns in the matrix
  // if there are two features along the x-axis, each with 3 bins,
  // then there is a total of 3 * 3 = 9 columns
  $: xNumBins = xFeatures
    .map((feat) => feat.values.length)
    .reduce((acc, cur) => (acc *= cur), 1);

  // total number of rows in the matrix
  $: yNumBins = yFeatures
    .map((feat) => feat.values.length)
    .reduce((acc, cur) => (acc *= cur), 1);

  // the length of the side of one cell in the matrix
  // put another way, the width of one row or column in the matrix
  $: maxSize = Math.floor(
    Math.min(
      (width - margin.left - margin.right) / xNumBins,
      (height - margin.top - margin.bottom) / yNumBins
    )
  );

  // the maximum side length of a square in the matrix
  $: maxSideLength = maxSize - 2 * padding;

  // dimensions of the matrix
  $: matrixHeight = maxSize * yNumBins;
  $: matrixWidth = maxSize * xNumBins;

  $: xScales = getScales(xFeatures, matrixWidth, false);
  $: yScales = getScales(yFeatures, matrixHeight, true);

  // number of instances in square to side length
  $: sideLength = d3.scaleSqrt()
    .domain([0, d3.max($data, (d) => d.size)])
    .range([0, maxSideLength]);

  // space between the top (left) of the div and the top (left) of the matrix
  // this centers the matrix in the div
  // this includes the space for margins
  $: topSpace =
    margin.top + (height - matrixHeight - margin.top - margin.bottom) / 2;
  $: leftSpace =
    margin.left + (width - matrixWidth - margin.left - margin.right) / 2;

  // tooltip

  let tooltipData = null;
  let mouse = { x: 0, y: 0 };

  // the boundaries that we want to keep the tooltip inside of
  $: bounds = {
    // we don't want the tooltip to overlap the labels
    top: divBoundingBox.top + topSpace,
    left: divBoundingBox.left + leftSpace,
    right: divBoundingBox.right,
    bottom: divBoundingBox.bottom
  };

  function handleMousemove(event, d) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    tooltipData = d;
  }

  function handleMouseleave() {
    tooltipData = null;
  }

  // window resizing

  // without the delay, the div will occasionally not be at full height yet
  onMount(() => setTimeout(resize, 200));

  function resize() {
    divBoundingBox = div.getBoundingClientRect();
    ({ width, height } = divBoundingBox);
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
        <XAxis {xScales} {xFeatures} width={matrixWidth} {axisLineHeight} />
      </g>

      <g class="y-axis" transform="translate({-axisSpace.left},0)">
        <YAxis {yScales} {yFeatures} height={matrixHeight} {axisLineHeight} />
      </g>

      <g class="squares">
        {#each $data as d}
          {#if visualizationType === 'squares'}
            <Square
              x={getPositionOfSquare(d, xFeatures, xScales)}
              y={getPositionOfSquare(d, yFeatures, yScales)}
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
          {:else if visualizationType === 'squares-diff'}
            <SquareDiff
              x={getPositionOfSquare(d, xFeatures, xScales)}
              y={getPositionOfSquare(d, yFeatures, yScales)}
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
          {:else if visualizationType === 'squares-bar'}
            <SquareBar
              x={getPositionOfSquare(d, xFeatures, xScales)}
              y={getPositionOfSquare(d, yFeatures, yScales)}
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
          {:else if visualizationType === 'squares-wide'}
            <SquareWide
              x={getPositionOfSquare(d, xFeatures, xScales)}
              y={getPositionOfSquare(d, yFeatures, yScales)}
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
          {:else if visualizationType === 'squares-line'}
            <SquareLine
              x={getPositionOfSquare(d, xFeatures, xScales)}
              y={getPositionOfSquare(d, yFeatures, yScales)}
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
          {/if}
        {/each}
      </g>
    </g>
  </svg>
  {#if tooltipData}
    <Tooltip
      {...mouse}
      {bounds}
      {showPredictions}
      d={tooltipData}
      {color}
    />
  {/if}
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
