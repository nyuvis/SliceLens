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
        const count = d.groundTruth.get(label) ?? 0;
        const diff = Math.max(d.diff.groundTruth.get(label), 0) * d.size;
        return {
          count,
          diff,
          color: color(label),
          stripes: false
        };
      })
        .map((d, i) => [i, d]);

      return new Map(counts);
    } else {
      const counts = d.diff.predictions.map(
        ({label, correct, diffCount, count}) => {
          return {
            count: count,
            diff: diffCount,
            color: color(label),
            stripes: correct !== "correct"
          };
        }
      )
        .map((d, i) => [i, d]);
      return new Map(counts);
    }
  }

  $: height = d3.scaleLinear()
      .domain([0, d.size])
      .range([0, sideLength]);

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
      diffHeight: height(data.diff),
      y: height(pos[0]),
      color: data.color,
      opacity: data.opacity,
      stripes: data.stripes
    };

    return rect;
  });
</script>

<g transform='translate({x + padding},{y + padding})' on:mousemove on:mouseleave>
  {#each segments as {height, diffHeight, y, color, stripes}}
    {#if height > 0}
      <g transform="translate(0,{y})">
        <rect {height} width={sideLength} fill={color}/>
        {#if stripes}
          <rect height={height} width={sideLength} fill="url(#stripes)"/>
        {/if}

        {#if diffHeight > 0}
          <g transform="translate({sideLength + 2},{height - diffHeight})">
            <rect height={diffHeight} width={4} fill={color}/>
            {#if stripes}
              <rect height={diffHeight} width={4} fill="url(#stripes)"/>
            {/if}
          </g>
        {/if}
      </g>
    {/if}
  {/each}
</g>