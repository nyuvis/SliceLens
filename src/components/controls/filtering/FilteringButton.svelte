<script>
  import FilteringModal from './FilteringModal.svelte';

  export let featureExtents;

  let showModal = false;
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