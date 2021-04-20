<script>
  import { filters } from '../../../stores.js';

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

  function selectAll() {
    filter.selected = categories;
    onCheckboxSelectionChange();
  }

  function deselectAll() {
    filter.selected = [];
    onCheckboxSelectionChange();
  }
</script>

{#if !filter.valid}
    <p class="error">At least one value must be selected</p>
{/if}

<div>
  <button class="small" on:click={selectAll}>Select All</button>
  <button class="small" on:click={deselectAll}>Deselect All</button>
</div>

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
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
</style>