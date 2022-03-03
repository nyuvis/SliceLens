<!--
   References code from: https://observablehq.com/@d3/color-legend
   Copyright 2021, Observable Inc.
   Released under the ISC license.
 -->

<script lang="ts">
  import * as d3 from 'd3';
  import { showPredictions, color } from "../../../stores";

  const width = 400;
  const height = 30;

  $: x = d3.scaleLinear()
      .domain([-1, $color.range().length - 1])
      .range([0, width]);

  let title = '';

  $: {
    if ($showPredictions) {
      if ('invertExtent' in $color) {
        title = 'Predicted - Ground Truth Labels';
      } else {
        title = 'Predicted Labels';
      }
    } else {
      title = 'Ground Truth Labels'
    }
  }

  const format = d3.format('~s');
</script>

<div id="legend" class="small">
  <div class="bold title">{title}</div>

  {#if "invertExtent" in $color}
    <!-- regression color legend -->
    <svg {width} {height}>
      <!-- i goes from 0 to color.range().length - 1-->
      {#each $color.range() as c, i}
        <rect x={x(i - 1)} y={0} width={x(i) - x(i - 1)} height={height / 2} fill={c}/>

        {#if i !== 0}
          <line x1={x(i - 1)} x2={x(i - 1)} y1={0} y2={height / 2} stroke="black"/>
          {#if i % 2 === 0}
            <text dominant-baseline="hanging" text-anchor="middle" y={(height / 2) + 2} x={x(i - 1)}>
              {format($color.domain()[i - 1])}
            </text>
          {/if}
        {/if}
      {/each}
    </svg>
  {:else}
    <!-- classification color legend -->
    <div class="swatches">
      {#if $showPredictions}
        <div class="column">
          <div class="legend-cell">Correct:</div>
          <div class="legend-cell">Incorrect:</div>
        </div>
      {/if}

      {#each $color.domain() as label}
        <div class="column">
          <div class="legend-cell">
            <div class="legend-square" style="background: {$color(label)}"></div>
            <div class="legend-label">{label}</div>
          </div>
          {#if $showPredictions}
            <div class="legend-cell">
              <div class="legend-square"
                style="background: repeating-linear-gradient(135deg, {$color(label)}, {$color(label)} 2px, white 2px, white 4px)">
              </div>
              <div class="legend-label">{label}</div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
    #legend {
      flex: 0 0 40px;
      max-height: 40px;
      margin-left: 5px;

      display: flex;
      align-items: center;
    }

    .title {
      margin-right: 1em;
    }

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