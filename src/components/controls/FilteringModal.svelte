<!---
References:
https://www.w3schools.com/howto/howto_css_modals.asp

A lot of this code is from FeatureEditor.svelte. It could be
refactored into a Modal.svelte.
-->

<script>
  import CategoricalFilter from './CategoricalFilter.svelte';
  import { filters, fullDataset, dataset, metadata } from '../../stores.js';
  import { getMetadata, getFilteredDataset, isNumeric } from '../../DataTransformer.js';
  import { createEventDispatcher } from "svelte";

  export let featureExtents;

  const dispatch = createEventDispatcher();
  const defaultOption = 'Select a feature';

  let emptyDataset = false;

  $: filteredFeatureNames = new Set($filters.map(f => f.feature));
  $: allFiltersValid = $filters.every(f => f.valid);

  function onkeydown(ev) {
    if (ev.key === 'Escape') {
      onCloseWindow();
    }
  }

  function onCloseWindow() {
    if (!allFiltersValid) {
      return false;
    }

    const data = getFilteredDataset($fullDataset, $filters);

    if (data.length === 0) {
      emptyDataset = true;
      return;
    }

    emptyDataset = false;

    const md = getMetadata(data);
    $dataset = data;
    $metadata = md;

    dispatch('close');
  }

  function addFilter() {
    $filters = [...$filters, { feature: defaultOption, type: '', valid: false}];
  }

  // removing a filter
  function removeFilter(i) {
    if (i < $filters.length) {
      $filters.splice(i, 1);
      $filters = $filters;
    }
  }

  // changing which feature the filter is for
  function onChangeFeature(name, i) {
    if (name === defaultOption) {
      return;
    }

    const featureExtent = featureExtents[name];

    const filter = {
      feature: name,
      type: featureExtent.type,
      valid: true
    };

    if (filter.type === 'Q') {
      [filter.min, filter.max] = featureExtent.extent;
      filter.rightInclusive = true;
    } else {
      filter.selected = [...featureExtent.categories];
      filter.selectedSet = new Set(filter.selected);
    }

    $filters[i] = filter;
  }

  // changing filter for numeric feature
  function onNumberChange(filter) {
    const [minValue, maxValue] = featureExtents[filter.feature].extent;

    filter.valid =
      isNumeric(filter.min) &&
      isNumeric(filter.max) &&
      +filter.min >= minValue &&
      +filter.max <= maxValue &&
      +filter.min < +filter.max;

    if (filter.valid) {
      filter.min = +filter.min;
      filter.max = +filter.max;
      filter.rightInclusive = filter.max === maxValue;
    }

    $filters = $filters;
  }
</script>

<svelte:window on:keydown={onkeydown}/>

<div class="modal-background">
  <div class="modal-content">
    <div class="feature-name large bold">Dataset Filtering</div>

    <div class="button-row sub-label">
      <button on:click={addFilter}
        disabled={$metadata.featureNames.length === filteredFeatureNames.size}
      >
        New Filter
      </button>

      <div class="gap" />

      <button on:click={onCloseWindow} disabled={!allFiltersValid}>Apply Filter</button>
    </div>

    {#if emptyDataset}
      <p class="sub-label error-message">Filtered dataset is empty.</p>
    {/if}

    <div class="filters">
      {#each $filters as filter, i}
        <div class="filter">
          <div class="filter-name-row">

            <!-- svelte-ignore a11y-no-onchange -->
            <select value={filter.feature} on:change={e => onChangeFeature(e.target.value, i)}>

              <option disabled>{defaultOption}</option>

              {#each $metadata.featureNames as name}
                {#if !filteredFeatureNames.has(name) || name === filter.feature}
                  <option value={name}>{name}</option>
                {/if}
              {/each}

            </select>

            <div class="gap"></div>

            <!-- x icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-x"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              on:click={() => removeFilter(i)}>
              <path stroke="none" d="M0 0h24v24H0z" />
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>

          </div>

          <div class="filter-content">
            {#if filter.type === 'Q'}

              {#if !filter.valid}
                <p class="error-message">
                  Values must be numbers in the range {featureExtents[filter.feature].extent.join(' - ')},
                  with the first value less than the second.
                </p>
              {/if}
              <div>
                Range:
                [<input size=6 bind:value={filter.min} on:change={() => onNumberChange(filter)}>
                ,
                <input size=6 bind:value={filter.max} on:change={() => onNumberChange(filter)}>)
              </div>

            {:else if filter.type === 'C'}
              <CategoricalFilter categories={featureExtents[filter.feature].categories} {filter}/>
            {:else}

              {#if !filter.valid}
                <p class="error-message">
                  Select a feature to filter.
                </p>
              {/if}

            {/if}
          </div>

        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .modal-background {
    position: fixed;
    z-index: 3;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background-color: white;

    width: 50em;
    height: 90%;

    border-radius: 5px;

    padding: 1rem;

    display: flex;
    flex-direction: column;

    overflow-x: auto;
  }

  .button-row {
    display: flex;
  }

  .icon-tabler-x {
    cursor: pointer;
    margin-left: 1em;
  }

  .icon-tabler-x:hover {
    color: red;
  }

  .filters {
    flex: 1;
    overflow-y: auto;
  }

  .filter {
    padding: 0.25em;
    margin: 0.25em 0;

    border-radius: 5px;
    border: 1px solid var(--medium-gray);
    background-color: var(--medium-gray);

    display: flex;
    flex-direction: column;
  }

  .filter-name-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
  }

  .filter-content {
    display: flex;
    flex-direction: column;
    margin-top: 0.25em;
  }

  .filter .icon-tabler-x {
    visibility: hidden;
  }

  .filter:hover .icon-tabler-x {
    visibility: visible;
  }

  .error-message {
    color: red;
  }
</style>

