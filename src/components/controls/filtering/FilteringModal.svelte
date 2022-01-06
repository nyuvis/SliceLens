<!---
References:
https://www.w3schools.com/howto/howto_css_modals.asp

A lot of this code is from FeatureEditor.svelte. It could be
refactored into a Modal.svelte.
-->

<script lang="ts">
  import QuantitativeFilterEditor from './QuantitativeFilterEditor.svelte';
  import CategoricalFilterEditor from './CategoricalFilterEditor.svelte';
  import { filters, fullDataset, dataset, metadata } from '../../../stores.js';
  import { getMetadata, getFilteredDataset } from '../../../DataTransformer.js';
  import { createEventDispatcher } from "svelte";
  import type { Dataset, FeatureExtent, Metadata, QuantitativeExtent, CategoricalExtent, QuantitativeFilter, CategoricalFilter } from '../../../types';

  export let featureExtents: Record<string, FeatureExtent>;

  const dispatch = createEventDispatcher();
  const defaultOption: string = 'Select a feature';

  let emptyDataset: boolean = false;

  $: filteredFeatureNames = new Set($filters.map(f => f.feature));
  // [].every(f => f.valid) returns true, so allFiltersValid is true
  // when there are no filters
  $: allFiltersValid = $filters.every(f => f.valid);

  function onkeydown(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      onCloseWindow();
    }
  }

  function onCloseWindow() {
    // don't allow the window to close unless all features are valid
    if (!allFiltersValid) {
      return false;
    }

    const data: Dataset = getFilteredDataset($fullDataset, $filters);

    // don't allow the window to close if the filtered dataset is empty
    if (data.length === 0) {
      emptyDataset = true;
      return;
    }

    emptyDataset = false;

    const md: Metadata = getMetadata(data);
    $dataset = data;
    $metadata = md;

    dispatch('close');
  }

  function addFilter() {
    $filters = [
      ...$filters,
      { type: 'Q', feature: defaultOption, valid: false, min: 0, max: 0, rightInclusive: false }
    ];
  }

  // removing a filter
  function removeFilter(i: number) {
    if (i < $filters.length) {
      $filters.splice(i, 1);
      $filters = $filters;
    }
  }

  // changing which feature the filter is for
  function onChangeFeature(target: EventTarget & HTMLSelectElement, i: number) {
    const name: string = target.value;

    if (name === defaultOption) {
      return;
    }

    const featureExtent = featureExtents[name];

    if (featureExtent.type === 'Q') {
      const [min, max] = featureExtent.extent;
      $filters[i] = {
        feature: name,
        type: featureExtent.type,
        valid: true,
        rightInclusive: true,
        min,
        max
      };
    } else {
      $filters[i] = {
        feature: name,
        type: featureExtent.type,
        valid: true,
        selected: [...featureExtent.categories],
        selectedSet: new Set(featureExtent.categories)
      };
    }
  }

  function getExtent(filter: QuantitativeFilter): [number, number] {
    return (featureExtents[filter.feature] as QuantitativeExtent).extent;
  }

  function getCategories(filter: CategoricalFilter): string[] {
    return (featureExtents[filter.feature] as CategoricalExtent).categories;
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
            <select value={filter.feature} on:change={e => onChangeFeature(e.currentTarget, i)}>

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
            {#if filter.feature === defaultOption}
              <p class="error">
                Select a feature to filter.
              </p>
            {:else if filter.type === 'Q'}
              <QuantitativeFilterEditor extent={getExtent(filter)} {filter} />
            {:else if filter.type === 'C'}
              <CategoricalFilterEditor categories={getCategories(filter)} {filter}/>
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
    color: var(--red);
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
</style>

