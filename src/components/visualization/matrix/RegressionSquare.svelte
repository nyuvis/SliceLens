<script lang="ts">
  import * as d3 from 'd3';
  import { showPredictions, color } from "../../../stores";
  import type { RegressionNode } from '../../../types';

  export let sideLength: number;
  export let padding: number;
  export let x: number;
  export let y: number;
  export let d: RegressionNode;

  $: height = d3.scaleLinear()
      .domain([0, d.size])
      .range([0, sideLength]);

  $: bins = $showPredictions ?
      d.predictions :
      d.groundTruth;
</script>

{#if "invertExtent" in $color}
  <g transform='translate({x + padding},{y + padding})' on:mousemove on:mouseleave>
    {#each bins as {x0, x1, offset, size}}
      <rect height={height(size)} y={height(offset)} width={sideLength} fill={$color((x0 + x1) / 2)}/>
    {/each}
  </g>
{/if}