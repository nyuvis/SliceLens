<script lang='ts'>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import { drawScatterBinnedCircleRegression, scaleCanvas } from '../../../lib/VisUtils';
  import { getScatterBinnedData } from '../../../lib/VisQueries';
  import { dataset } from '../../../stores';
  import XAxis from './XAxis.svelte';
  import YAxis from './YAxis.svelte';

  export let width: number;
  export let height: number;

  export let xDomain: [number, number];
  export let yDomain: [number, number];

  export let xCol: string = '';
  export let yCol: string = '';

  export let margin = { top: 25, right: 25, bottom: 50, left: 50 };

  let canvas;
  let ctx;

  // nice the domains separately from the x and y scales
  // the x and y scales update when the chart resizes, but we
  // do not want to run the query every time the chart resizes
  $: xDomainNice = d3.scaleLinear().domain(xDomain).nice().domain()
  $: yDomainNice = d3.scaleLinear().domain(yDomain).nice().domain()

  $: x = d3.scaleLinear()
    .domain(xDomainNice)
    .range([margin.left, width - margin.right]);

  $: y = d3.scaleLinear()
    .domain(yDomainNice)
    .range([height - margin.bottom, margin.top]);

  const xNumBins = 50;
  const yNumBins = 50;

  $: xBinSize = (xDomainNice[1] - xDomainNice[0]) / xNumBins;
  $: yBinSize = (yDomainNice[1] - yDomainNice[0]) / yNumBins;

  $: pointsQ = getScatterBinnedData(xCol, yCol, xBinSize, yBinSize, xDomainNice[0], yDomainNice[0]);

  onMount(() => {
    ctx = canvas.getContext('2d');
  });

  $: if (ctx) scaleCanvas(canvas, ctx, width, height);
  $: if (ctx) drawScatterBinnedCircleRegression(pointsQ, ctx, width, height, x, y, xBinSize, yBinSize, xNumBins, yNumBins, $dataset);
</script>

<div>
  <canvas bind:this={canvas}></canvas>
  <svg width={width} height={height}>
    <XAxis
      scale={x}
      width={width}
      height={height}
      margin={margin}
      x={0}
      y={height - margin.bottom}
      label={xCol}
    />

    <YAxis
      scale={y}
      width={width}
      height={height}
      margin={margin}
      x={margin.left}
      y={0}
      label={yCol}
    />
  </svg>
</div>

<style>
  div {
    position: relative;
    width: 100%;
    height: 100%;
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>