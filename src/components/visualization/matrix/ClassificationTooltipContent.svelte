<script lang="ts">
  import { format } from 'd3';
  import { color, showPredictions } from "../../../stores";
  import { getClassificationTooltipAmounts } from "../../../lib/Squares";
  import type { ClassificationNode } from '../../../types';

  export let d: ClassificationNode;
  const percentFormat = format('.1%');

  $: amounts = getClassificationTooltipAmounts($showPredictions, d, percentFormat);
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
    {#each amounts as {display, size, percent, correct, label}}
      <tr>
        <td>
          {#if !("invertExtent" in $color)}
            {#if !correct}
              <div class="legend-square"
                style="background: repeating-linear-gradient(135deg, {$color(label)}, {$color(label)} 2px, white 2px, white 4px)">
              </div>
            {:else}
              <div class="legend-square" style="background: {$color(label)}"></div>
            {/if}
          {/if}
        </td>
        <td class="string">{display}</td>
        <td class="number">{size}</td>
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
