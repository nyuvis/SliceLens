<script lang="ts">
  import { format } from 'd3';
  import { features, dataset } from "../../../stores";
  import type { Node } from "../../../types";

  export let x: number;
  export let y: number;
  export let bounds: { left: number, right: number, top: number, bottom: number };
  export let d: Node;

  const padding: number = 10;

  let width: number = 100;
  let height: number = 100;

  const percentFormat = format('.1%');

  // keep the tool tip on the screen

  $: minX = bounds.left + (width / 2);
  $: minY = bounds.top;
  $: maxX = bounds.right - (width / 2);
  // 2 * padding so that the scrollbar does not appear
  // when the tooltip is on the bottom of the screen
  $: maxY = bounds.bottom - height - 2 * padding;

  $: tooltipX = Math.min(Math.max(minX, x), maxX);
  $: tooltipY = Math.min(Math.max(minY, y), maxY);

  // splits

  $: splits =
    d.splits.size === 0
      ? []
      : Array.from(d.splits).map(([featureName, splitIndex]) => {
          const split = $features[featureName].values[splitIndex];
          return {featureName, split};
        });
</script>

<div
  class="tooltip small"
  bind:clientWidth={width} bind:clientHeight={height}
  style='left: {tooltipX - (width / 2)}px; top: {tooltipY + padding}px;'
>
  {#if splits.length > 0}
    <table class="tooltip-table">
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

    <div class="tooltip-divider"></div>
  {/if}

  <div class="size group">
    {d.size}/{$dataset.size} instances ({percentFormat(d.size / $dataset.size)})
  </div>

  <slot></slot>
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
</style>
