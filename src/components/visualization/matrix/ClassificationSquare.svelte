<script lang="ts">
  import * as d3 from 'd3';
  import { showPredictions, color } from "../../../stores";
  import type { ClassificationNode } from '../../../types';

  export let sideLength: number;
  export let padding: number;
  export let x: number;
  export let y: number;
  export let d: ClassificationNode;

  $: height = d3.scaleLinear()
      .domain([0, d.size])
      .range([0, sideLength]);

  $: parts = $showPredictions ?
      d.predictions :
      d.groundTruth;
</script>

{#if !("invertExtent" in $color)}
  <g transform='translate({x + padding},{y + padding})' on:mousemove on:mouseleave>
    {#each parts as {label, size, offset, correct}}
      <g transform="translate(0,{height(offset)})">
        <rect height={height(size)} width={sideLength} fill={$color(label)}/>
        {#if !correct}
          <rect height={height(size)} width={sideLength} fill="url(#stripes)"/>
        {/if}
      </g>
    {/each}
  </g>
{/if}