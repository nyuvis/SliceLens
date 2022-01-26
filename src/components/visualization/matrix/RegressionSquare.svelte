<script lang="ts">
  import * as d3 from 'd3';
  import { dataset } from "../../../stores.js";

  export let showPredictions: boolean;
  export let color: d3.ScaleThreshold<number, string, string>;
  export let sideLength: number;
  export let padding: number;
  export let x: number;
  export let y: number;
  export let d: any;

  $: height = d3.scaleLinear()
      .domain([0, d.size])
      .range([0, sideLength]);

  $: bins = showPredictions && $dataset.hasPredictions ?
      d.deltaBins :
      d.groundTruthBins;
</script>

<g transform='translate({x + padding},{y + padding})' on:mousemove on:mouseleave>
  {#each bins as {x0, x1, y0, size}}
    <rect height={height(size)} y={height(y0)} width={sideLength} fill={color((x0 + x1) / 2)}/>
  {/each}
</g>