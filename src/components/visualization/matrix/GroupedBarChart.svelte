<script lang='ts'>
  import * as d3 from 'd3';
  import { getGroupedBarChartData } from '../../../lib/VisQueries';
  import { showSize } from '../../../stores';
  import XAxis from './XAxis.svelte';
  import YAxis from './YAxis.svelte';

  export let width: number;
  export let height: number;

  export let xDomain: string[];
  export let xCol: string = '';

  export let labelValues: string[];

  export let color: d3.ScaleOrdinal<string, string, string>;

  export let margin = { top: 25, right: 50, bottom: 50, left: 50 };

  $: fx = d3.scaleBand<string>()
      .domain(xDomain)
      .range([margin.left, width - margin.right])
      .paddingOuter(0.05)
      .paddingInner(0.2);

  $: queryResults = getGroupedBarChartData(xCol);

  $: dataAndScales = queryResults.then(({data, maxCount, maxPct}) => {
    const x = d3.scaleBand()
        .domain(labelValues)
        .range([0, fx.bandwidth()])
        .paddingInner(0.1);

    const yCount = d3.scaleLinear()
        .domain([0, maxCount]).nice()
        .range([height - margin.bottom, margin.top]);

    const yPct = d3.scaleLinear()
        .domain([0, maxPct]).nice()
        .range([height - margin.bottom, margin.top]);

    return {data, x, yCount, yPct};
  });

</script>

<svg>
  {#await dataAndScales then {data, x, yCount, yPct}}
    {#each data as {category, label, count, pct}}
      <rect
        x={fx(category) + x(label)}
        y={$showSize ? yCount(count) : yPct(pct)}
        width={x.bandwidth()}
        height={$showSize ? (yCount(0) - yCount(count)) : (yPct(0) - yPct(pct))}
        fill={color(label)}
      />
    {/each}

    <XAxis
      scale={fx}
      width={width}
      height={height}
      margin={margin}
      label={xCol}
      x={0}
      y={height - margin.bottom}
    />

    <YAxis
      scale={$showSize ? yCount : yPct}
      width={width}
      height={height}
      margin={margin}
      label={$showSize ? 'count' : 'percent'}
      x={margin.left}
      y={0}
      format={$showSize ? d3.format('~s') : d3.format('~%')}
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