<script>
  import { dataset, metadata } from "../../stores.js";
  import { equalIntervalThresholds, quantileThresholds, getBinLabels } from "../../DataTransformer.js";

  import * as d3_array from "d3-array";
  import * as d3_all from "d3";

  const d3 = { ...d3_all, ...d3_array };

  export let feature;

  export function onWindowClose() {
  }

  const datasetValues = $dataset.map(d => d[feature.name]);
  const extent = d3.extent(datasetValues);

  const splits = [
    { value: 'interval', display: 'Equal Intervals' },
    { value: 'quantile', display: 'Quantiles' },
    { value: 'custom', display: 'Custom' },
  ];

  const bins = [2, 3, 4, 5];

  function onchange() {
    if (feature.splitType === 'interval') {
      feature.thresholds = equalIntervalThresholds(extent, feature.numBins);
    } else if (feature.splitType === 'quantile') {
      feature.thresholds = quantileThresholds(datasetValues, feature.numBins);
    }

    const bin = d3.bin()
      .domain(extent)
      .thresholds(feature.thresholds);
    const bins = bin(datasetValues);
    feature.values = getBinLabels(bins);
  }
</script>

<div class="section">
  <p class="sub-label">Number of bins</p>
  <select bind:value={feature.numBins} on:change={onchange}>
    {#each bins as bin}
      <option {bin}>{bin}</option>
    {/each}
  </select>
</div>


<div class="section">
  <p class="sub-label">Split type</p>
  <select bind:value={feature.splitType} on:change={onchange}>
    {#each splits as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>
</div>

<div class="section">
  <p class="sub-label">Bins</p>
  <p class="small">{feature.values.join(' ')}</p>
</div>

<style>
  .section {
    align-self: flex-start;
    margin: 0.5em 0;
  }
</style>
