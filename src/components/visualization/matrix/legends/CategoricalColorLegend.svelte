<!--
   References code from: https://observablehq.com/@d3/color-legend
   Copyright 2021, Observable Inc.
   Released under the ISC license.
 -->

<script lang="ts">
  export let color: d3.ScaleOrdinal<string, string, string>;
</script>

<div class="swatches">
  {#each color.domain() as label}
    <div class="column">
      <div class="legend-cell">
        <div class="legend-square" style="background: {color(label)}"></div>
        <div class="legend-label">{label}</div>
      </div>
    </div>
  {/each}
</div>

<style>
    .legend-cell {
      display: flex;
      align-items: center;
    }

    .legend-square {
      min-width: 14px;
      min-height: 14px;
      margin-right: 0.5em;
    }

    .swatches {
      display: flex;
    }

    .column {
      margin-right: 1em;
    }
</style>