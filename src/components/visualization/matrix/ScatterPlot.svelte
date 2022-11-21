<script lang='ts'>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import { drawScatterDots, scaleCanvas } from '../../../lib/VisUtils';
  import { getScatterPlotData } from '../../../lib/VisQueries';
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

  const radius = 2;

  $: x = d3.scaleLinear()
    .domain(xDomain).nice()
    .range([margin.left, width - margin.right]);

  $: y = d3.scaleLinear()
    .domain(yDomain).nice()
    .range([height - margin.bottom, margin.top]);

  $: pointsQ = getScatterPlotData(xCol, yCol);

  onMount(() => {
    ctx = canvas.getContext('2d');
  });

  $: if (ctx) scaleCanvas(canvas, ctx, width, height);
  $: if (ctx) drawScatterDots(pointsQ, ctx, width, height, x, y, radius, $dataset);
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