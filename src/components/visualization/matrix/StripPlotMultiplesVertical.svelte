<script lang='ts'>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import { drawStripMultiplesVertical, scaleCanvas } from '../../../lib/VisUtils';
  import { getStripPlotMultiplesData } from '../../../lib/VisQueries';
  import { dataset } from '../../../stores';
  import XAxis from './XAxis.svelte';
  import YAxis from './YAxis.svelte';

  export let width: number;
  export let height: number;

  export let yDomain: [number, number];
  export let xDomain: string[];
  export let xValueToGroup: Record<string, string>;

  export let xCol: string = '';
  export let yCol: string = '';

  export let margin = { top: 25, right: 25, bottom: 50, left: 50 };

  let canvas;
  let ctx;

  const radius = 2;

  $: y = d3.scaleLinear()
    .domain(yDomain)
    .range([height - margin.bottom, margin.top]);

  $: fx = d3.scaleBand<string>()
    .domain(xDomain)
    .range([margin.left, width - margin.right])
    .paddingInner(0.2);

  $: x = d3.randomUniform(0, fx.bandwidth());

  $: pointsQ = getStripPlotMultiplesData(yCol, xCol);

  onMount(() => {
    ctx = canvas.getContext('2d');
  });

  $: if (ctx) scaleCanvas(canvas, ctx, width, height);
  $: if (ctx) drawStripMultiplesVertical(pointsQ, ctx, width, height, y, fx, xValueToGroup, x, radius, $dataset);
</script>

<div>
  <canvas bind:this={canvas}></canvas>
  <svg width={width} height={height}>
    <XAxis
      scale={fx}
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
      label={yCol}
      x={margin.left}
      y={0}
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