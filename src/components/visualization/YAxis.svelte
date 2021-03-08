<script>
  export let height;
  export let yScales;
  export let yFeatures;
  export let axisLineHeight;
</script>

{#if yScales.length > 0}
  <g class="y-axis small">
    <text class="bold" transform="translate(0,{height / 2}) rotate(270)">{yFeatures[0].name}</text>
    {#each yScales[0].domain() as d}
      <text transform="translate({axisLineHeight},{yScales[0](d) + yScales[0].bandwidth() / 2}) rotate(270)">{yFeatures[0].values[+d]}</text>

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

<style>
  .y-axis {
    dominant-baseline: hanging;
    text-anchor: middle;
  }
</style>