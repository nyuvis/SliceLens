<script lang="ts">
  import { dataset, showPredictions, showSize, visKind, visOrientation } from '../../stores';

  let showPredictionsCheckBox: boolean = false;

  $: if ($dataset.hasPredictions) {
    showPredictionsCheckBox = true;
  } else {
    showPredictionsCheckBox = false;
    $showPredictions = false;
  }
</script>

<div>
  <p class="label bold">Visualization</p>
  <label class="sub-label small">
      <input type="checkbox" bind:checked={$showSize}>Scale by num. instances
  </label>

  {#if showPredictionsCheckBox}
    <label class="sub-label small">
      <input type="checkbox" bind:checked={$showPredictions}>Show predictions
    </label>
  {/if}

  <div>
    {#each ['squares', 'bars'] as kind}
      <label class="sub-label small">
        <input type=radio bind:group={$visKind} name="kind" value={kind}>
        {kind}
      </label>
    {/each}
  </div>

  {#if $visKind === 'bars'}
    <div>
      {#each ['horizontal', 'vertical'] as orientation}
        <label class="sub-label small">
          <input type=radio bind:group={$visOrientation} name="orientation" value={orientation}>
          {orientation}
        </label>
      {/each}
    </div>
  {/if}
</div>

<style>
  label {
    display: inline-block;
  }
</style>