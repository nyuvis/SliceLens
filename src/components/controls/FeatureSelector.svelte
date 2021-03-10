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
  import { dataset, metadata, selectedFeatures } from '../../stores.js';

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
    <FeatureRow
      {feature}
      {suggestion}
      {canAddFeatures}
      isSelected={true}
      draggingOver={draggingOverFeature === feature}
      on:drop={e => dropHandler(e, i)}
      on:dragstart={startHandler}
      on:dragend={endHandler}
      on:dragenter={() => draggingOverFeature = feature}
      on:dragleave={() => draggingOverFeature = null}
      on:remove={() => trashClickHandler(feature)}
      on:edit={() => {
        featureToEdit = feature;
        showFeatureEditor = true;
      }}
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
</div>
<div class="all-features">
  <div class="feature-box">
    {#each features as feature, i  (feature)}
      <FeatureRow
        {feature}
        {suggestion}
        {canAddFeatures}
        isSelected={false}
        draggingOver={draggingOverFeature === feature}
        on:dragstart={startHandler}
        on:dragend={endHandler}
        on:add={() => plusClickHandler(feature)}
        on:edit={() => {
          featureToEdit = feature;
          showFeatureEditor = true;
        }}
      />
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

  /* dragging */

  .dragInProgress {
    border: 1px solid black;
  }
</style>