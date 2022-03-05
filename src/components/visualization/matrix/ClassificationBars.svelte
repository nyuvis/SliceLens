<script lang="ts">
  import * as d3 from 'd3';
  import { dataset, showPredictions, color } from "../../../stores";
  import type { ClassificationDataset, ClassificationNode } from '../../../types';

  export let vertical: boolean;
  export let length: d3.ScaleLinear<number, number, number>;
  export let sideLength: number;
  export let padding: number;
  export let x: number;
  export let y: number;
  export let d: ClassificationNode;

  function key(part: { label: string, size: number, correct: boolean, offset: number }): string {
    return `${part.label} (${part.correct ? 'correct' : 'incorrect'})`;
  }

  $: keys = d3.cross(
    ($dataset as ClassificationDataset).labelValues,
    $showPredictions ? ['incorrect', 'correct'] : ['correct'],
    (label, correct) => `${label} (${correct})`
  );

  $: position = d3.scaleBand()
      .domain(keys)
      .range([0, sideLength])
      .paddingInner(0.1);

  $: parts = $showPredictions ?
      d.predictions :
      d.groundTruth;
</script>

{#if !("invertExtent" in $color)}
  <g transform='translate({x + padding},{y + padding})' on:mousemove on:mouseleave>
    <!-- this background rectangle is so the tooltip shows up when over space between bars-->
    <rect width={sideLength} height={sideLength} fill="white"/>
    {#if vertical}
      {#each parts as part}
        <g>
          <rect
            x={position(key(part))}
            y={sideLength - length(part.size)}
            height={length(part.size)}
            width={position.bandwidth()}
            fill={$color(part.label)}
          />
          {#if !part.correct}
            <rect
              x={position(key(part))}
              y={sideLength - length(part.size)}
              height={length(part.size)}
              width={position.bandwidth()}
              fill="url(#stripes)"
            />
          {/if}
        </g>
      {/each}
      <line y1={sideLength} y2={sideLength} x1={0} x2={sideLength} stroke="var(--medium-gray)"/>
    {:else}
      {#each parts as part}
        <g>
          <rect
            x={0}
            y={position(key(part))}
            height={position.bandwidth()}
            width={length(part.size)}
            fill={$color(part.label)}
          />
          {#if !part.correct}
            <rect
              x={0}
              y={position(key(part))}
              height={position.bandwidth()}
              width={length(part.size)}
              fill="url(#stripes)"
            />
          {/if}
        </g>
      {/each}
      <line x1={0} x2={0} y1={0} y2={sideLength} stroke="var(--medium-gray)"/>
    {/if}
  </g>
{/if}