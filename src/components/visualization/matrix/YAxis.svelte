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

  $: x2 = showGrid ? (width - margin.left - margin.right) : 0;
</script>

<g transform="translate({x},{y})">
  <g>
    {#if 'bandwidth' in scale}
      {#each scale.domain() as tick}
        <g transform="translate(0,{scale(tick)})">
          <line x1={-5} x2={x2} y1={scale.bandwidth() / 2} y2={scale.bandwidth() / 2} stroke="#d3d3d3"/>
          {#if showTickLabels}
            <Label
              width={scale.bandwidth()}
              height={10}
              x={-15}
              y={0}
              bold={false}
              label={tick}
              fontSize={10}
              rotate={true}
            />
          {/if}
        </g>
      {/each}
    {:else}
      {#each scale.ticks() as tick}
        <g transform="translate(0,{scale(tick)})">
          <line x1={-5} x2={x2} stroke="#d3d3d3"/>
          {#if showTickLabels}
            <text x={-6} text-anchor="end" dominant-baseline="middle">{format(tick)}</text>
          {/if}
        </g>
      {/each}
    {/if}
  </g>

  <Label
    width={height}
    height={20}
    x={-margin.left + 5}
    y={0}
    bold={true}
    label={label}
    rotate={true}
  />
</g>

<style>
  text {
    font-size: 10px;
  }
</style>