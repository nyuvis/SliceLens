<!-- https://observablehq.com/@d3/histogram -->
<script>
  import { dataset } from '../../../stores.js';
  import * as d3 from 'd3';

  export let feature;

  const margin = { top: 20, left: 50, right: 50, bottom: 20};
  const numBins = 20;
  let width = 200;
  let height = 200;

  $: visWidth = width - margin.left - margin.right;
  $: visHeight = height - margin.top - margin.bottom;

  $: data = $dataset.map(d => d[feature]);

  $: xScale = d3.scaleLinear()
      .domain(d3.extent(data)).nice()
      .range([0, visWidth]);

  $: bins = d3.bin()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(numBins))(data)
      .map(b => ({ x0: b.x0, x1: b.x1, count: b.length}));

  $: yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, b => b.count)]).nice()
      .range([visHeight, 0]);

  const yFormat = d3.format("~s");
  $: numXTicks = visWidth / 80;
  $: xFormat = xScale.tickFormat(numXTicks);
</script>

<div id="chart-container" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <g transform="translate({margin.left},{margin.top})">
      <g class="bars">
        {#each bins as bin}
          {#if bin.x0 !== bin.x1}
            <rect
              x={xScale(bin.x0) + 1}
              y={yScale(bin.count)}
              width={xScale(bin.x1) - xScale(bin.x0) - 1}
              height={visHeight - yScale(bin.count)}
              fill="steelblue"
            />
          {/if}
        {/each}
      </g>

      <g class="x-axis">
        {#each xScale.ticks(numXTicks) as tick}
          <line y1={visHeight} y2={visHeight} x2={visWidth} stroke="black"/>
          <g transform="translate({xScale(tick) + 0.5},{visHeight})">
            <line y2=5 stroke="black"/>
            <text y=7>{xFormat(tick)}</text>
          </g>
        {/each}
      </g>

      <g class="y-axis">
        {#each yScale.ticks(3) as tick}
          <g transform="translate(-5,{yScale(tick)})">
            <line x2=5 stroke="black"/>
            <text x="-5">{yFormat(tick)}</text>
          </g>
        {/each}
      </g>
    </g>
  </svg>
</div>

<style>
    #chart-container {
      width: 100%;
      height: 200px;
    }

    svg {
      width: 100%;
      height: 100%;
    }

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
</style>