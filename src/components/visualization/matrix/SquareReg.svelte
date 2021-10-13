<script>
  import * as d3 from 'd3';
  import { metadata } from "../../../stores.js";

  export let color;
  export let showPredictions;
  export let sideLength;
  export let padding;
  export let x;
  export let y;
  export let d;

  $: heightScale = d3.scaleLinear()
      .domain([0, d.size])
      .range([0, sideLength]);

  $: numSlices = showPredictions && $metadata.hasPredictions ?
      d.deltaSlices.size :
      d.labelSlices.size;

  $: stack = d3.stack()
      .keys(d3.range(numSlices))
      .value((d, key) => d.has(key) ? d.get(key).count : 0);

  $: counts = showPredictions && $metadata.hasPredictions ?
      d.deltaSlices :
      d.labelSlices;

  // $: color = showPredictions && $metadata.hasPredictions ?
  //     d3.quantize(d3.interpolatePuOr, numSlices) :
  //     d3.quantize(d3.interpolateBlues, numSlices);

  $: stacked = stack([counts]);

  $: segments = stacked.map(b => {
    const label = b.key;
    const pos = b[0];

    const rect = {
      height: Math.max(0, heightScale(pos[1]) - heightScale(pos[0])),
      y: heightScale(pos[0]),
      label: label,
      mid: pos.data.get(label).mid,
    };

    return rect;
  });
</script>

<g transform='translate({x + padding},{y + padding})'>
  {#each segments as {height, y, mid}}
    <g transform="translate(0,{y})">
      <rect {height} width={sideLength} fill={color(mid)}/>
    </g>
  {/each}
</g>