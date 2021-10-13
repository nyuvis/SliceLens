<!--
  References code from: https://observablehq.com/@d3/color-legend
  Copyright 2021, Observable Inc.
  Released under the ISC license.
-->

<script>
  import * as d3 from 'd3';

  export let show;
  export let showPredictions;
  export let color;

  const x = d3.scaleBand()
    .domain(d3.range(color.range().length))
    .range([0, 400]);

  const format = d3.format('~s');
</script>

<div id="legend" class="small">
  <div class="bold title">{showPredictions ? 'Predicted Target - Ground Truth Target' : 'Ground Truth Targets'}</div>
  {#if show}
    <svg>
      {#each color.range() as c, i}
        <rect x={x(i)} width={x.bandwidth()} height={15} fill={c}/>

        {#if i !== 0}
          <line x1={x(i)} x2={x(i)} y1={0} y2={15} stroke="black"/>
          {#if i % 2 === 0}
            <text dominant-baseline="hanging" text-anchor="middle" y={18} x={x(i)}>{format(color.domain()[i - 1])}</text>
          {/if}
        {/if}
      {/each}
    </svg>
  {/if}
</div>

<style>
    #legend {
      flex: 0 0 40px;
      max-height: 40px;
      margin-left: 5px;

      display: flex;
      align-items: center;
    }

    svg {
      display: block;
      width: 400px;
      height: 30px;
      margin-left: 10px;
    }
</style>