<!-- https://observablehq.com/@d3/histogram -->
<script>
  import { dataset } from '../../../stores.js';
  import * as d3 from 'd3';

  export let feature;

  const margin = { top: 20, left: 50, right: 50, bottom: 100};
  let width = 200;
  let height = 200;

  $: visWidth = width - margin.left - margin.right;
  $: visHeight = height - margin.top - margin.bottom;

  $: data = d3.rollups(
    $dataset.map(d => d[feature]),
    g => g.length,
    d => d
  ).sort((a, b) => d3.descending(a[1], b[1]))
   .map(([value, count]) => ({ value: String(value), count }));

  $: xScale = d3.scaleBand()
      .domain(data.map(d => d.value))
      .range([0, visWidth])
      .padding(0.2);

  $: yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]).nice()
      .range([visHeight, 0]);

  const yFormat = d3.format("~s");
</script>

<div id="chart-container" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <g transform="translate({margin.left},{margin.top})">
      <g class="bars">
        {#each data as d}
          <rect
            x={xScale(d.value)}
            y={yScale(d.count)}
            width={xScale.bandwidth()}
            height={visHeight - yScale(d.count)}
            fill="#555555"
          />
        {/each}
      </g>

      <g class="x-axis">
        {#each xScale.domain() as tick}
          <line y1={visHeight} y2={visHeight} x2={visWidth} stroke="black"/>
          <g transform="translate({xScale(tick) + xScale.bandwidth() / 2 + 0.5},{visHeight})">
            <g transform="translate(0,7) rotate(-45)">
              {#if tick.length < 20}
                <text>{tick}</text>
              {:else}
                <text>
                  {tick.slice(0, 20)}...
                  <title>{tick}</title>
                </text>
              {/if}
            </g>
            <line y2=5 stroke="black"/>
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
      text-anchor: end;
      font-size: 10px;
    }

    .y-axis text {
      dominant-baseline: middle;
      text-anchor: end;
      font-size: 10px;
    }
</style>