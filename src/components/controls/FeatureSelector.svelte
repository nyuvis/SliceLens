<!---
References:
https://svelte.dev/repl/810b0f1e16ac4bbd8af8ba25d5e0deff?version=3.4.2
https://svelte.dev/repl/adf5a97b91164c239cc1e6d0c76c2abe?version=3.14.1
-->

<script>
  import FeatureSuggesterWorker from 'web-worker:../../FeatureSuggesterWorker';
  import QuestionBox from '../QuestionBox.svelte';
  import FeatureEditor from './FeatureEditor.svelte';
  import { dataset, metadata, selectedFeatures } from '../../stores.js';
  import { get } from 'svelte/store';

  let features = [];
  $: if ($metadata !== null) {
    features = $metadata.featureNames;
  }

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

  const maxFeatures = 4;
  $: canAddFeatures = $selectedFeatures.length < maxFeatures;

  let suggestion = '';

  const worker = new FeatureSuggesterWorker();
  worker.onmessage = e => suggestion = e.data;

  $: if ($dataset && $metadata !== null && canAddFeatures) {
    worker.postMessage({
      criterion: criterion.value,
      selected: $selectedFeatures,
      metadata: $metadata,
      dataset: $dataset
    });
  }

  let dragInProgress = false;
  let draggingOverFeature = null;

  function dropHandler(event, i) {
    const item = JSON.parse(event.dataTransfer.getData("text"));
    const filtered = $selectedFeatures.filter(d => d !== item.id);
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

  function plusClickHandler(feature) {
    if (!$selectedFeatures.includes(feature)) {
      $selectedFeatures = [...$selectedFeatures, feature];
    }
  }

  function trashClickHandler(feature) {
    $selectedFeatures = $selectedFeatures.filter(d => d !== feature);
  }

  const suggestionTooltip = `Choose the metric that is used to
  suggest which feature to explore next. A lightbulb icon is next to
  the name of the suggested feature. "Purity" suggests the feature
  that results in the subsets with the lowest weighted average entropy.
  "Error deviation" suggests the feature that leads to the subsets with
  highest standard deviation of percent error. "Error count"
  and "Error percent" suggest the feature that leads to the individual
  subset that has the highest number or percent of errors, respectively.`;

  const selectFeatureTooltip = `You can select features by dragging
  and dropping from below or by clicking on the plus icon that appears
  when you hover over the name of a feature. You can reorder selected
  features by dragging and dropping. You can select at most four features.`;

  const featureTooltip = `Click the edit icon that appears when you hover
  over a feature to change how that feature is split.`;

  let showFeatureEditor = false;
  let featureToEdit = null;

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
  <select bind:value={criterion}>
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
    <div class="feature selected"
      id={feature}
      draggable=true
      ondragover="return false"
      on:drop|preventDefault={e => dropHandler(e, i)}
      on:dragstart={startHandler}
      on:dragend={endHandler}
      on:dragenter={() => draggingOverFeature = feature}
      on:dragleave={() => draggingOverFeature = null}
      class:draggingOverFeature={draggingOverFeature === feature}
    >
      <!-- trash can icon -->
      <svg xmlns="http://www.w3.org/2000/svg"
        class="icon icon-tabler icon-tabler-trash"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor" fill="none"
        stroke-linecap="round" stroke-linejoin="round"
        on:click={() => trashClickHandler(feature)}
      >
        <path stroke="none" d="M0 0h24v24H0z"/>
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
      </svg>
      <p class="feature-name cutoff">{feature}</p>

      <div class="gap"></div>

      <!-- edit icon -->
      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor" fill="none"
        stroke-linecap="round" stroke-linejoin="round"
        on:click={() => {
          featureToEdit = feature;
          showFeatureEditor = true;
        }}
      >
        <path stroke="none" d="M0 0h24v24H0z"/>
        <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
        <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
        <line x1="16" y1="5" x2="19" y2="8" />
      </svg>
    </div>
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
</div>
<div class="all-features">
  <div class="feature-box">
    {#each features as feature, i  (feature)}
      <div class="feature all"
        class:no-pointer-event="{!canAddFeatures}"
        id={feature}
        draggable=true
        on:dragstart={startHandler}
        on:dragend={endHandler}
      >
        <!-- plus icon -->
        <svg xmlns="http://www.w3.org/2000/svg"
          class="icon icon-tabler icon-tabler-plus"
          width="24" height="24" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor" fill="none"
          stroke-linecap="round" stroke-linejoin="round"
          on:click={() => plusClickHandler(feature)}
        >
          <path stroke="none" d="M0 0h24v24H0z"/>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>

        <p class="feature-name cutoff">
          {feature}
        </p>
        {#if feature === suggestion && canAddFeatures}
          <!-- light bulb icon -->
          <svg xmlns="http://www.w3.org/2000/svg"
            class="icon icon-tabler icon-tabler-bulb"
            width="24" height="24" viewBox="0 0 24 24"
            stroke-width="2" stroke="currentColor" fill="none"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z"/>
            <path d="M3 12h1M12 3v1M20 12h1M5.6 5.6l.7 .7M18.4 5.6l-.7 .7" />
            <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
            <line x1="9.7" y1="17" x2="14.3" y2="17" />
          </svg>
        {/if}

        <div class="gap"></div>

        <!-- edit icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit"
          width="24" height="24" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor" fill="none"
          stroke-linecap="round" stroke-linejoin="round"
          on:click={() => {
            featureToEdit = feature;
            showFeatureEditor = true;
          }}
        >
          <path stroke="none" d="M0 0h24v24H0z"/>
          <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
          <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
          <line x1="16" y1="5" x2="19" y2="8" />
        </svg>
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

  .feature-name {
    max-width: 85%;
  }

  .feature {
    display: flex;
    cursor: move;
    /* if features are right next to eachother then
    highlighting drop placement doesn't work */
    margin-bottom: 3px;
    font-size: 0.875em;
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

  .no-pointer-event {
    pointer-events: none;
  }

  .hidden {
    visibility: hidden;
  }

  /* dragging */

  .draggingOverFeature {
    font-weight: 500;
  }

  .draggingOverFeature * {
    pointer-events: none;
  }

  .dragInProgress {
    border: 1px solid black;
  }

  /* icons */

  .icon-tabler-trash, .icon-tabler-plus, .icon-tabler-edit {
    visibility: hidden;
    cursor: pointer;
  }

  .selected:hover .icon-tabler-edit,
  .selected:hover .icon-tabler-trash,
  .all:hover .icon-tabler-plus,
  .all:hover .icon-tabler-edit {
    visibility: visible;
    color: black;
  }

  .selected:hover .icon-tabler-trash:hover {
    color: red;
  }

  .all:hover .icon-tabler-plus:hover {
    color: rgb(0, 99, 206);;
  }

  .icon-tabler-bulb {
    color: green;
  }

  .selected:hover .icon-tabler-edit:hover,
  .all:hover .icon-tabler-edit:hover {
    color: rgb(0, 99, 206);
  }
</style>