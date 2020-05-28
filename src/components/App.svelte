<script>
  import DatasetSelector from './DatasetSelector.svelte';
  import FeatureSelector from './FeatureSelector.svelte';
  import SplitSelector from './SplitSelector.svelte';
  import ChartSelector from './ChartSelector.svelte';
  import ChartManager from './ChartManager.svelte';
  import NotesSidebar from './notes/NotesSidebar.svelte';
  import matrix from '../visualization/matrix.js';

  let chart = matrix();
  let showPredictions = false;
</script>

<div id="container">
  <div id="controls">
    <h2>Controls</h2>
    <DatasetSelector on:update={e => showPredictions = e.detail}/>
    <SplitSelector/>
    <ChartSelector on:update={e => chart = e.detail}/>
    <FeatureSelector/>
  </div>

  <ChartManager {chart} {showPredictions}/>

  <NotesSidebar/>
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

    max-width: 200px;
    display: flex;
    flex-direction: column;
  }
</style>