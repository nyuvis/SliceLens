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

  const gray = '#999999';

  $: xScale = d3.scaleLinear()
      .domain(d3.extent(d.labelDensities, b => b.target))
      .range([0, sideLength]);

  $: yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([sideLength, 0]);

  $: line = d3.area()
      .x(b => xScale(b.target))
      .y1(b => yScale(b.density))
      .y0(yScale(0))
</script>

<g transform='translate({x + padding},{y + padding})'>
  <line x1=0 x2={sideLength} y1={sideLength} y2={sideLength} stroke={gray}></line>

  <line x1=0 x2={8} y1={0} y2={0} stroke={gray}></line>
  <line x1=0 x2={8} y1={sideLength / 2} y2={sideLength / 2} stroke={gray}></line>

  <path d={line(d.labelDensities)} fill="steelblue" stroke-width="2"></path>
</g>