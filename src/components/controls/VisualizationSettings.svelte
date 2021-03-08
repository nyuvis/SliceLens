<script>
  import { metadata } from '../../stores.js';

  export let showSize = true;
  let showPredictionsCheckBox = false;
  export let showPredictions = false;

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
</div>

<style>
  label {
    display: inline-block;
  }
</style>