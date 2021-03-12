<script>
  export let width;
  export let xScales;
  export let xFeatures;
  export let axisLineHeight;
</script>

{#if xScales.length > 0}
  <g class="x-axis small">
    <text class="bold" x={width / 2}>{xFeatures[0].name}</text>
    {#each xScales[0].domain() as d}
      <text y={axisLineHeight} x={xScales[0](d) + xScales[0].bandwidth() / 2}>{xFeatures[0].values[+d]}</text>

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

<style>
  .x-axis {
    dominant-baseline: hanging;
    text-anchor: middle;
  }
</style>