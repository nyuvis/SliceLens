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

  function getCounts(predictions, md, d) {
    if (!predictions) {
      const counts = md.labelValues.map(label => {
        const diff = Math.max(d.diff.groundTruth.get(label), 0) * d.size;
        const pale = d.groundTruth.get(label) - diff;
        const dark = diff;
        return [
          { count: pale, opacity: 0.5, color: color(label), stripes: false },
          { count: dark, opacity: 1.0, color: color(label), stripes: false },
        ];
      })
        .flat()
        .map((d, i) => [i, d]);

      return new Map(counts);
    } else {
      const counts = d.diff.predictions.map(
        ({label, correct, diffCount, sameCount}) => {
          return [
            { count: sameCount, opacity: 0.5, color: color(label), stripes: correct !== "correct" },
            { count: diffCount, opacity: 1.0, color: color(label), stripes: correct !== "correct" },
          ];
        }
      ).flat()
        .map((d, i) => [i, d]);
      return new Map(counts);
    }
  }

  $: height = d3.scaleLinear()
      .domain([0, d.size])
      .range([0, sideLength]);

  // $: counts = showPredictions && $metadata.hasPredictions ?
  //     d.predictionCounts :
  //     d.groundTruth;

  $: counts = getCounts(showPredictions && $metadata.hasPredictions, $metadata, d);

  $: stack = d3.stack()
      .keys(counts.keys())
      .value((d, key) => d.has(key) ? d.get(key).count : 0);

  $: stacked = stack([counts]);

  $: segments = stacked.map(b => {
    const pos = b[0];
    const data = pos.data.get(b.key);

    const rect = {
      height: height(pos[1]) - height(pos[0]),
      y: height(pos[0]),
      color: data.color,
      opacity: data.opacity,
      stripes: data.stripes
    };

    return rect;
  });
</script>

<g transform='translate({x + padding},{y + padding})' on:mousemove on:mouseleave>
  {#each segments as {height, y, color, opacity, stripes}}
    {#if height > 0}
      {#if opacity === 1}
        <g transform="translate(0,{y})">
          <rect {height} width={sideLength} fill={color}/>
          {#if stripes}
            <rect height={height} width={sideLength} fill="url(#stripes)"/>
          {/if}
        </g>
      {:else}
        <g transform="translate(-4,{y})">
          <rect {height} width={sideLength + 8} fill={color}/>
          {#if stripes}
            <rect height={height} width={sideLength + 8} fill="url(#stripes)"/>
          {/if}
        </g>
      {/if}
    {/if}
  {/each}
</g>