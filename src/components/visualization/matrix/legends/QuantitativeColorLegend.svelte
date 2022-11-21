<!--
   References code from: https://observablehq.com/@d3/color-legend
   Copyright 2021, Observable Inc.
   Released under the ISC license.
 -->

<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  export let width;
  export let height;
  export let color: d3.ScaleSequential<string, string>;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let format = d3.format('~s');

  onMount(() => {
    ctx = canvas.getContext('2d');
  });

  function drawRegressionColorScale(ctx: CanvasRenderingContext2D, interpolator: (t: number) => string) {
    for (let i = 0; i < width; i++) {
      ctx.fillStyle = interpolator(i / width);
      ctx.fillRect(i, 0, 1, height);
    }
  }

  $: if (ctx) drawRegressionColorScale(ctx, color.interpolator());

  $: x = d3.scaleLinear()
      .domain(color.domain())
      .range([0, width]);

  const spacing = 5;
  const textHeight = 10;

  $: barHeight = height - textHeight - spacing;
</script>

<div style="height: {height}px;">
  <canvas {width} height={barHeight} bind:this={canvas}/>
  <svg {width} {height}>
    {#each x.ticks() as tick}
      <g transform="translate({x(tick)})">
        <line y2={barHeight} stroke="black"/>
        <text
          y={barHeight + spacing}
          dominant-baseline="hanging"
          text-anchor="middle"
          font-size={10}
        >
          {format(tick)}
        </text>
      </g>
    {/each}
  </svg>
</div>

<style>
  div {
    position: relative;
  }

  svg {
    position: absolute;
    left: 0;
    top: 0;
  }
</style>
