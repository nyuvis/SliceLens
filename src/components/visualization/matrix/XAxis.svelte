<script>
  import Label from './Label.svelte';

  export let width;
  export let xScales;
  export let xFeatures;
  export let axisLineHeight;
  export let maxSideLength;
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
        x={xScales[0](d) + (xScales[0].bandwidth() / 2) - (maxSideLength / 2)}
        y={axisLineHeight}
        width={maxSideLength}
        height={axisLineHeight}
        label={xFeatures[0].values[+d]}
      />

      <g transform="translate({xScales[0](d)},{axisLineHeight * 2})">
        <svelte:self
          width={xScales[0].bandwidth()}
          xScales={xScales.slice(1)}
          xFeatures={xFeatures.slice(1)}
          {axisLineHeight}
          {maxSideLength}
        />
      </g>
    {/each}
  </g>
{/if}