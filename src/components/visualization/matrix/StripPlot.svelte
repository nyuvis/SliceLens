<script lang='ts'>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import { drawStripDots, scaleCanvas } from '../../../lib/VisUtils';
  import { getStripPlotData } from '../../../lib/VisQueries';
  import { dataset } from '../../../stores';
  import XAxis from './XAxis.svelte';

  export let width: number;
  export let height: number;

  export let xDomain: [number, number];

  export let xCol: string = '';

  export let margin = { top: 25, right: 25, bottom: 50, left: 50 };

  let canvas;
  let ctx;

  const radius = $dataset.size >= 10000 ? 1 : 2;

  $: x = d3.scaleLinear()
    .domain(xDomain)
    .range([margin.left, width - margin.right]);

  $: y = d3.randomUniform(margin.top, height - margin.bottom)

  $: pointsQ = getStripPlotData(xCol);

  onMount(() => {
    ctx = canvas.getContext('2d');
  });

  $: if (ctx) scaleCanvas(canvas, ctx, width, height);
  $: if (ctx) drawStripDots(pointsQ, ctx, width, height, x, y, radius, $dataset);
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