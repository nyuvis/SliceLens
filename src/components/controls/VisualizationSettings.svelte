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
    <optgroup label="classification">
      {#each ['squares', 'pie'] as vis}
        <option value={vis}>{vis}</option>
      {/each}
    </optgroup>
    <optgroup label="regression">
      {#each ['radial KDE', 'normal KDE', 'radial histogram', 'normal histogram', 'squares reg'] as vis}
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