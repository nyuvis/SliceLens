<script lang="ts">
  export let xScales: d3.ScaleBand<number>[];
  export let yScales: d3.ScaleBand<number>[];
  export let matrixWidth: number;
  export let matrixHeight: number;
</script>

{#if xScales.length > 1}
  <g class="horizontal-grid-lines">
    {#each xScales[0].domain().slice(1) as d}
      <line
      x1={xScales[0](d)}
      x2={xScales[0](d)}
      y1=0
      y2={matrixHeight}
      stroke='#dcdcdc'
      />
    {/each}
  </g>
{/if}

{#if yScales.length > 1}
  <g class="vertical-grid-lines">
    {#each yScales[0].domain().slice(1) as d}
      <line
      y1={yScales[0](d)}
      y2={yScales[0](d)}
      x1=0
      x2={matrixWidth}
      stroke='#dcdcdc'
      />
    {/each}
  </g>
{/if}