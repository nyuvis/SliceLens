<!---
References:
https://svelte.dev/repl/810b0f1e16ac4bbd8af8ba25d5e0deff?version=3.4.2
https://svelte.dev/repl/adf5a97b91164c239cc1e6d0c76c2abe?version=3.14.1
-->

<script>
  import FeatureSuggesterWorker from 'web-worker:../FeatureSuggesterWorker';
  import { dataset, metadata, selectedFeatures } from '../stores.js';
  import { get } from 'svelte/store';

  let features = [];
  $: if ($metadata !== null) {
    features = $metadata.featureNames;
  }

  let criterion = 'purity';
  const criteriaRequiringPredictions = new Set(['errorCount', 'errorPercent']);

  $: hasPredictions = $metadata !== null && $metadata.hasPredictions;
  // reset criterion if predictions are not available,
  // which would happen when changing datasets
  $: if (!hasPredictions && criteriaRequiringPredictions.has(criterion)) {
    criterion = 'purity';
  }

  $: criteria = [
    { value: 'purity', display: 'Purity' },
    { value: 'errorCount', display: 'Error Count' },
    { value: 'errorPercent', display: 'Error Percent' },
    { value: 'none', display: 'None' },
  ].filter(d => (!criteriaRequiringPredictions.has(d.value) || hasPredictions));

  let suggestion = '';

  const worker = new FeatureSuggesterWorker();
  worker.onmessage = e => suggestion = e.data;

  $: if ($dataset && $metadata !== null) {
    worker.postMessage({
      criterion,
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
</script>

<p class="label bold">Suggestion Criteria</p>
<div>
  <select bind:value={criterion}>
    {#each criteria as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>
</div>

<p class="label bold">Selected</p>
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
      <p class="feature-name">{feature}</p>
    </div>
  {/each}
  <div class="placeHolder"
    ondragover="return false"
    on:drop|preventDefault={e => dropHandler(e, $selectedFeatures.length)}
  >
    {#if $selectedFeatures.length === 0}
      <div class="instruction">
        <p>Add features from below.</p>
      </div>
    {/if}
  </div>
</div>

<p class="label bold">Features</p>
<div class="all-features">
  <div class="feature-box">
    {#each features as feature, i  (feature)}
      <div class="feature all"
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

        <p class="feature-name">
          {feature}
        </p>
        {#if feature === suggestion}
          <p>
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
          </p>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .feature-box {
    background-color: white;
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
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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

  .feature p, .instruction p {
    margin: 0;
    padding: 0;
    pointer-events: none;
  }

  .instruction {
    padding-left: 1em;
    margin-bottom: 3px;
    font-size: 0.875em;
  }

  .placeHolder {
    height: 1.5em;
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

  .icon-tabler {
    width: 1em;
    height: 1em;
    vertical-align: top;
  }

  .icon-tabler-trash, .icon-tabler-plus {
    visibility: hidden;
    cursor: pointer;
  }

  .selected:hover .icon-tabler-trash, .all:hover .icon-tabler-plus {
    visibility: visible;
    color: black;
  }

  .selected:hover .icon-tabler-trash:hover {
    color: red;
  }

  .all:hover .icon-tabler-plus:hover {
    color: green;
  }
</style>