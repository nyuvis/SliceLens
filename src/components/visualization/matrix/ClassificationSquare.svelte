<script lang="ts">
  import * as d3 from 'd3';
  import { showPredictions, color, compareToWhole } from "../../../stores";
  import type { ClassificationNode } from '../../../types';

  export let sideLength: number;
  export let padding: number;
  export let x: number;
  export let y: number;
  export let d: ClassificationNode;

  const compareToWholeBarWidth: number = 5;

  $: height = d3.scaleLinear()
      .domain([0, d.size])
      .range([0, sideLength]);

  $: parts = $showPredictions ?
      d.predictions :
      d.groundTruth;
</script>

{#if !("invertExtent" in $color)}
  <g transform='translate({x + padding},{y + padding})' on:mousemove on:mouseleave>
    {#each parts as {label, size, offset, correct, pctPtDiffFromWhole}}
      <g transform="translate(0,{height(offset)})">
        <rect height={height(size)} width={sideLength} fill={$color(label)}/>
        {#if !correct}
          <rect height={height(size)} width={sideLength} fill="url(#stripes)"/>
        {/if}
      </g>

      {#if pctPtDiffFromWhole > 0 && $compareToWhole}
        <g transform="translate({sideLength + 3},{height(offset)})">
          <rect height={pctPtDiffFromWhole * sideLength} width={compareToWholeBarWidth} fill={$color(label)}/>
          {#if !correct}
            <rect height={pctPtDiffFromWhole * sideLength} width={compareToWholeBarWidth} fill="url(#stripes)"/>
          {/if}
        </g>
      {/if}
    {/each}
  </g>
{/if}