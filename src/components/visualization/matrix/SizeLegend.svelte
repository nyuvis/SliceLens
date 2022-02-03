<script lang="ts">
  import * as d3 from "d3";

  export let scale: d3.ScalePower<number, number, number> | d3.ScaleLinear<number, number, number>;
  export let title: string;

  const format = d3.format("~s");

  $: [x1, x2] = scale.range();

  $: allTicks = scale.ticks(3);

  $: ticks = allTicks.length > 3
    ? [allTicks[0], allTicks[1], allTicks[allTicks.length - 1]]
    : allTicks;
</script>

<text class="label" dominant-baseline="hanging">{title}</text>

<line class="domain" {x1} {x2} y1="10" y2="10" stroke="black"/>

{#each ticks as tick}
  <g class="tick" transform="translate({scale(tick)},0)">
    <line x1="0" x2="0" y1="10" y2="15"/>
    <text y="17" dominant-baseline="hanging">{format(tick)}</text>
  </g>
{/each}

<style>
  line {
    stroke: black;
  }

  text {
    font-size: 10px;
  }

  .tick text {
    text-anchor: middle;
  }
</style>