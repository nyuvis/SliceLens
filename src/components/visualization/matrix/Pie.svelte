<script>
  import * as d3 from 'd3';
  import { metadata } from "../../../stores.js";

  export let showPredictions;
  export let color;
  export let sideLength;
  export let padding;
  export let x;
  export let y;
  export let d;

  $: radius = d3.scaleSqrt()
      .domain([0, d.size])
      .range([0, sideLength / 2]);

  $: arc = d3.arc()
      .innerRadius(0)
      .outerRadius(d => radius(d.data.size));

  $: pie = d3.pie()
      .value(b => b.count)
      .sort((a, b) => d3.ascending(a.label, b.label));

  $: counts =
      showPredictions && $metadata.hasPredictions
        ? Array.from(d.predictionResults, ([label, correctToCount]) =>
            Array.from(correctToCount, ([correct, count]) => ({
              label,
              count,
              stripes: correct !== "correct",
            }))
          ).flat()
        : Array.from(d.groundTruth, ([label, count]) => ({
            label,
            count,
            stripes: false,
          }));
</script>

<g transform='translate({x + padding + sideLength / 2},{y + padding + sideLength / 2})' on:mousemove on:mouseleave>
  {#each pie(counts).map(a => { a.data.size = d.size; return a; }) as slice}
    <path d={arc(slice)}  fill={color(slice.data.label)} />
    {#if slice.data.stripes}
      <path d={arc(slice)}  fill="url(#stripes)" />
    {/if}
  {/each}
</g>