<script lang='ts'>
  import * as d3 from 'd3';
  import { getBoxPlotsData } from '../../../lib/VisQueries';
  import XAxis from './XAxis.svelte';
  import YAxis from './YAxis.svelte';

  export let width: number;
  export let height: number;

  export let xDomain: string[];
  export let yDomain: [number, number];

  export let xCol: string = '';

  export let margin = { top: 50, right: 50, bottom: 50, left: 50 };

  $: x = d3.scaleBand<string>()
    .domain(xDomain)
    .range([margin.left, width - margin.right])
    .paddingOuter(0.05)
    .paddingInner(0.2);

  $: y = d3.scaleLinear()
    .domain(yDomain).nice()
    .range([height - margin.bottom, margin.top]);

  $: queryResults = getBoxPlotsData(xCol);
</script>

<svg>
  {#await queryResults then table}
    {#each table as {cat, min, max, q1, q2, q3}}
      <g transform='translate({x(cat)})'>
        <!-- box for IQR -->
        <rect
          y={y(q3)}
          width={x.bandwidth()}
          height={y(q1) - y(q3)}
          fill='#a0e3b7'
        />

        <!-- median line -->
        <line x2={x.bandwidth()} y1={y(q2)} y2={y(q2)} stroke='black'/>

        <!-- whisksers -->
        <line
          x1={x.bandwidth() / 2}
          x2={x.bandwidth() / 2}
          y1={y(q3)}
          y2={y(max)}
          stroke='black'
        />

        <line
          x1={x.bandwidth() / 2}
          x2={x.bandwidth() / 2}
          y1={y(q1)}
          y2={y(min)}
          stroke='black'
        />
      </g>
    {/each}

    <XAxis
      scale={x}
      width={width}
      height={height}
      margin={margin}
      label={xCol}
      x={0}
      y={height - margin.bottom}
    />

    <YAxis
      scale={y}
      width={width}
      height={height}
      margin={margin}
      label='label'
      x={margin.left}
      y={0}
    />
  {/await}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>