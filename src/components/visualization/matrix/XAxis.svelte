<script lang="ts">
  import Label from './Label.svelte';
  import type { Feature } from '../../../types';

  export let width: number;
  export let xScales: d3.ScaleBand<number>[];
  export let xFeatures: Feature[];
  export let axisLineHeight: number;
</script>

{#if xScales.length > 0}
  <g class="x-axis">
    <Label
      x={0}
      y={0}
      {width}
      height={axisLineHeight}
      label={xFeatures[0].name}
      bold={true}
    />

    {#each xScales[0].domain() as d}
      <Label
        x={xScales[0](d)}
        y={axisLineHeight}
        width={xScales[0].bandwidth()}
        height={axisLineHeight}
        label={xFeatures[0].values[+d]}
      />

      <g transform="translate({xScales[0](d)},{axisLineHeight * 2})">
        <svelte:self
          width={xScales[0].bandwidth()}
          xScales={xScales.slice(1)}
          xFeatures={xFeatures.slice(1)}
          {axisLineHeight}
        />
      </g>
    {/each}
  </g>
{/if}