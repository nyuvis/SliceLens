<script>
  import DatasetSelector from './controls/DatasetSelector.svelte';
  import FeatureSelector from './controls/FeatureSelector.svelte';
  import FilteringButton from './controls/filtering/FilteringButton.svelte';
  import VisualizationSettings from './controls/VisualizationSettings.svelte';
  import Chart from './visualization/matrix/Chart.svelte';
  import NotesSidebar from './notes/NotesSidebar.svelte';
  import { metadata } from '../stores.js';

  let showPredictions = false;
  let showSize = true;
  // feature name to feature values for categorical features
  // feature name to extent for quantitative features
  // on the whole dataset
  let featureExtents = {};
</script>

<div id="container">
  <div id="controls" class="sidebar">
    <div id="header">
      <p id="title" class="large bold">SliceLens</p>
      <!-- GitHub icon -->
      <a href="https://github.com/nyuvis/SliceLens" target="_blank" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg"
          class="icon icon-tabler icon-tabler-brand-github"
          width="24" height="24" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor"
          fill="none" stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z"/>
          <path d="M9 19c-4.286 1.35-4.286-2.55-6-3m12 5v-3.5c0-1 .099-1.405-.5-2 2.791-.3 5.5-1.366 5.5-6.04a4.567 4.567 0 0 0 -1.333 -3.21 4.192 4.192 0 00-.08-3.227s-1.05-.3-3.476 1.267a12.334 12.334 0 0 0 -6.222 0C6.462 2.723 5.413 3.023 5.413 3.023a4.192 4.192 0 0 0 -.08 3.227A4.566 4.566 0 004 9.486c0 4.64 2.709 5.68 5.5 6.014-.591.589-.56 1.183-.5 2V21" />
        </svg>
      </a>
    </div>
    <DatasetSelector on:load={({detail}) => featureExtents = detail}/>

    <!-- defined in rollup.config.js -->
    <!-- svelte-ignore missing-declaration -->
    {#if FILTERS_ENABLED}
      <FilteringButton {featureExtents}/>
    {/if}

    <VisualizationSettings bind:showSize bind:showPredictions/>
    <FeatureSelector/>
  </div>

  {#if $metadata !== null}
    <Chart {showPredictions} {showSize} />
  {/if}

  <div id="notes" class="sidebar">
    <NotesSidebar/>
  </div>
</div>

<style>
  #header {
    margin-top: 1rem;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  a {
    line-height: 0;
  }

  #container {
    display: flex;
    height: 100vh;
    max-height: 100vh;
  }

  .sidebar {
    background-color: var(--medium-gray);
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