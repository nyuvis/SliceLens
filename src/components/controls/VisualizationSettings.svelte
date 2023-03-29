<script lang="ts">
  import { dataset, showPredictions, compareToWhole, showSize, visKind, quantileColor } from '../../stores';
  import { visKinds } from '../../types';
  import QuestionBox from '../QuestionBox.svelte';

  // @ts-ignore
  // defined in rollup.config.js
  const alternativeVis: boolean = ALTERNATIVE_VIS;
</script>

<div>
  <div class="label help-row">
    <p class="bold">Visualization</p>
    <QuestionBox>
      <div class="visualization-settings-help">
        <div>Visualization settings:</div>
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
      </div>
    </QuestionBox>
  </div>

  <label class="small">
      <input type="checkbox" bind:checked={$showSize}>Scale by num. instances
  </label>

  {#if $dataset.hasPredictions}
    <label class="small">
      <input type="checkbox" bind:checked={$showPredictions}>Show predictions
    </label>
  {/if}

  {#if $dataset.type === 'regression' && $visKind === 'squares'}
    <label class="small">
      <input type="checkbox" bind:checked={$quantileColor}>Quantile color scale
    </label>
  {/if}

  {#if alternativeVis}
    <label class="small">
      Kind
      <select bind:value={$visKind}>
        {#each visKinds as kind}
          <option value={kind}>{kind}</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if $visKind === 'squares' && $dataset.type === 'classification'}
    <label class="small">
      <input type="checkbox" bind:checked={$compareToWhole}>Compare to whole
    </label>
  {/if}
</div>

<style>
  label {
    display: inline-block;
  }

  .help-row {
    display: flex;
    align-items: center;
  }

  .visualization-settings-help > ul {
    margin-bottom: 0;
  }

  .visualization-settings-help > * + * {
    margin-top: 0.5em;
  }
</style>