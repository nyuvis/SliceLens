<script lang="ts">
  import { format } from 'd3';
  import { dataset } from "../../../stores";
  import { getClassificationTooltipAmounts } from "../../../DataTransformer";
  import type { ClassificationNode } from '../../../types';

  export let showPredictions: boolean;
  export let d: ClassificationNode;
  export let color: d3.ScaleOrdinal<string, string, string>;

  const percentFormat = format('.1%');

  $: amounts = getClassificationTooltipAmounts(showPredictions && $dataset.hasPredictions, d, percentFormat);
</script>

<div class="tooltip-divider"></div>

<table class="tooltip-table">
  <thead>
    <tr>
      <th></th>
      <th class="string">Label</th>
      <th class="number">Count</th>
      <th class="number">Percent</th>
    </tr>
  </thead>
  <tbody>
    {#each amounts as {label, count, percent, stripes, colorLabel}}
      <tr>
        <td>
          {#if stripes}
            <div class="legend-square"
              style="background: repeating-linear-gradient(135deg, {color(colorLabel)}, {color(colorLabel)} 2px, white 2px, white 4px)">
            </div>
          {:else}
            <div class="legend-square" style="background: {color(colorLabel)}"></div>
          {/if}
        </td>
        <td class="string">{label}</td>
        <td class="number">{count}</td>
        <td class="number">{percent}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .legend-square {
    min-width: 14px;
    min-height: 14px;
  }
</style>
