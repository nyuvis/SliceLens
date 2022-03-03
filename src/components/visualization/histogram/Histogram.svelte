<!-- https://observablehq.com/@d3/histogram -->
<script lang="ts">
  import { dataset } from '../../../stores';
  import type { Row } from '../../../types';
  import * as d3 from 'd3';

  export let feature: string;
  export let thresholds: number[];

  const margin = { top: 20, left: 50, right: 50, bottom: 20};
  const numBins: number = 20;
  let width: number = 200;
  let height: number = 200;

  $: visWidth = width - margin.left - margin.right;
  $: visHeight = height - margin.top - margin.bottom;

  $: data = $dataset.rows.map((d: Row) => d[feature]) as number[];

  $: xScale = d3.scaleLinear()
      .domain(d3.extent(data)).nice()
      .range([0, visWidth]);

  let bins: { x0: number, x1: number, count: number }[];

  $: bins = d3.bin()
      .domain(xScale.domain() as [number, number])
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
            />
          {/if}
        {/each}
      </g>

      <g class="x-axis">
        {#each xScale.ticks(numXTicks) as tick}
          <line y1={visHeight} y2={visHeight} x2={visWidth} stroke="black"/>
          <g transform="translate({xScale(tick) + 0.5},{visHeight})">
            <line y2=5 stroke="black"/>
            <text y=7 dominant-baseline="hanging">{xFormat(tick)}</text>
          </g>
        {/each}

        {#each thresholds as threshold}
          <line
            x1={xScale(threshold) + 0.5}
            x2={xScale(threshold) + 0.5}
            y1={visHeight + 0.5}
            y2={visHeight + 5.5}
            stroke-width={2}
            stroke="red"
          />
        {/each}
      </g>

      <g class="y-axis">
        {#each yScale.ticks(3) as tick}
          <g transform="translate(-5,{yScale(tick)})">
            <line x2=5 stroke="black"/>
            <text x="-5" dominant-baseline="middle">{yFormat(tick)}</text>
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
      text-anchor: middle;
      font-size: 10px;
    }

    .y-axis text {
      text-anchor: end;
      font-size: 10px;
    }

    .bars {
      fill: var(--dark-gray);
    }
</style>