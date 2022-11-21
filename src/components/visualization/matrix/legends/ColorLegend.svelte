<!--
   References code from: https://observablehq.com/@d3/color-legend
   Copyright 2021, Observable Inc.
   Released under the ISC license.
 -->

<script lang="ts">
  import { dataset } from "../../../../stores";
  import QuantitativeColorLegend from "./QuantitativeColorLegend.svelte";
  import CategoricalColorLegend from "./CategoricalColorLegend.svelte";

  const width = 500;
  const height = 30;

  let title = 'Labels';
</script>

<div id="legend" class="small" style="flex: 0 0 {height}px; max-height: {height}px">
  <div class="bold title">{title}</div>

  {#if $dataset.type === 'regression'}
    <QuantitativeColorLegend
      width={width}
      height={height}
      color={$dataset.color}
    />
  {:else}
    <CategoricalColorLegend
      color={$dataset.color}
    />
  {/if}
</div>

<style>
    #legend {
      margin-left: 0.25em;
      margin-top: 0.25em;

      display: flex;
      align-items: center;
    }

    .title {
      margin-right: 1em;
    }
</style>
