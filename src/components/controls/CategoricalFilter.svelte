<script>
  import { filters } from '../../stores.js';

  export let filter;
  export let categories;

  // changing filter for categorical feature
  function onCheckboxSelectionChange() {
    if (filter.selected.length === 0) {
      filter.valid = false;
      $filters = $filters;
      return;
    }

    filter.valid = true;
    filter.selectedSet = new Set(filter.selected);

    $filters = $filters;
  }
</script>

{#if !filter.valid}
    <p>At least one value must be selected</p>
{/if}
<div class="grid">
  {#each categories as category}
    <label>
      <input
        type=checkbox
        bind:group={filter.selected}
        value={category}
        on:change={onCheckboxSelectionChange}
      />
      {category}
    </label>
  {/each}
</div>

<style>
  p {
    color: red;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
</style>