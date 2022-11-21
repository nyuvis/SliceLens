<!---
References:
https://svelte.dev/repl/810b0f1e16ac4bbd8af8ba25d5e0deff?version=3.4.2
https://svelte.dev/repl/adf5a97b91164c239cc1e6d0c76c2abe?version=3.14.1
-->

<script lang="ts">
  import QuestionBox from '../QuestionBox.svelte';
  import FeatureRow from './FeatureRow.svelte';
  import {dataset, selectedFeatures } from '../../stores';
  import { flip } from "svelte/animate";

  // @ts-ignore
  // defined in rollup.config.js
  const ratingsEnabled: boolean = RATINGS_ENABLED;

  let featuresNames: string[] = [];
  $: if ($dataset !== null) {
    // sort by alphabetical order
    featuresNames = $dataset.featureNames.slice().sort((a, b) => a.localeCompare(b));
  }

  const maxFeatures: number = 4;
  $: canAddFeatures = $selectedFeatures.length < maxFeatures;

  // features that were automatically added by the suggestions
  let featuresToHighlight: Set<string> = new Set();

  function setFeatureToHighlight({ detail }: { detail: Set<string> }) {
    featuresToHighlight = detail;
  }

  // drag and drop

  let dragInProgress: boolean = false;
  let draggingOverFeature: string = null;

  function dropHandler(event: DragEvent, i: number) {
    const item = JSON.parse(event.dataTransfer.getData("text"));

    /* make sure that a feature is being dragged in */
    if (!featuresNames.includes(item.id)) {
      return;
    }

    selectedFeatures.addAtIndex(item.id, i);
  }

  function startHandler(event: DragEvent, feature: string) {
    dragInProgress = true;
    const item = {id: feature};
    event.dataTransfer.setData("text", JSON.stringify(item));
  }

  function endHandler() {
    dragInProgress = false;
    draggingOverFeature = null;
  }

  $: featuresToShow = featuresNames;
</script>

<div class="label help-row">
  <p class="bold">Selected</p>
  <QuestionBox>
    You can select features by dragging and dropping from below or
    by clicking on the plus icon that appears when you hover over
    the name of a feature. You can reorder selected features by
    dragging and dropping. You can select at most four features.
  </QuestionBox>
</div>

<div id="selected-features" class="feature-box" class:dragInProgress>
  {#each $selectedFeatures as feature, i (feature)}
    <FeatureRow
      feature={$dataset.features[feature]}
      {canAddFeatures}
      highlight={featuresToHighlight.has(feature)}
      isSelected={true}
      draggingOver={draggingOverFeature === feature}
      on:drop={e => dropHandler(e, i)}
      on:dragstart={(e) => startHandler(e, feature)}
      on:dragend={endHandler}
      on:dragenter={() => draggingOverFeature = feature}
      on:dragleave={() => draggingOverFeature = null}
    />
  {/each}
  {#if canAddFeatures}
    <div class="place-holder"
      on:dragover|preventDefault={() => false}
      on:drop|preventDefault={e => dropHandler(e, $selectedFeatures.length)}
    >
      <p class="instruction"
        class:hidden="{$selectedFeatures.length !== 0}"
      >
        Add features from below.
      </p>
    </div>
  {/if}
</div>

<div class="label help-row">
  <p class="bold">Features</p>
</div>

<div class="all-features feature-box">
  {#each featuresToShow as feature (feature)}
    <div animate:flip={{ duration: 300 }}>
      <FeatureRow
        feature={$dataset.features[feature]}
        {canAddFeatures}
        isSelected={false}
        relevance={0}
        on:dragstart={(e) => startHandler(e, feature)}
        on:dragend={endHandler}
      />
    </div>
  {/each}
</div>

<style>
  .feature-box {
    background-color: white;
    border: 1px solid white;
    border-radius: 5px;
    padding: 5px 0px;
  }

  .all-features {
    overflow-y: auto;
  }

  .instruction {
    padding-left: 1em;
  }

  .place-holder {
    margin-bottom: 3px;
    font-size: 0.875em;
  }

  .help-row {
    display: flex;
    align-items: center;
  }

  .hidden {
    visibility: hidden;
  }

  .icon-tabler-sort-ascending-letters:hover,
  .icon-tabler-sort-ascending-numbers:hover,
  .icon-tabler-sort-descending-numbers:hover {
    color: var(--blue);
    cursor: pointer;
  }

  .icon-tabler + .icon-tabler {
    margin-left: 0.25em;
  }

  /* dragging */

  .dragInProgress {
    border: 1px solid black;
  }
</style>