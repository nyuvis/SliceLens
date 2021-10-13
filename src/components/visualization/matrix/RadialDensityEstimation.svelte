<script>
  import * as d3 from 'd3';
  import { metadata } from "../../../stores.js";

  // export let showPredictions;
  // export let color;
  export let sideLength;
  export let padding;
  export let x;
  export let y;
  export let yMax;
  export let d;

  $: angle = d3.scaleLinear()
      .domain(d3.extent(d.labelDensities, b => b.target))
      .range([0, 2 * Math.PI]);

  $: radius = d3.scaleLinear()
      .domain([0, yMax])
      .range([sideLength / 4, sideLength / 2]);

  $: line = d3.areaRadial()
      .angle(b => angle(b.target))
      .innerRadius(b => radius(0))
      .outerRadius(b => radius(b.density))
</script>

<g transform='translate({x + padding + sideLength / 2},{y + padding + sideLength / 2})'>
  {#each radius.range() as r}
    <circle {r} fill="none" stroke='#dcdcdc'></circle>
  {/each}

  <path d={line(d.labelDensities)} fill="steelblue" stroke-width="2"></path>
</g>