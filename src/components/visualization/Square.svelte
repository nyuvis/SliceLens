<script>
  import * as d3 from 'd3';

  export let showPredictions;
  export let color;
  export let sideLength;
  export let padding;
  export let x;
  export let y;
  export let d;

  $: height = d3.scaleLinear()
      .domain([0, d.size])
      .range([0, sideLength]);

  $: stack = d3.stack()
      .keys(color.domain())
      .value((d, key) => d.get(key));

  $: counts = showPredictions ?
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
    };

    if (showPredictions) {
      const predictionResults = node.data.predictionResults.get(label);
      if (predictionResults !== undefined && predictionResults.has('incorrect')) {
        rect.incorrect = predictionResults.get('incorrect');
      } else {
        rect.incorrect = 0;
      }
    }

    return rect;
  });
</script>

<g transform='translate({x + padding},{y + padding})'>
  {#each segments as {height, y, label}}
    <rect {y} {height} width={sideLength} fill={color(label)}></rect>
  {/each}
</g>