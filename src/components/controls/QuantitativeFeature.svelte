<script>
  import { dataset, metadata } from "../../stores.js";
  import { equalIntervalThresholds, quantileThresholds } from "../../DataTransformer.js";

  import * as d3_array from "d3-array";
  import * as d3_all from "d3";

  const d3 = { ...d3_all, ...d3_array };

  export let feature;

  export function onWindowClose() {
  }

  const values = $dataset.map(d => d[feature.name]);
  const extent = d3.extent(values);

  const splits = [
    { value: 'interval', display: 'Equal Intervals' },
    { value: 'quantile', display: 'Quantiles' },
  ];

  const bins = [2, 3, 4, 5];

  function onchange() {
    if (feature.splitType === 'interval') {
      feature.thresholds = equalIntervalThresholds(extent, feature.numBins);
    } else if (feature.splitType === 'quantile') {
      feature.thresholds = quantileThresholds(values, feature.numBins);
    }
  }

</script>

<p class="sub-label small">Bins</p>
<select bind:value={feature.numBins} on:change={onchange}>
  {#each bins as bin}
    <option {bin}>{bin}</option>
  {/each}
</select>

<p class="sub-label small">Type</p>
<select bind:value={feature.splitType} on:change={onchange}>
  {#each splits as {value, display}}
    <option {value}>{display}</option>
  {/each}
</select>

<style>
</style>
