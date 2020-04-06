<script>
  import { onMount } from 'svelte';
  import DatasetSelector from './DatasetSelector.svelte';
  import FeatureSelector from './FeatureSelector.svelte';
  import SplitSelector from './SplitSelector.svelte';
  import ChartSelector from './ChartSelector.svelte';
  import ChartManager from './ChartManager.svelte';
  import {getMetadata, getData} from './DataTransformer.js';

  import matrix from './matrix.js';

  let chartManagerComponent;

  let dataset = [];
  let selectedFeatures = [];
  let splitType = '';
  let chart = matrix();
  
  $: features = dataset.columns ? dataset.columns.slice(0, -1) : [];
  $: label = dataset.columns ? dataset.columns[dataset.columns.length - 1] : '';

  $: metadata = getMetadata(features, dataset, label, splitType);
  $: data = getData(metadata.features, selectedFeatures, dataset);

  function onDatasetChange(e) {
    dataset = e.detail;
    selectedFeatures = [];
  }

</script>

<div id="container">
  <div id="controls">
    <DatasetSelector on:update={onDatasetChange}/>
    <SplitSelector on:update={e => splitType = e.detail}/>
    <ChartSelector on:update={e => chart = e.detail}/>
    <FeatureSelector {features}
      {metadata}
      {dataset}
      bind:selected={selectedFeatures}/>
  </div>

  <ChartManager
    {dataset}
    {chart}
    {metadata}
    {data}
    {selectedFeatures}
    bind:this={chartManagerComponent}
  />
</div>

<style>
  #container {
		display: flex;
		height: 100%;
  }
  
  #controls {
    flex: 0 0 200px;
    background-color: #E5E5E5;
    padding: 5px 15px;
  }
</style>