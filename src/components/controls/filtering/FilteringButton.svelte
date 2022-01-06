<script lang="ts">
  import FilteringModal from './FilteringModal.svelte';
  import type { FeatureExtent } from '../../../types';

  export let featureExtents: Record<string, FeatureExtent>;

  let showModal: boolean = false;
</script>

<div>
  <button class="small sub-label" on:click={() => showModal = true}>
    Filtering
  </button>
</div>

{#if showModal}
  <FilteringModal
    {featureExtents}
    on:close={() => {
      showModal = false;
    }}
  />
{/if}