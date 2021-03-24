<script>
  import { onMount } from 'svelte';
  import { getMetadata } from '../../DataTransformer.js';
  import { dataset, selectedFeatures, metadata } from '../../stores.js';
  import QuestionBox from '../QuestionBox.svelte';
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
      const md = getMetadata(data);
      $selectedFeatures = [];
      $dataset = data;
      $metadata = md;
    });
  }

  function onSelectBlur() {
    load(selectedDemoDataset);
  }

  onMount(async () => {
    // DATASETS_FILE is set in rollup.config.js
    d3.csv(DATASETS_FILE).then(d => {
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

      const md = getMetadata(data);
      $selectedFeatures = [];
      $dataset = data;
      $metadata = md;
    }

    reader.readAsText(file);
  }

  function onUploadclick() {
    if (fileInput) {
      fileInput.click();
    }
  }

  const datasetTooltip = ``;
</script>

<div>
  <p class="label bold">Dataset</p>

  <button class="small sub-label" on:click={switchDemoOrCustom}>
    {
      useCustomDataset ?
        "Use demo dataset" :
        "Use my own dataset"
    }
  </button>

  {#if useCustomDataset}
    <input
      bind:this={fileInput}
      type="file"
      accept=".csv"
      style="display:none"
      on:change={onUploadChange}
    >

    <div class="help-row">
      <button on:click={onUploadclick} id="selectFile" class="small">Select File</button>
      <QuestionBox>
        Your dataset must be a CSV file that has a "label" column,
        representing the ground truth class label for each row.
        Optionally, the dataset can also contain a "prediction"
        column, representing a predicted value for each row.
      </QuestionBox>
    </div>

    {#if uploadedDatasetName !== null}
      <p class="sub-label small">Current: {uploadedDatasetName}</p>
    {/if}

  {:else}
    <select bind:value={selectedDemoDataset} on:blur={onSelectBlur}>
      {#each datasets as dataset}
        <option value={dataset}>{dataset.name}</option>
      {/each}
    </select>
  {/if}
</div>

<style>
  .help-row {
    display: flex;
    align-items: center;
  }
</style>