<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { changeSinceGeneratingSuggestion } from "../../stores";
  import { cloneQuantitativeFeature, areFeaturesEqual } from "../../lib/Features";
  import * as d3 from "d3";
  import type { QuantitativeFeature } from "../../types";
  import { setBins, setBinLabels, areThresholdsValid, allowedBinNumbers } from "../../lib/QuantitativeFeatureEditing";
  import Histogram from '../visualization/histogram/Histogram.svelte';

  export let feature: QuantitativeFeature;
  export let featureValues: number[];

  const original = cloneQuantitativeFeature(feature);

  export function onWindowClose() {
    // handle if the user presses escape while
    if (feature.splitType === 'custom' ||
      originalFormatSpecifier !== feature.format) {
      setBinLabels(feature, featureValues);
    }

    if (!areFeaturesEqual(original, feature)) {
      $changeSinceGeneratingSuggestion = true;
    }
  }

  const originalFormatSpecifier: string = feature.format;
  let format = d3.format(feature.format);

  const dispatch = createEventDispatcher();


  const splits = [
    { value: 'interval', display: 'Equal Width' },
    { value: 'quantile', display: 'Quantiles' },
    { value: 'custom', display: 'Custom' },
  ];

  let validThresholds: boolean = true;
  let validFormat: boolean = true;
  $: valid = validThresholds && validFormat;
  $: dispatch('validate', valid);

  onMount(() => dispatch('validate', true));

  // on any change, check if the format is valid
  function onFormatInput() {
    try {
      format = d3.format(feature.format);
      validFormat = true;
    } catch (error) {
      validFormat = false;
    }
  }

  // on enter/blur, update the axis values if the format is valid
  function onFormatChange() {
    if (validFormat) {
      setBinLabels(feature, featureValues);
      feature = feature;
    }
  }

  // on any change of custom threshold
  function onCustomThresholdInput() {
    validThresholds = areThresholdsValid(feature.extent, feature.thresholds)
  }

  // changing number of features or type of splits
  function onSelectChange() {
    validThresholds = setBins(feature, featureValues);
    feature = feature;
  }
</script>

<div class="section">
  <p class="sub-label">Distribution</p>
  <p class="sub-label small info">The red ticks show the current bin thresholds.</p>
  <Histogram feature={feature.name} thresholds={feature.thresholds}/>
</div>

<div class="section">
  <p class="sub-label">Format</p>
  <p class="sub-label small info">
    This value can be any valid <a href="https://github.com/d3/d3-format#locale_format" target="_blank" rel="noopener noreferrer">d3-format specifier</a>.
  </p>
  <input
    type="text"
    bind:value={feature.format}
    placeholder="Ex: .2~f"
    size=8
    on:input={onFormatInput}
    on:change={onFormatChange}
  >
  {#if !validFormat}
    <span class="invalid small">Invalid format.</span>
  {/if}
</div>

<div class="section">
  <p class="sub-label">Number of bins</p>
  <!-- svelte-ignore a11y-no-onchange -->
  <select bind:value={feature.numBins} on:change={onSelectChange}>
    {#each allowedBinNumbers as bin}
      <option>{bin}</option>
    {/each}
  </select>
</div>

<div class="section">
  <p class="sub-label">Split type</p>
  <!-- svelte-ignore a11y-no-onchange -->
  <select bind:value={feature.splitType} on:change={onSelectChange}>
    {#each splits as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>
</div>

{#if feature.splitType === 'custom'}
  <div class="section">
    <p class="sub-label">Thresholds</p>
    <p class="sub-label small info">
      Values less than the first threshold are in the first bin. Values greater than or equal to threshold <i>i - 1</i> and less than threshold <i>i</i> are in bin <i>i</i>.
      <span class:invalid={!validThresholds}>Thresholds must be greater than the minimum value, less than the maximum value, and strictly increasing.</span>
    </p>
    <table class="small">
      <tbody>
        <tr>
          <td>Min value</td>
          <td class="align-right">{format(feature.extent[0])}</td>
        </tr>
        {#each feature.thresholds as threshold, i}
          <tr>
            <td>Threshold {i + 1}</td>
            <td>
              <input
                class="align-right"
                type="number"
                step="any"
                bind:value={threshold}
                on:input={onCustomThresholdInput}>
            </td>
          </tr>
        {/each}
        <tr>
          <td>Max value</td>
          <td class="align-right">{format(feature.extent[1])}</td>
        </tr>
      </tbody>
    </table>
  </div>
{:else}
  <div class="section">
    <p class="sub-label">Bins</p>
    <p class="small">{feature.values.join(' ')}</p>
  </div>
{/if}

<style>
  .section {
    align-self: flex-start;
    margin: 0.5em 0;
    width: 100%;
  }

  .align-right {
    text-align: right;
  }

  .invalid {
    color: var(--red);
  }

  .info {
    max-width: 50em;
  }
</style>
