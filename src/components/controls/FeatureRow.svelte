<!---
References:
https://svelte.dev/repl/810b0f1e16ac4bbd8af8ba25d5e0deff?version=3.4.2
https://svelte.dev/repl/adf5a97b91164c239cc1e6d0c76c2abe?version=3.14.1
-->

<script lang="ts">
  import FeatureEditor from './FeatureEditor.svelte';
  import { dataset, features, selectedFeatures } from '../../stores';
  import type { Feature, Row } from '../../types';
  import { decreaseNumberOfBins, increaseNumberOfBins, allowedBinNumbers } from '../../lib/QuantitativeFeatureEditing';
  import { isQuantitativeFeature } from '../../lib/Features';

  export let feature: Feature;
  export let canAddFeatures: boolean;
  export let isSelected: boolean;
  export let relevance: number = 0;
  export let draggingOver: boolean = false;
  export let highlight: boolean = false;

  $: featureValues = $dataset.rows.map((d: Row) => d[feature.name]);

  let showFeatureEditor: boolean = false;

  function add() {
    selectedFeatures.add(feature.name);
  }

  function remove() {
    selectedFeatures.remove(feature.name);
  }

  function moreBins() {
    if (feature.type === 'Q' && isQuantitativeFeature(featureValues)) {
      increaseNumberOfBins(feature, featureValues);
      $features = $features;
    }
  }

  function fewerBins() {
    if (feature.type === 'Q' && isQuantitativeFeature(featureValues)) {
      decreaseNumberOfBins(feature, featureValues);
      $features = $features;
    }
  }
</script>

{#if showFeatureEditor}
  <FeatureEditor
    feature={feature}
    featureValues={featureValues}
    on:close={() => showFeatureEditor = false}
  />
{/if}

<div class="feature small"
  class:draggingOver
  class:selected={isSelected}
  class:all={!isSelected}
  class:no-pointer-event="{!canAddFeatures && !isSelected}"
  id={feature.name}
  draggable=true
  on:dragover|preventDefault={() => false}
  on:drop|preventDefault
  on:dragstart
  on:dragend
  on:dragenter
  on:dragleave
>
  {#if isSelected}
    <!-- trash can icon -->
    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-trash"
      width="24" height="24" viewBox="0 0 24 24"
      stroke-width="2" stroke="currentColor" fill="none"
      stroke-linecap="round" stroke-linejoin="round"
      on:click={remove}
    >
      <path stroke="none" d="M0 0h24v24H0z"/>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    </svg>
  {:else}
    <!-- plus icon -->
    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-plus"
      width="24" height="24" viewBox="0 0 24 24"
      stroke-width="2" stroke="currentColor" fill="none"
      stroke-linecap="round" stroke-linejoin="round"
      on:click={add}
      class:disabled={$selectedFeatures.includes(feature.name)}
    >
      <path stroke="none" d="M0 0h24v24H0z"/>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  {/if}

  <div class="gap feature-name-container">
    {#if relevance >= 0 && canAddFeatures}
      <div class="bar" style="width: {relevance * 100}%;"></div>
    {/if}
    <p class="cutoff feature-name">{feature.name}</p>
    {#if highlight}
      <!-- lightbulb icon indicates that this feature was added by the tool -->
      <svg xmlns="http://www.w3.org/2000/svg"
        class="icon icon-tabler icon-tabler-bulb"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor" fill="none"
        stroke-linecap="round" stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
        <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
        <line x1="9.7" y1="17" x2="14.3" y2="17" />
      </svg>

    {/if}
  </div>

  {#if isSelected && feature.type === 'Q' && feature.splitType !== 'custom'}
    <!-- decrease and increase number of bins in the feature -->
    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-circle-minus"
      width="24" height="24" viewBox="0 0 24 24"
      stroke-width="2" stroke="currentColor" fill="none"
      stroke-linecap="round" stroke-linejoin="round"
      on:click={fewerBins}
      class:disabled="{feature.numBins <= allowedBinNumbers[0]}"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>

    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-circle-plus"
      width="24" height="24" viewBox="0 0 24 24"
      stroke-width="2" stroke="currentColor" fill="none"
      stroke-linecap="round" stroke-linejoin="round"
      on:click={moreBins}
      class:disabled="{feature.numBins >= allowedBinNumbers[allowedBinNumbers.length - 1]}"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="12" y1="9" x2="12" y2="15" />
    </svg>
  {/if}

  <!-- edit icon -->
  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit"
    width="24" height="24" viewBox="0 0 24 24"
    stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round"
    on:click={() => showFeatureEditor = true}
  >
    <path stroke="none" d="M0 0h24v24H0z"/>
    <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
    <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
    <line x1="16" y1="5" x2="19" y2="8" />
  </svg>
</div>


<style>
  .feature {
    display: flex;
    cursor: move;
    /* if features are right next to eachother then
    highlighting drop placement doesn't work */
    margin-bottom: 3px;
    align-items: center;
  }

  .feature:hover {
    font-weight: 500;
  }

  .feature p {
    margin: 0;
    padding: 0;
    pointer-events: none;
  }

  .no-pointer-event {
    pointer-events: none;
  }

  .feature-name-container {
    max-width: 85%;
    position: relative;
    display: flex;
    align-items: center;
  }

  .feature-name {
    position: relative;
    z-index: 2;
  }

  .bar {
    height: 1em;
    position: absolute;
    background-color: var(--medium-gray);
    z-index: 1;
  }

  .draggingOver {
    font-weight: 500;
  }

  /* icons */

  .icon-tabler-trash,
  .icon-tabler-plus,
  .icon-tabler-edit,
  .icon-tabler-circle-minus,
  .icon-tabler-circle-plus {
    visibility: hidden;
    cursor: pointer;
  }

  .selected:hover .icon-tabler-circle-plus,
  .selected:hover .icon-tabler-circle-minus,
  .selected:hover .icon-tabler-edit,
  .selected:hover .icon-tabler-trash,
  .all:hover .icon-tabler-plus,
  .all:hover .icon-tabler-edit {
    visibility: visible;
    color: black;
  }

  .selected:hover .icon-tabler-trash:hover {
    color: var(--red);
  }

  .selected:hover .icon-tabler-edit:hover,
  .selected:hover .icon-tabler-circle-plus:not(.disabled):hover,
  .selected:hover .icon-tabler-circle-minus:not(.disabled):hover,
  .all:hover .icon-tabler-edit:not(.disabled):hover,
  .all:hover .icon-tabler-plus:not(.disabled):hover {
    color: var(--blue);
  }

  .disabled:hover {
    cursor: not-allowed;
    color: var(--dark-gray)
  }
</style>