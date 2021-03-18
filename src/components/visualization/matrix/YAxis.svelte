<script>
  import Label from './Label.svelte';

  export let height;
  export let yScales;
  export let yFeatures;
  export let axisLineHeight;
  export let maxSideLength;
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
        y={yScales[0](d) + (yScales[0].bandwidth() / 2) - (maxSideLength / 2) }
        height={axisLineHeight}
        width={maxSideLength}
        rotate={true}
        label={yFeatures[0].values[+d]}
      />

      <g transform="translate({axisLineHeight * 2},{yScales[0](d)})">
        <svelte:self
          height={yScales[0].bandwidth()}
          yScales={yScales.slice(1)}
          yFeatures={yFeatures.slice(1)}
          {axisLineHeight}
          {maxSideLength}
        />
      </g>
    {/each}
  </g>
{/if}