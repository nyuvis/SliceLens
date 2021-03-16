<!---
References:
https://svelte.dev/repl/810b0f1e16ac4bbd8af8ba25d5e0deff?version=3.4.2
https://svelte.dev/repl/adf5a97b91164c239cc1e6d0c76c2abe?version=3.14.1
-->

<script>
  import FeatureSuggesterWorker from 'web-worker:../../FeatureSuggesterWorker';
  import QuestionBox from '../QuestionBox.svelte';
  import FeatureRow from './FeatureRow.svelte';
  import FeatureEditor from './FeatureEditor.svelte';
  import { dataset, metadata, selectedFeatures, logs } from '../../stores.js';
  import * as d3 from 'd3';
  import { flip } from "svelte/animate";

  let features = [];
  $: if ($metadata !== null) {
    features = $metadata.featureNames;
  }

  // suggestion criteria

  const criteria = [
    {
      title: 'Ground truth metrics',
      requiresPredictions: false,
      options: [
        { value: 'entropy', display: 'Purity', requiresPredictions: false },
        { value: 'none', display: 'None', requiresPredictions: false },
      ],
    },
    {
      title: 'Prediction metrics',
      requiresPredictions: true,
      options: [
        { value: 'errorDeviation', display: 'Error deviation', requiresPredictions: true },
        { value: 'errorCount', display: 'Error count', requiresPredictions: true },
        { value: 'errorPercent', display: 'Error percent', requiresPredictions: true },
      ],
    },
  ];

  const defaultCriterion = criteria[0].options[0];
  let criterion = defaultCriterion;

  $: hasPredictions = $metadata !== null && $metadata.hasPredictions;
  // reset criterion if predictions are not available,
  // which would happen when changing datasets
  $: if (!hasPredictions && criterion.requiresPredictions) {
    criterion = defaultCriterion;
  }

  function criterionChanged() {
    logs.add({
      event: 'criterion-change',
      criterion: criterion.value,
    });
  }

  const maxFeatures = 4;
  $: canAddFeatures = $selectedFeatures.length < maxFeatures;

  // web worker for feature suggestions

  let featureToRelevance = new Map();

  const worker = new FeatureSuggesterWorker();
  worker.onmessage = e => featureToRelevance = e.data;

  $: if ($dataset && $metadata !== null && canAddFeatures) {
    worker.postMessage({
      criterion: criterion.value,
      selected: $selectedFeatures,
      metadata: $metadata,
      dataset: $dataset
    });
  }

  // drag and drop

  let dragInProgress = false;
  let draggingOverFeature = null;

  function dropHandler(event, i) {
    const item = JSON.parse(event.dataTransfer.getData("text"));
    const filtered = $selectedFeatures.filter(d => d !== item.id);

    if (filtered.length === $selectedFeatures.length) {
      logs.add({
        event: 'feature-add',
        feature: item.id,
        selected: $selectedFeatures,
        criterion: criterion.value,
        rank: featuresSortedByRating.indexOf(item.id) + 1
      });
    } else {
      logs.add({
        event: 'feature-reorder',
        feature: item.id,
        selected: $selectedFeatures
      });
    }

    filtered.splice(i, 0, item.id);
    $selectedFeatures = filtered;
  }

  function startHandler(event) {
    dragInProgress = true;
    const item = {id: event.target.id};
    event.dataTransfer.setData("text", JSON.stringify(item));
  }

  function endHandler() {
    dragInProgress = false;
    draggingOverFeature = null;
  }

  // adding and removing features

  function plusClickHandler(feature) {
    if (!$selectedFeatures.includes(feature)) {
      logs.add({
        event: 'feature-add',
        feature,
        selected: $selectedFeatures,
        criterion: criterion.value,
        rank: featuresSortedByRating.indexOf(feature) + 1
      });

      $selectedFeatures = [...$selectedFeatures, feature];
    }
  }

  function trashClickHandler(feature) {
    logs.add({
      event: 'feature-remove',
      feature,
      selected: $selectedFeatures
    });

    $selectedFeatures = $selectedFeatures.filter(d => d !== feature);
  }

  // sorting features

  let sortByRating = false;

  $: if (criterion.value === 'none') {
    sortByRating = false;
  }

  $: featuresSortedByRating = features
      .slice()
      .sort((a, b) =>
        d3.descending(
          featureToRelevance.get(a) || 0,
          featureToRelevance.get(b) || 0
        )
      );

  $: featuresToShow = sortByRating ? featuresSortedByRating : features;

  // editing features

  let showFeatureEditor = false;
  let featureToEdit = null;

  function onFeatureEdit(feature) {
    featureToEdit = feature;
    showFeatureEditor = true;

    logs.add({
      event: 'feature-edit',
      phase: 'open',
      feature: $metadata.features[feature]
    });
  }

  // tooltips

  const suggestionTooltip = `Choose the metric that is used to
  suggest which feature to explore next. The longer the gray bar underneath
  the feature, the more relevant the feature is according to the metric.
  "Purity" gives higher relevance to features that result in the subsets
  with lower weighted average entropy. "Error deviation" gives higher relevance
  to features that lead to subsets with higher standard deviation of percent error.
  "Error count" and "Error percent" give higher relevance to features that lead
  to subsets with higher max number or percent of errors, respectively.`;

  const selectFeatureTooltip = `You can select features by dragging
  and dropping from below or by clicking on the plus icon that appears
  when you hover over the name of a feature. You can reorder selected
  features by dragging and dropping. You can select at most four features.`;

  const featureTooltip = `Click the edit icon that appears when you hover
  over a feature to change how that feature is split.`;
