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
  <div id="controls" class="sidebar">
    <DatasetSelector on:update={e => showPredictions = e.detail}/>
    <SplitSelector/>
    <ChartSelector on:update={e => chart = e.detail}/>
    <FeatureSelector/>
  </div>

  <ChartManager {chart} {showPredictions}/>

  <div id="notes" class="sidebar">
    <NotesSidebar/>
  </div>
</div>

<style>
  #container {
		display: flex;
		height: 100%;
  }

  .sidebar {
    background-color: #E5E5E5;
    padding: 0px 1em 1em 1em;

    display: flex;
    flex-direction: column;
  }

  #controls {
    flex: 0 0 200px;
    max-width: 200px;
  }

  #notes {
    flex: 0 0 300px;
    max-width: 300px;
  }
</style>