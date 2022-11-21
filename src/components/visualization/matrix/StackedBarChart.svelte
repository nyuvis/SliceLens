<script lang='ts'>
  import * as d3 from 'd3';
  import { getStackedBarChartData } from '../../../lib/VisQueries';
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

  $: x = d3.scaleBand<string>()
      .domain(xDomain)
      .range([margin.left, width - margin.right])
      .paddingOuter(0.05)
      .paddingInner(0.2);

  // TODO: type this
  $: stack = d3.stack<any, any, string>()
      .keys(labelValues)
      .value((d, key) => d[key] ?? 0)
      .offset($showSize ? d3.stackOffsetNone : d3.stackOffsetExpand);

  $: queryResults = getStackedBarChartData(xCol);

  $: dataAndScales = queryResults.then(({data, maxCount}) => {
    const yCount = d3.scaleLinear()
        .domain([0, maxCount]).nice()
        .range([height - margin.bottom, margin.top]);

    const yPct = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);

    return {
      data,
      yCount,
      yPct
    };
  });

</script>

<svg>
  {#await dataAndScales then {data, yCount, yPct}}
    {#each stack(data) as layer}
      <g fill={color(layer.key)}>
        {#each layer as part}
          <rect
            x={x(part.data.category)}
            y={$showSize ? yCount(part[1]) : yPct(part[1])}
            width={x.bandwidth()}
            height={$showSize ?
              yCount(part[0]) - yCount(part[1]) :
              yPct(part[0]) - yPct(part[1])}
          />
        {/each}
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