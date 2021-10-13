<script>
  import * as d3 from 'd3';
  import { metadata } from "../../../stores.js";

  // export let color;
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
      .domain([$metadata.deltaExtent[0], $metadata.deltaExtent[2]]).nice()
      .range([0, visWidth]);

  $: yScale = d3.scaleLinear()
      .domain([0, yMax]).nice()
      .range([visHeight, 0]);

  // $: color = d3.scaleThreshold()
  //     .domain(d.deltaThresholds20)
  //     .range(d3.quantize(d3.interpolatePuOr, d.deltaThresholds20.length + 1));

  $: color = d3.scaleDiverging()
      .domain($metadata.deltaExtent)
      .interpolator(d3.interpolatePuOr);

  const yFormat = d3.format("~s");
  $: numXTicks = visWidth / 80;
  $: xFormat = xScale.tickFormat(numXTicks);
</script>

<g transform='translate({x + padding + margin.left},{y + padding + margin.top})'>
  <g class="bars">
    {#each d.deltaBins as bin}
      <rect
        x={xScale(bin.x0) + 1}
        y={yScale(bin.count)}
        width={Math.max(0, xScale(bin.x1) - xScale(bin.x0) - 1)}
        height={visHeight - yScale(bin.count)}
        fill={color(d3.mean([bin.x0, bin.x1]))}
      />
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
    <line y1={visHeight} y2={visHeight + 5} x1={xScale(0)} x2={xScale(0)} stroke="black"/>
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