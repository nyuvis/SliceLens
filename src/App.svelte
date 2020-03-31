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

    if (chartManagerComponent !== undefined) {
      chartManagerComponent.clear();
    }
  }

  function ontest() {
    alert('test');
  }

</script>

<main>
  <div id="controls">
    <DatasetSelector on:update={onDatasetChange}/>
    <FeatureSelector {features} bind:selected={selectedFeatures}/>
    <SplitSelector on:update={e => splitType = e.detail}/>
    <ChartSelector on:update={e => chart = e.detail}/>
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
</main>

<style>
  #controls {
    flex: 0 0 200px;
    background-color: #F5F5F5;
  }

  main {
		display: flex;
		height: 100%;
	}
</style>