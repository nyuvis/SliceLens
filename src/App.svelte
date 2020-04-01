<script>
  import { onMount } from 'svelte';
  import DatasetSelector from './DatasetSelector.svelte';
  import FeatureSelector from './FeatureSelector.svelte';
  import SplitSelector from './SplitSelector.svelte';
  import ChartSelector from './ChartSelector.svelte';
  import ChartManager from './ChartManager.svelte';

  import matrix from './matrix.js';

  let chartManagerComponent;

  let dataset;
  let selectedFeatures;
  let splitType;
  let chart;
  
  $: features = dataset && dataset.columns ? dataset.columns.slice(0, -1) : [];
  $: label = dataset && dataset.columns ? dataset.columns[dataset.columns.length - 1] : '';

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
      {dataset}
      {splitType}
      {label}
      bind:selected={selectedFeatures}/>
  </div>

  <ChartManager
    {dataset}
    {splitType}
    {chart}
    {selectedFeatures}
    featureNames={features}
    {label}
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
    background-color: #F5F5F5;
    padding: 0 5px;
  }
</style>