</script>

{#if showFeatureEditor}
  <FeatureEditor
    featureName={featureToEdit}
    on:close={() => {
      showFeatureEditor = false;
      featureToEdit = null;
    }}
  />
{/if}

<div class="label help-row">
  <p class="bold">Suggestion Criteria</p>
  <QuestionBox text={suggestionTooltip}/>
</div>

<div>
  <select bind:value={criterion} on:blur={criterionChanged}>
    {#each criteria.filter(d => (hasPredictions || !d.requiresPredictions)) as group}
      <optgroup label={group.title}>
        {#each group.options.filter(d => (hasPredictions || !d.requiresPredictions)) as opt}
          <option value={opt}>{opt.display}</option>
        {/each}
      </optgroup>
    {/each}
  </select>
</div>

<div class="label help-row">
  <p class="bold">Selected</p>
  <QuestionBox text={selectFeatureTooltip}/>
</div>

<div id="selected-features" class="feature-box" class:dragInProgress>
  {#each $selectedFeatures as feature, i (feature)}
    <FeatureRow
      {feature}
      {canAddFeatures}
      isSelected={true}
      draggingOver={draggingOverFeature === feature}
      on:drop={e => dropHandler(e, i)}
      on:dragstart={startHandler}
      on:dragend={endHandler}
      on:dragenter={() => draggingOverFeature = feature}
      on:dragleave={() => draggingOverFeature = null}
      on:remove={() => trashClickHandler(feature)}
      on:edit={() => onFeatureEdit(feature)}
    />
  {/each}
  {#if canAddFeatures}
    <div class="place-holder"
      ondragover="return false"
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
  <QuestionBox text={featureTooltip}/>
  <div class="gap"></div>
  {#if featureToRelevance.size}
    <!-- sort icon -->
    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-arrows-sort"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      on:click={() => sortByRating = !sortByRating}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M3 9l4 -4l4 4m-4 -4v14"></path>
      <path d="M21 15l-4 4l-4 -4m4 4v-14"></path>
    </svg>
  {/if}
</div>

<div class="all-features">
  <div class="feature-box">
    {#each featuresToShow as feature  (feature)}
      <div animate:flip={{ duration: 300 }}>
        <FeatureRow
          {feature}
          {canAddFeatures}
          isSelected={false}
          relevance={featureToRelevance.get(feature) || 0}
          on:dragstart={startHandler}
          on:dragend={endHandler}
          on:add={() => plusClickHandler(feature)}
          on:edit={() => onFeatureEdit(feature)}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .feature-box {
    background-color: white;
    border: 1px solid white;
    border-radius: 5px;
    padding: 5px 0px;
  }

  .all-features {
    border-radius: 5px;
    flex: 1 1 1px;
    overflow-y: scroll;
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

  .icon-tabler-arrows-sort:hover {
    color: rgb(0, 99, 206);;
  }

  /* dragging */

  .dragInProgress {
    border: 1px solid black;
  }
</style>