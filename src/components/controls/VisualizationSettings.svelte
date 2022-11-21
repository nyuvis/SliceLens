<script lang="ts">
  import { dataset, showPredictions, compareToWhole, showSize, visKind, selectedFeatures } from '../../stores';
  import type { ClassificationDataset, Features, RegressionDataset } from '../../types';
  import QuestionBox from '../QuestionBox.svelte';

  // @ts-ignore
  // defined in rollup.config.js
  const alternativeVis: boolean = ALTERNATIVE_VIS;

  function getVisKinds(selected: string[], features: Features, datasetType: "classification" | "regression") {
    const numQuant = selected.filter(d => features[d].type === 'Q').length;
    const numCat = selected.filter(d => features[d].type === 'C').length;

    let vals = [];

    if (datasetType === "classification") {
      if (numQuant === 0 && numCat === 1) {
        vals = ['c01-grouped', 'c01-stacked', 'c01-square'];
      } else if (numQuant === 1 && numCat === 0) {
        vals = ['c10-strip', 'c10-histogram'];
      } else if (numQuant === 1 && numCat === 1) {
        vals = ['c11-strip-horizontal', 'c11-strip-vertical'];
      } else if (numQuant === 0 && numCat === 2) {
        vals = ['c02-square', 'c02-grouped-stacked'];
      } else if (numQuant === 2 && numCat === 0) {
        vals = ['c20-scatter', 'c20-scatter-binned-rect', 'c20-scatter-binned-circle'];
      } else if (numQuant === 1 && numCat === 2) {
        vals = ['c12-strip-mult']
      } else if (numQuant === 2 && numCat === 1) {
        vals = ['c12-scatter-mult']
      } else if (numQuant === 3 && numCat === 0) {
        vals = ['c30-scatter-size', 'c30-scatter-opacity'];
      } else if (numQuant === 0 && numCat === 3) {
        vals = ['c03-square'];
      }
    } else {
      if (numQuant === 0 && numCat === 1) {
        vals = ['r01-strip-horizontal', 'r01-strip-vertical', 'r01-box', 'r01-violin', 'r01-histograms'];
      } else if (numQuant === 1 && numCat === 0) {
        vals = ['r10-strip', 'r10-scatter'];
      } else if (numQuant === 1 && numCat === 1) {
        vals = ['r11-strip'];
      } else if (numQuant === 0 && numCat === 2) {
        vals = ['r02-square', 'r02-grouped-stacked', 'r02-hist-mult', 'r02-strip-mult'];
      } else if (numQuant === 2 && numCat === 0) {
        vals = ['r20-scatter', 'r20-scatter-binned-rect', 'r20-scatter-binned-circle'];
      } else if (numQuant === 1 && numCat === 2) {
        vals = ['r12-strip-mult']
      } else if (numQuant === 2 && numCat === 1) {
        vals = ['r12-scatter-mult']
      } else if (numQuant === 3 && numCat === 0) {
        vals = ['r30-scatter-size'];
      } else if (numQuant === 0 && numCat === 3) {
        vals = ['r03-square', 'r03-hist-mult', 'r03-strip-mult'];
      }
    }

    if (!vals.includes($visKind)) {
      $visKind = vals[0];
    }

    return vals;
  }

  $: visKinds = getVisKinds($selectedFeatures, $dataset.features, $dataset.type);
</script>

<div>
  <div class="label help-row">
    <p class="bold">Visualization</p>
    <QuestionBox>
      Visualization settings:
      <ul>
        <li>
          <b>Scale by num. instances</b> determines whether or not the visualization of a subset reflects the number of instances in the subset.
        </li>
        {#if $dataset.hasPredictions}
          <li>
            <b>Show predictions</b> toggles whether the visualiztion shows predictions or the ground truth labels.
          </li>
        {/if}
        {#if alternativeVis}
          <li>
            <b>Kind</b> determines the type of visualization used for the subset.
          </li>
        {/if}
        {#if $visKind === 'squares'}
          <li>
            <b>Compare to whole</b> toggles whether or not the visualization highlights how the distribution
            of each subset differs from the dataset as a whole. If a subset has a higher percentage of a given class than
            the dataset as a whole, then there is a bar to the right of that class's layer. The height of the
            bar encodes the percentage point increase of the class in the subset compared to the entire dataset.
          </li>
        {/if}
      </ul>
    </QuestionBox>
  </div>

  <label class="sub-label small">
      <input type="checkbox" bind:checked={$showSize}>Scale by num. instances
  </label>

  {#if $dataset.hasPredictions}
    <label class="sub-label small">
      <input type="checkbox" bind:checked={$showPredictions}>Show predictions
    </label>
  {/if}

  <div>
    <label class="sub-label small">
      Kind
      <select bind:value={$visKind}>
        {#each visKinds as kind, i}
          <option value={kind}>{kind}</option>
        {/each}
      </select>
    </label>
  </div>
</div>

<style>
  label {
    display: inline-block;
  }

  .help-row {
    display: flex;
    align-items: center;
  }
</style>