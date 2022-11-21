<script lang="ts">
  import { onMount } from 'svelte';
  import { parseDataset } from '../../lib/Dataset';
  import { dataset, selectedFeatures, showPredictions, visKind } from '../../stores';
  import QuestionBox from '../QuestionBox.svelte';
  import * as d3 from "d3";

  type DatasetInfo = { name: string, path: string};

  let selectedDemoDataset: DatasetInfo = null;
  let uploadedDatasetName: string = null;
  let useCustomDataset: boolean = false;
  let fileInput: HTMLInputElement;

  function switchDemoOrCustom() {
    useCustomDataset = !useCustomDataset;

    if (!useCustomDataset) {
      uploadedDatasetName = null;
      load(selectedDemoDataset);
    }
  }

  // demo datasets

  let datasets: DatasetInfo[] = [];

  function load(info: DatasetInfo) {
    const {path, name} = info;

    d3.text(path).then(content => {
      parseDataset(content, name).then(ds => {
        selectedFeatures.reset();

        if (!ds.hasPredictions) {
          $showPredictions = false;
        }

        $visKind = '';
        $dataset = ds;
      });
    });
  }

  function onSelectChange() {
    load(selectedDemoDataset);
  }

  onMount(async () => {
    // @ts-ignore
    // DATASETS_FILE is set in rollup.config.js
    d3.csv(DATASETS_FILE).then(d => {
      datasets = d as unknown as DatasetInfo[];
      selectedDemoDataset = datasets[0];
      load(selectedDemoDataset);
    });
  });

  // uploaded dataset

  function onUploadChange(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    const files = event.currentTarget.files;

    if (files === undefined  || files.length === 0) {
      return;
    }

    const file = files[0];

    const reader = new FileReader();

    reader.onload = function(event) {
      const content = event.target.result as string;
      const name = file.name;

      parseDataset(content, name).then(ds => {
        selectedFeatures.reset();

        if (!ds.hasPredictions) {
          $showPredictions = false;
        }

        $visKind = '';
        $dataset = ds;
      });
    }

    reader.readAsText(file);
  }

  function onUploadclick() {
    if (fileInput) {
      fileInput.click();
    }
  }
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
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={selectedDemoDataset} on:change={onSelectChange}>
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