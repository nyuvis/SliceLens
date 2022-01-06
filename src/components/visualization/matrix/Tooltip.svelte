<script lang="ts">
  import { format } from 'd3';
  import { metadata } from "../../../stores.js";
  import { getTooltipAmounts } from "../../../DataTransformer.js";
  import type { Node } from '../../../types';

  export let showPredictions: boolean;
  export let d: Node;
  export let x: number;
  export let y: number;
  export let bounds: { left: number, right: number, top: number, bottom: number };
  export let color: d3.ScaleOrdinal<string, string, string>;

  const percentFormat = format('.1%');

  const padding: number = 10;

  let width: number = 100;
  let height: number = 100;

  $: splits =
    d.splits.size === 0
      ? []
      : Array.from(d.splits).map(([featureName, splitIndex]) => {
          const split = $metadata.features[featureName].values[splitIndex];
          return {featureName, split};
        });

  $: amounts = getTooltipAmounts(showPredictions && $metadata.hasPredictions, d, percentFormat);

  // keep the tool tip on the screen

  $: minX = bounds.left + (width / 2);
  $: minY = bounds.top;
  $: maxX = bounds.right - (width / 2);
  // 2 * padding so that the scrollbar does not appear
  // when the tooltip is on the bottom of the screen
  $: maxY = bounds.bottom - height - 2 * padding;

  $: tooltipX = Math.min(Math.max(minX, x), maxX);
  $: tooltipY = Math.min(Math.max(minY, y), maxY);
</script>

<div
  class="tooltip small"
  bind:clientWidth={width} bind:clientHeight={height}
  style='left: {tooltipX - (width / 2)}px; top: {tooltipY + padding}px;'
>
  {#if splits.length > 0}
    <table class="splits-table">
      <thead>
        <tr>
          <th class="string">Feature</th>
          <th class="string">Bin</th>
        </tr>
      </thead>
      <tbody>
        {#each splits as {featureName, split}}
          <tr>
            <td class="string">{featureName}</td>
            <td class="string">{split}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="divider"></div>
  {/if}

  <div class="size group">
    {d.size}/{$metadata.size} instances ({percentFormat(d.size / $metadata.size)})
  </div>

  <div class="divider"></div>

  <table class="counts-table">
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
</div>

<style>
  .tooltip {
    padding: 0.5em;
    position: absolute;
    background-color: white;
    border: 1px solid black;
    pointer-events: none;
    box-sizing: border-box;
  }

  .divider {
    width: 100%;
    height: 2px;
    margin: 0.25em 0;
    background-color: var(--medium-gray);
  }

  .legend-square {
    min-width: 14px;
    min-height: 14px;
  }

  /* table stylings */

  table {
    border-collapse: collapse;
  }

  td, th {
    padding: 0em 0.5em 0.25em 0em;
    line-height: 1;
    vertical-align: middle;
  }

  /* no right padding for last column in table */
  tr > td:last-of-type, tr > th:last-of-type {
    padding-right: 0;
  }

  /* no bottom padding for last row in table */
  tbody > tr:last-of-type > td {
    padding-bottom: 0;
  }

  th {
    font-weight: 500;
  }

  .number {
    text-align: right;
  }

  td.number {
    font-variant-numeric: lining-nums tabular-nums;
  }

  .string {
    text-align: left;
  }
</style>
