<script>
  import * as d3 from 'd3';
  import { metadata } from "../../../stores.js";

  export let sideLength;
  export let padding;
  export let x;
  export let y;
  export let yMax;
  export let d;

  const margin = { top: 1, left: 1, right: 1, bottom: 1 };

  $: visWidth = sideLength - margin.left - margin.right;
  $: visHeight = sideLength - margin.top - margin.bottom;

  $: xScale = d3.scaleLinear()
      .domain($metadata.labelExtent).nice()
      .range([0, visWidth]);

  $: yScale = d3.scaleLinear()
      .domain([0, yMax]).nice()
      .range([visHeight, 0]);

  const yFormat = d3.format("~s");
  $: numXTicks = visWidth / 80;
  $: xFormat = xScale.tickFormat(numXTicks);
</script>

<g transform='translate({x + padding + margin.left},{y + padding + margin.top})'>
  <g class="bars">
    {#each d.labelBins as bin}
      {#if bin.x0 !== bin.x1}
        <rect
          x={xScale(bin.x0) + 1}
          y={yScale(bin.count)}
          width={xScale(bin.x1) - xScale(bin.x0) - 1}
          height={visHeight - yScale(bin.count)}
        />
      {/if}
    {/each}
  </g>

  <g class="x-axis">
    {#each xScale.ticks(numXTicks) as tick}
      <line y1={visHeight} y2={visHeight} x2={visWidth} stroke="black"/>
      <!-- <g transform="translate({xScale(tick) + 0.5},{visHeight})">
        <line y2=5 stroke="black"/>
        <text y=7>{xFormat(tick)}</text>
      </g> -->
    {/each}
  </g>

  <g class="y-axis">
    {#each yScale.ticks(3) as tick}
      <g transform="translate(-5,{yScale(tick)})">
        <line x2=5 stroke="black"/>
        <!-- <text x="-5">{yFormat(tick)}</text> -->
      </g>
    {/each}
  </g>
</g>

<style>
  .x-axis text {
    dominant-baseline: hanging;
    text-anchor: middle;
    font-size: 10px;
  }

  .y-axis text {
    dominant-baseline: middle;
    text-anchor: end;
    font-size: 10px;
  }

  .bars {
    fill: steelblue;
  }
</style>