<script lang="ts">
  import * as d3 from 'd3';
  import Label from './Label.svelte';

  export let scale: d3.ScaleContinuousNumeric<number,number> | d3.ScaleBand<string>;
  export let width: number;
  export let height: number;
  export let margin: { top: number, right: number, bottom: number, left: number };
  export let label: string;
  export let x: number = 0;
  export let y: number = 0;
  export let format = d3.format('~s');
  export let showGrid: boolean = false;
  export let showTickLabels: boolean = true;

  $: y1 = showGrid ? -(height - margin.top - margin.bottom) : 0;
</script>

<g transform="translate({x},{y})">
  <g>
    {#if 'bandwidth' in scale}
      {#each scale.domain() as tick}
        <g transform="translate({scale(tick)})">
          <line y1={y1} y2={5} x1={scale.bandwidth() / 2} x2={scale.bandwidth() / 2} stroke="#d3d3d3"/>
          {#if showTickLabels}
            <Label
              width={scale.bandwidth()}
              height={10}
              x={0}
              y={10}
              bold={false}
              label={tick}
              fontSize={10}
            />
          {/if}
        </g>
      {/each}
    {:else}
      {#each scale.ticks() as tick}
        <g transform="translate({scale(tick)})">
          <line y1={y1} y2={5} stroke="#d3d3d3"/>
          {#if showTickLabels}
            <text y={6} text-anchor="middle" dominant-baseline="hanging">{format(tick)}</text>
          {/if}
        </g>
      {/each}
    {/if}
  </g>

  <Label
    width={width}
    height={20}
    x={0}
    y={margin.bottom - 20}
    bold={true}
    label={label}
  />
</g>

<style>
  text {
    font-size: 10px;
  }
</style>