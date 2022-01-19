<!---
References:
https://svelte.dev/repl/810b0f1e16ac4bbd8af8ba25d5e0deff?version=3.4.2
https://svelte.dev/repl/adf5a97b91164c239cc1e6d0c76c2abe?version=3.14.1
-->

<script lang="ts">
  import FeatureSuggesterWorker from 'web-worker:../../FeatureSuggesterWorker';
  import QuestionBox from '../QuestionBox.svelte';
  import FeatureRow from './FeatureRow.svelte';
  import FeatureEditor from './FeatureEditor.svelte';
  import { dataset, metadata, selectedFeatures, logs } from '../../stores.js';
  import * as d3 from 'd3';
  import { flip } from "svelte/animate";

  // @ts-ignore
  // defined in rollup.config.js
  const ratingsEnabled: boolean = RATINGS_ENABLED;

  let features: string[] = [];
  $: if ($metadata !== null) {
    // sort by alphabetical order
    features = $metadata.featureNames.slice().sort((a, b) => a.localeCompare(b));
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

  const defaultCriterion = ratingsEnabled ? criteria[0].options[0] : criteria[0].options[1];
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

  const maxFeatures: number = 4;
  $: canAddFeatures = $selectedFeatures.length < maxFeatures;

  // web worker for feature suggestions

  let workersInProgress: number = 0;

  const incrementWorkersInProgress = () => workersInProgress++;

  let featureToRelevance: Map<string, number> = new Map();

  const worker = new FeatureSuggesterWorker();

  worker.onmessage = (e: MessageEvent) => {
    featureToRelevance = e.data;
    workersInProgress--;
    logs.add({event: 'worker-done'});
  }

  $: if ($dataset && $metadata !== null && canAddFeatures) {
    // we don't want to have an explicit dependency on workersInProgress, otherwise
    // this will re-run every time workersInProgress is decremented above
    incrementWorkersInProgress();
    worker.postMessage({
      criterion: criterion.value,
      selected: $selectedFeatures,
      metadata: $metadata,
      dataset: $dataset
    });
    logs.add({event: 'worker-start'});
  }

  // drag and drop

  let dragInProgress: boolean = false;
  let draggingOverFeature: string = null;

  function dropHandler(event: DragEvent, i: number) {
    const item = JSON.parse(event.dataTransfer.getData("text"));

    /* make sure that a feature is being dragged in */
    if (!features.includes(item.id)) {
      return;
    }

    const filtered = $selectedFeatures.filter(d => d !== item.id);

    if (filtered.length === $selectedFeatures.length) {
      logs.add({
        event: 'feature-add',
        feature: item.id,
        selected: $selectedFeatures,
        criterion: criterion.value,
        rank: featuresSortedByRatingDescending.indexOf(item.id) + 1,
        choices: features.length - $selectedFeatures.length,
        workersInProgress,
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

  function startHandler(event: DragEvent, feature: string) {
    dragInProgress = true;
    const item = {id: feature};
    event.dataTransfer.setData("text", JSON.stringify(item));
  }

  function endHandler() {
    dragInProgress = false;
    draggingOverFeature = null;
  }

  // adding and removing features

  function plusClickHandler(feature: string) {
    if (!$selectedFeatures.includes(feature)) {
      logs.add({
        event: 'feature-add',
        feature,
        selected: $selectedFeatures,
        criterion: criterion.value,
        rank: featuresSortedByRatingDescending.indexOf(feature) + 1,
        choices: features.length - $selectedFeatures.length,
        workersInProgress,
      });

      $selectedFeatures = [...$selectedFeatures, feature];
    }
  }

  function trashClickHandler(feature: string) {
    logs.add({
      event: 'feature-remove',
      feature,
      selected: $selectedFeatures
    });

    $selectedFeatures = $selectedFeatures.filter(d => d !== feature);
  }

  // sorting features

  type Order = 'alpha' | 'rating-ascending' | 'rating-descending';

  let sortBy: Order = 'alpha';

  $: if (criterion.value === 'none') {
    sortBy = 'alpha';
  }

  // should this go in worker.onmessage?
  $: featuresSortedByRatingDescending = features
      .slice()
      .sort((a, b) =>
        d3.descending(
          // features already added should appear last
          featureToRelevance.has(a) ? featureToRelevance.get(a) : -1,
          featureToRelevance.has(b) ? featureToRelevance.get(b) : -1
        )
      );

  $: featuresSortedByRatingAscending = features
      .slice()
      .sort((a, b) =>
        d3.ascending(
          // features already added should appear last
          featureToRelevance.has(a) ? featureToRelevance.get(a) : 2,
          featureToRelevance.has(b) ? featureToRelevance.get(b) : 2
        )
      );

  let sortingOrders: Record<Order, string[]>;
  $: sortingOrders  = {
    'alpha': features,
    'rating-ascending': featuresSortedByRatingAscending,
    'rating-descending': featuresSortedByRatingDescending,
  };

  $: featuresToShow = sortingOrders[sortBy];

  // editing features

  let showFeatureEditor: boolean = false;
  let featureToEdit: string = null;

  function onFeatureEdit(feature: string) {
    featureToEdit = feature;
    showFeatureEditor = true;

    logs.add({
      event: 'feature-edit',
      phase: 'open',
      feature: $metadata.features[feature]
    });
  }
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

{#if ratingsEnabled}
  <div class="label help-row">
    <p class="bold">Rating Metric</p>
    <QuestionBox>
      Choose the metric that is used to guide which features to explore.
      The length of the bar behind a feature encodes the metric's rating for
      that feature.

      <ul>
        <li>
          <b>Purity</b> gives higher rating to features that result in the
          subsets with lower weighted average entropy.
        </li>
        <li>
          <b>Error deviation</b> gives higher rating to features that lead to subsets
          with higher standard deviation of percent error.
        </li>
        <li>
          <b>Error count</b> and <b>Error percent</b> give higher
          ratings to features that lead to subsets with higher
          max number or percent of errors, respectively.
        </li>
      </ul>
    </QuestionBox>
  </div>

  <div>
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={criterion} on:change={criterionChanged}>
      {#each criteria.filter(d => (hasPredictions || !d.requiresPredictions)) as group}
        <optgroup label={group.title}>
          {#each group.options.filter(d => (hasPredictions || !d.requiresPredictions)) as opt}
            <option value={opt}>{opt.display}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
  </div>
{/if}

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
      {feature}
      {canAddFeatures}
      isSelected={true}
      draggingOver={draggingOverFeature === feature}
      on:drop={e => dropHandler(e, i)}
      on:dragstart={(e) => startHandler(e, feature)}
      on:dragend={endHandler}
      on:dragenter={() => draggingOverFeature = feature}
      on:dragleave={() => draggingOverFeature = null}
      on:remove={() => trashClickHandler(feature)}
      on:edit={() => onFeatureEdit(feature)}
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
  <QuestionBox>
    Click the edit icon that appears when you hover
    over a feature to change how that feature is split.
  </QuestionBox>
  <div class="gap"></div>
  {#if featureToRelevance.size}
    <!-- sort icons -->

    <!-- alphabetical -->
    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-sort-ascending-letters"
      width="44"
      height="44"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      on:click={() => sortBy = 'alpha'}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M15 10v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4" />
      <path d="M19 21h-4l4 -7h-4" />
      <path d="M4 15l3 3l3 -3" />
      <path d="M7 6v12" />
    </svg>

    <!-- rating-ascending -->
    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-sort-ascending-numbers"
      width="44"
      height="44"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      on:click={() => sortBy = 'rating-ascending'}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M4 15l3 3l3 -3" />
      <path d="M7 6v12" />
      <path d="M17 3a2 2 0 0 1 2 2v3a2 2 0 1 1 -4 0v-3a2 2 0 0 1 2 -2z" />
      <circle cx="17" cy="16" r="2" />
      <path d="M19 16v3a2 2 0 0 1 -2 2h-1.5" />
    </svg>

    <!-- rating-descending -->
    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-sort-descending-numbers"
      width="44"
      height="44"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      on:click={() => sortBy = 'rating-descending'}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M4 15l3 3l3 -3" />
      <path d="M7 6v12" />
      <path d="M17 14a2 2 0 0 1 2 2v3a2 2 0 1 1 -4 0v-3a2 2 0 0 1 2 -2z" />
      <circle cx="17" cy="5" r="2" />
      <path d="M19 5v3a2 2 0 0 1 -2 2h-1.5" />
    </svg>
  {/if}
</div>

<div class="all-features feature-box">
  {#each featuresToShow as feature  (feature)}
    <div animate:flip={{ duration: 300 }}>
      <FeatureRow
        {feature}
        {canAddFeatures}
        isSelected={false}
        relevance={featureToRelevance.get(feature) ?? 0}
        on:dragstart={(e) => startHandler(e, feature)}
        on:dragend={endHandler}
        on:add={() => plusClickHandler(feature)}
        on:edit={() => onFeatureEdit(feature)}
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
  }

  .icon-tabler + .icon-tabler {
    margin-left: 0.25em;
  }

  /* dragging */

  .dragInProgress {
    border: 1px solid black;
  }
</style>