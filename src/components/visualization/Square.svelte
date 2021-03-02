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
      incorrectHeight: 0,
    };

    if (showPredictions) {
      const predictionResults = d.predictionResults.get(label);

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

<g transform='translate({x + padding},{y + padding})'>
  {#each segments as {height, y, label, incorrectHeight}}
    <g transform="translate(0,{y})">
      <rect {height} width={sideLength} fill={color(label)}></rect>
      {#if showPredictions}
        <rect height={incorrectHeight} width={sideLength} fill="url(#stripes)"></rect>
      {/if}
    </g>
  {/each}
</g>