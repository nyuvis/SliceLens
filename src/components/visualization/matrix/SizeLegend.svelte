<script>
  import * as d3 from "d3";

  export let scale;

  const format = d3.format("~s");
  $: [x1, x2] = scale.range();
</script>

<text class="label">Side length to number of instances</text>

<line class="domain" {x1} {x2} y1="10" y2="10" stroke="black"/>

{#each scale.ticks(3) as tick}
  <g class="tick" transform="translate({scale(tick)},0)">
    <line x1="0" x2="0" y1="10" y2="15"/>
    <text y="17">{format(tick)}</text>
  </g>
{/each}

<style>
  line {
    stroke: black;
  }

  text {
    font-size: 10px;
    dominant-baseline: hanging;
  }

  .tick text {
    text-anchor: middle;
  }
</style>