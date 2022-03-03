<script lang="ts">
  import Label from './Label.svelte';
  import type { Feature } from '../../../types';

  export let height: number;
  export let yScales: d3.ScaleBand<number>[];
  export let yFeatures: Feature[];
  export let axisLineHeight: number;
</script>

{#if yScales.length > 0}
  <g class="y-axis">
    <Label
      x={0}
      y={0}
      height={axisLineHeight}
      width={height}
      bold={true}
      rotate={true}
      label={yFeatures[0].name}
    />

    {#each yScales[0].domain() as d}
      <Label
        x={axisLineHeight}
        y={yScales[0](d)}
        height={axisLineHeight}
        width={yScales[0].bandwidth()}
        rotate={true}
        label={yFeatures[0].values[+d]}
      />

      <g transform="translate({axisLineHeight * 2},{yScales[0](d)})">
        <svelte:self
          height={yScales[0].bandwidth()}
          yScales={yScales.slice(1)}
          yFeatures={yFeatures.slice(1)}
          {axisLineHeight}
        />
      </g>
    {/each}
  </g>
{/if}