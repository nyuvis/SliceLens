<script lang="ts">
  import * as d3 from 'd3';
  import { showPredictions, color, dataset, showSize } from "../../../stores";
  import type { RegressionNode, RegressionDataset } from '../../../types';

  export let vertical: boolean;
  export let maxBarCountAcrossSubsets: number;
  export let sideLength: number;
  export let padding: number;
  export let x: number;
  export let y: number;
  export let d: RegressionNode;

  $: position = d3.scaleLinear()
      .domain($showPredictions ? ($dataset as RegressionDataset).deltaExtent : ($dataset as RegressionDataset).groundTruthExtent)
      .range([0, sideLength]);

  $: bins = $showPredictions ?
      d.predictions :
      d.groundTruth;

  $: maxBinSize = d3.max(bins, d => d.size);

  $: length = d3.scaleLinear<number, number, number>()
      .domain([0, $showSize ? maxBarCountAcrossSubsets : maxBinSize])
      .range([0, sideLength])
      .unknown(0);
</script>

{#if "invertExtent" in $color}
  <g transform='translate({x + padding},{y + padding})' on:mousemove on:mouseleave>
    <!-- this background rectangle is so the tooltip shows up when over space between bars-->
    <rect width={sideLength} height={sideLength} fill="white"/>
    {#if vertical}
      {#each bins as {x0, x1, size}}
        <rect
          x={position(x0)}
          y={sideLength - length(size)}
          height={length(size)}
          width={position(x1) - position(x0)}
          fill={$color(x0 + x1 / 2)}
        />
      {/each}
      <line y1={sideLength} y2={sideLength} x1={0} x2={sideLength} stroke="var(--medium-gray)"/>
    {:else}
      {#each bins as {x0, x1, size}}
        <rect
          y={position(x0)}
          x={0}
          height={position(x1) - position(x0)}
          width={length(size)}
          fill={$color(x0 + x1 / 2)}
        />
      {/each}
      <line x1={0} x2={0} y1={0} y2={sideLength} stroke="var(--medium-gray)"/>
    {/if}
  </g>
{/if}