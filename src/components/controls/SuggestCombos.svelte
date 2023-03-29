<script lang="ts">
  import FeatureComboWorker from 'web-worker:../../FeatureComboWorker';
  import QuestionBox from '../QuestionBox.svelte';
  import { selectedFeatures, features, dataset, changeSinceGeneratingSuggestion } from '../../stores'
  import { createEventDispatcher } from 'svelte';
  import type { MetricInfo } from '../../RatingMetrics';

  const worker = new FeatureComboWorker();

  export let criterion: MetricInfo;
  export let canAddFeatures: boolean;
  export let minSubsetSize: number;

  const dispatch = createEventDispatcher();

  let previouslySelected: string[] = [];

  let combos: string[][] = [];
  let index: number = 0;

  let numFeaturesToConsider = 10;

  // track if the feature suggestion algorithm is running
  let waitingForResults = false;

  let currentDataset = $dataset.name;

  function setFeaturesToHighlight(): void {
    const features = new Set($selectedFeatures.filter(d => !previouslySelected.includes(d)));

    dispatch('set', features);
  }

  function numFeaturesToConsiderChanged() {
    $changeSinceGeneratingSuggestion = true;
  }

  // when switching to a new dataset, reset the suggestions
  $: if(currentDataset !== $dataset.name) {
    combos = [];
    index = 0;
    currentDataset = $dataset.name;
    numFeaturesToConsider = Math.min(10, $dataset.featureNames.length);
    // reset the features to highlight
    dispatch('set', new Set());
  }

  worker.onmessage = (e: MessageEvent) => {
    waitingForResults = false;

    combos = Array.isArray(e.data) ? e.data : [];
    index = 0;

    previouslySelected = [...$selectedFeatures];

    if (combos.length > 0) {
      selectedFeatures.put(combos[index]);
    }

    setFeaturesToHighlight();

    $changeSinceGeneratingSuggestion = false;
  }

  function getSuggestedCombos() {
    waitingForResults = true;

    worker.postMessage({
      criterion: criterion.value,
      selected: $selectedFeatures,
      features: $features,
      dataset: $dataset,
      numFeaturesToConsider: numFeaturesToConsider,
      minSubsetSize: minSubsetSize
    });
  }

  function increment() {
    if (index < combos.length - 1) {
      index++;
      selectedFeatures.put(combos[index]);
      setFeaturesToHighlight();
    }
  }

  function decrement() {
    if (index > 0) {
      index--;
      selectedFeatures.put(combos[index]);
      setFeaturesToHighlight();
    }
  }

  function onkeydown(ev: KeyboardEvent) {
    if (combos.length === 0) {
      return;
    }

    if (ev.key === 'ArrowLeft') {
      decrement();
    } else if (ev.key === 'ArrowRight') {
      increment();
    }
  }
</script>

<div class='small'>
  <div>
    <label style:display="flex">
      <span>Num. features used</span>
      <input
        type=number
        bind:value={numFeaturesToConsider}
        on:change={numFeaturesToConsiderChanged}
        min={1}
        max={$dataset.featureNames.length}
        style:width="4em"
        style:margin-left="auto"
      />
    </label>
  </div>
  <div id='button-row' class='sub-label'>
    <button on:click={getSuggestedCombos} disabled={!canAddFeatures}>Suggest Combos</button>
    {#if $changeSinceGeneratingSuggestion && combos.length !== 0}
      <QuestionBox kind="alert">
        You may have modified the filters, features, or the rating metric or its settings since generating these suggestions.
      </QuestionBox>
    {/if}
  </div>

  {#if waitingForResults}
    <div>Calculating</div>
  {:else if combos.length !== 0}
    <div id='arrows-row' on:keydown={onkeydown} tabindex="0">
      <!-- left arrow -->
      <svg xmlns="http://www.w3.org/2000/svg"
        class="icon icon-tabler icon-tabler-arrow-left"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor" fill="none"
        stroke-linecap="round" stroke-linejoin="round"
        on:click={decrement}
        class:disabled="{index <= 0}"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="5" y1="12" x2="11" y2="18" />
        <line x1="5" y1="12" x2="11" y2="6" />
      </svg>

      <div class="unselectable">{index + 1}/{combos.length}</div>

      <!-- right arrow -->
      <svg xmlns="http://www.w3.org/2000/svg"
        class="icon icon-tabler icon-tabler-arrow-right"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor" fill="none"
        stroke-linecap="round" stroke-linejoin="round"
        on:click={increment}
        class:disabled="{index >= combos.length - 1}"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="13" y1="18" x2="19" y2="12" />
        <line x1="13" y1="6" x2="19" y2="12" />
      </svg>
    </div>
  {/if}
</div>

<style>
  #button-row {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
    display: flex;
    align-items: center;
  }

  #arrows-row {
    display: flex;
    width: max-content;
    align-items: center;
  }

  #arrows-row:focus {
    outline: none;
    background-color: white;
    border-radius: 5px;
  }

  .icon-tabler-arrow-right:hover, .icon-tabler-arrow-left:hover {
    color: var(--blue);
    cursor: pointer;
  }

  .disabled:hover {
    cursor: not-allowed;
    color: var(--dark-gray)
  }
</style>