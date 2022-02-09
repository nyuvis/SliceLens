<script lang="ts">
  import FeatureComboWorker from 'web-worker:../../FeatureComboWorker';
  import QuestionBox from '../QuestionBox.svelte';
  import { selectedFeatures, features, dataset, changeSinceGeneratingSuggestion } from '../../stores'

  const worker = new FeatureComboWorker();

  export let criterion;

  let combos: string[][] = [];
  let index: number = 0;

  let currentDataset = $dataset.name;

  // when switching to a new dataset, reset the suggestions
  $: if(currentDataset !== $dataset.name) {
    combos = [];
    index = 0;
    currentDataset = $dataset.name;
  }

  worker.onmessage = (e: MessageEvent) => {
    combos = Array.isArray(e.data) ? e.data : [];
    index = 0;

    if (combos.length > 0) {
      selectedFeatures.put(combos[index]);
    }

    $changeSinceGeneratingSuggestion = false;
  }

  function getSuggestedCombos() {
    worker.postMessage({
      criterion: criterion.value,
      selected: $selectedFeatures,
      features: $features,
      dataset: $dataset
    });
  }

  function increment() {
    if (index < combos.length - 1) {
      index++;
    }

    selectedFeatures.put(combos[index]);
  }

  function decrement() {
    if (index > 0) {
      index--;
    }

    selectedFeatures.put(combos[index]);
  }

  function onkeydown(ev) {
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
  <div id='button-row' class='sub-label'>
    <button on:click={getSuggestedCombos}>Suggest Combos</button>
    {#if $changeSinceGeneratingSuggestion}
      <QuestionBox kind="alert">
        You may have modified the filters, features, or rating metric since generating these suggestions.
      </QuestionBox>
    {/if}
  </div>

  {#if combos.length !== 0}
    <div id='arrows-row' on:keydown={onkeydown} tabindex="0">
      <!-- left arrow -->
      <svg xmlns="http://www.w3.org/2000/svg"
        class="icon icon-tabler icon-tabler-arrow-left"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor" fill="none"
        stroke-linecap="round" stroke-linejoin="round"
        on:click={decrement}
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
</style>