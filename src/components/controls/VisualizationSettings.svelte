<script>
  import { metadata } from '../../stores.js';

  export let showSize = true;
  let showPredictionsCheckBox = false;
  export let showPredictions = false;
  export let visualizationType = 'squares';

  $: if ($metadata !== null && $metadata.hasPredictions) {
    showPredictionsCheckBox = true;
  } else {
    showPredictionsCheckBox = false;
    showPredictions = false;
  }
</script>

<div>
  <p class="label bold">Visualization</p>
  <label class="sub-label small">
      <input type="checkbox" bind:checked={showSize}>Scale by num. instances
  </label>

  {#if showPredictionsCheckBox}
    <label class="sub-label small">
      <input type="checkbox" bind:checked={showPredictions}>Show predictions
    </label>
  {/if}

  <select bind:value={visualizationType}>
    <optgroup label="normal">
      {#each ['squares'] as vis}
        <option value={vis}>{vis}</option>
      {/each}
    </optgroup>
    <optgroup label="diff">
      {#each ['squares-diff', 'squares-bar', 'squares-wide', 'squares-line'] as vis}
        <option value={vis}>{vis}</option>
      {/each}
    </optgroup>
  </select>
</div>

<style>
  label {
    display: inline-block;
  }
</style>