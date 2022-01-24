<script lang="ts">
  import * as d3 from 'd3';
  import { dataset } from "../../../stores.js";
  import type { Node } from "../../../types";

  export let showPredictions: boolean;
  export let color: d3.ScaleOrdinal<string, string, string>;
  export let sideLength: number;
  export let padding: number;
  export let x: number;
  export let y: number;
  export let d: Node;

  $: height = d3.scaleLinear()
      .domain([0, d.size])
      .range([0, sideLength]);

  $: stack = d3.stack<d3.InternMap<string, number>>()
      .keys(color.domain())
      .value((d, key) => d.has(key) ? d.get(key) : 0);

  $: counts = showPredictions && $dataset.hasPredictions ?
      d.predictionCounts :
      d.groundTruth;

  $: stacked = stack([counts]);

  $: segments = stacked.map(b => {
    const label = b.key;
    const pos = b[0];

    const rect = {
      height: height(pos[1]) - height(pos[0]),
      y: height(pos[0]),
      label: label,
      incorrectHeight: 0,
    };

    if (showPredictions && $dataset.hasPredictions) {
      const predictionResults: d3.InternMap<string,number> = d.predictionResults.get(label);

      if (predictionResults !== undefined && predictionResults.has('incorrect')) {
        const incorrect = d3.scaleLinear()
            .domain([0, counts.get(label)])
            .range([0, rect.height]);

        rect.incorrectHeight = incorrect(predictionResults.get('incorrect'));
      }
    }

    return rect;
  });
</script>

<g transform='translate({x + padding},{y + padding})' on:mousemove on:mouseleave>
  {#each segments as {height, y, label, incorrectHeight}}
    <g transform="translate(0,{y})">
      <rect {height} width={sideLength} fill={color(label)}/>
      {#if showPredictions}
        <rect height={incorrectHeight} width={sideLength} fill="url(#stripes)"/>
      {/if}
    </g>
  {/each}
</g>