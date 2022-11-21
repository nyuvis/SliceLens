<script lang='ts'>
  import * as d3 from 'd3';
  import { getViolinPlotsData } from '../../../lib/VisQueries';
  import XAxis from './XAxis.svelte';
  import YAxis from './YAxis.svelte';

  export let width: number;
  export let height: number;

  export let xDomain: string[];
  export let yDomain: [number, number];

  export let xCol: string = '';

  export let margin = { top: 50, right: 50, bottom: 50, left: 50 };

  export let color: d3.ScaleSequential<string,string>;

  $: interpolator = color.interpolator()

  $: x = d3.scaleBand<string>()
    .domain(xDomain)
    .range([margin.left, width - margin.right])
    .paddingOuter(0.05)
    .paddingInner(0.2);

  $: y = d3.scaleLinear()
    .domain(yDomain).nice()
    .range([height - margin.bottom, margin.top]);

  $: queryResults = getViolinPlotsData(xCol);

  $: dataAndArea = queryResults.then(({data, maxDensity}) => {
    const width = d3.scaleLinear()
        .domain([0, maxDensity])
        .range([0, x.bandwidth() / 2]);

    const area = d3.area<{y: number, density: number}>()
        .y(d => y(d.y))
        .x0(d => -width(d.density))
        .x1(d => width(d.density));

    return {data, area};
  });

  $: boxWidth = Math.min(10, x.bandwidth() / 2);
</script>

<svg>
  <defs>
    <linearGradient
      id="gradient"
      gradientUnits="userSpaceOnUse"
      x1="{0}"
      x2="{0}"
      y1="{height - margin.bottom}"
      y2="{margin.top}"
    >
      {#each d3.range(0, 1.05, 0.05) as t}
        <stop stop-color="{interpolator(t)}" offset="{t}"/>
      {/each}
    </linearGradient>
  </defs>
  {#await dataAndArea then {data, area}}
    {#each data as {cat, min, max, q1, q2, q3, iqr, densities}}
      <g transform='translate({x(cat) + x.bandwidth() / 2})'>
        <!-- KDE -->
        <path
          d={area(densities)}
          fill='url(#gradient)'
        />

        <!-- box for IQR -->
        <rect
          y={y(q3)}
          x={-boxWidth / 2}
          width={boxWidth}
          height={y(q1) - y(q3)}
          fill='white'
        />

        <!-- median line -->
        <line
          x1={-boxWidth / 2}
          x2={boxWidth / 2}
          y1={y(q2)}
          y2={y(q2)}
          stroke='black'
          stroke-width={3}
        />

        <!-- whisksers -->
        <line
          y1={y(q3)}
          y2={y(Math.min(q3 + 1.5 * iqr, max))}
          stroke='white'
        />

        <line
          y1={y(q1)}
          y2={y(Math.max(q1 - 1.5 * iqr, min))}
          stroke='white'
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