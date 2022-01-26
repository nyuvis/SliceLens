<!--
   References code from: https://observablehq.com/@d3/color-legend
   Copyright 2021, Observable Inc.
   Released under the ISC license.
 -->

<script lang="ts">
  import * as d3 from 'd3';

  export let showPredictions: boolean;
  export let color: d3.ScaleThreshold<number, string>;

  const width = 400;
  const height = 30;

  const x = d3.scaleLinear()
      .domain([-1, color.range().length - 1])
      .range([0, width]);

  const format = d3.format('~s');
</script>

<div id="legend" class="small">
  <div class="bold title">{showPredictions ? 'Ground Truth - Predicted Labels' : 'Ground Truth Labels'}</div>

  <svg {width} {height}>
    {#each color.range() as c, i}
      <rect x={x(i - 1)} y={0} width={x(i) - x(i - 1)} height={height / 2} fill={c}/>

      {#if i !== 0}
        <line x1={x(i - 1)} x2={x(i - 1)} y1={0} y2={height / 2} stroke="black"/>
        {#if i % 2 === 0}
          <text dominant-baseline="hanging" text-anchor="middle" y={(height / 2) + 2} x={x(i - 1)}>
            {format(color.domain()[i - 1])}
          </text>
        {/if}
      {/if}
    {/each}
  </svg>

</div>

<style>
    #legend {
      flex: 0 0 40px;
      max-height: 40px;
      margin-left: 5px;

      display: flex;
      align-items: center;
    }

    .title {
      margin-right: 1em;
    }
</style>