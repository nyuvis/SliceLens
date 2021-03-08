<script>
  import { metadata } from "../../stores.js";

  export let showPredictions;
  export let d;
  export let x;
  export let y;

  const padding = 5;

  let text;

  $: dimensions = text ? text.getBBox() : {width: 100, height: 100};

  $: splitLines =
    d.splits.size === 0
      ? ["Entire dataset"]
      : Array.from(d.splits).map(([featureName, splitIndex]) => {
          const split = $metadata.features[featureName].values[splitIndex];
          return `${featureName}: ${split}`;
        });

  $: countLines = showPredictions && $metadata.hasPredictions
    ? Array.from(d.predictionResults, ([label, counts]) => {
        return Array.from(counts, ([correct, count]) => {
          const prefix = correct === "correct" ? "true" : "false";
          return `${prefix} ${label}: ${count}`;
        }).sort();
      }).flat()
    : Array.from(d.groundTruth, ([key, val]) => `${key}: ${val}`);
</script>

<g class="tooltip" transform="translate({x},{y + padding * 3})">
  <rect
    fill="white"
    stroke="black"
    x={(-dimensions.width / 2) - padding}
    y={-padding}
    width={dimensions.width + 2 * padding}
    height={dimensions.height + 2 * padding}
  />
  <text bind:this={text} transform="translate({-dimensions.width / 2},0)">
    <tspan class="bold" x="0">Split</tspan>

    {#each splitLines as line, i}
      <tspan x="0" y="{(i + 1) * 1.1}em">{line}</tspan>
    {/each}

    <tspan class="bold" x="0" y="{(splitLines.length + 1) * 1.1}em">Counts</tspan>

    {#each [...countLines, `total: ${d.size}`] as line, i}
      <tspan x="0" y="{(splitLines.length + i + 2) * 1.1}em">{line}</tspan>
    {/each}
  </text>
</g>

<style>
  tspan {
    dominant-baseline: hanging;
  }

  g > * {
    pointer-events: none;
  }
</style>
