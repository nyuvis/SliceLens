<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { dataset, selectedFeatures, metadata } from '../stores.js';
  import * as d3 from "d3";

  let selectedDemoDataset = null;
  let uploadedDatasetName = null;
  let useCustomDataset = false;
  let fileInput;

  function switchDemoOrCustom() {
    useCustomDataset = !useCustomDataset;

    if (!useCustomDataset) {
      uploadedDatasetName = null;
      load(selectedDemoDataset);
    }
  }

  // demo datasets

  let datasets = [];

  function load({path, name}) {
    d3.csv(path, d3.autoType).then(data => {
      data.name = name;
      $selectedFeatures = [];
      $dataset = data;
    });
  }

  function onSelectChange() {
    load(selectedDemoDataset);
  }

  onMount(async () => {
    d3.csv('../datasets/datasets.csv').then(d => {
      datasets = d;
      selectedDemoDataset = datasets[0];
      load(selectedDemoDataset);
    });
  });

  // uploaded dataset

  function onUploadChange(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    const file = files[0];

    const reader = new FileReader();

    reader.onload = function(event) {
      const text = event.target.result;
      const data = d3.csvParse(text, d3.autoType);
      data.name = file.name;
      uploadedDatasetName = file.name;
      $selectedFeatures = [];
      $dataset = data;
    }

    reader.readAsText(file);
  }

  function onUploadclick() {
    if (fileInput) {
      fileInput.click();
    }
  }

  // whether or not the chart should show predicted values

  let showPredictionsCheckBox = false;
  let predictions = false;

  $: if ($metadata !== null && $metadata.hasPredictions) {
    showPredictionsCheckBox = true;
  } else {
    showPredictionsCheckBox = false;
    predictions = false;
  }

  const dispatch = createEventDispatcher();
  $: dispatch('update', predictions);
</script>

<div>
  <p class="label bold">Dataset</p>

  <p class="link small" on:click={switchDemoOrCustom}>
    {
      useCustomDataset ?
        "Use demo dataset" :
        "Use my own dataset"
    }
  </p>

  {#if useCustomDataset}
    <input
      bind:this={fileInput}
      type="file"
      accept=".csv"
      style="display:none"
      on:change={onUploadChange}
    >

    <p on:click={onUploadclick} class="link small">Select File</p>

    {#if uploadedDatasetName !== null}
      <p class="sub-label small">Current: {uploadedDatasetName}</p>
    {/if}

  {:else}
    <select bind:value={selectedDemoDataset} on:change={onSelectChange}>
      {#each datasets as dataset}
        <option value={dataset}>{dataset.name}</option>
      {/each}
    </select>
  {/if}

  {#if showPredictionsCheckBox}
    <label class="sub-label small">
      <input type="checkbox" bind:checked={predictions}>Show predictions
    </label>
  {/if}
</div>

<style>
  label {
    display: inline-block;
  }
</style>