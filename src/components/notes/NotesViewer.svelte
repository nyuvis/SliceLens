<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { selectedFeatures, features, filters, fullDataset, dataset } from '../../stores';
  import { cloneSelectedFeatures, getFeatures } from '../../lib/Features';
  import { addSelectedSetToFilters, cloneFilters, getFilteredDataset } from '../../lib/Filters';
  import { marked } from 'marked';
  import { sanitize } from 'dompurify';
  import type { Dataset, Filter, Features, Note } from '../../types';

  export let note: Note = null;
  export let edit: boolean = false;

  const dispatch = createEventDispatcher();

  function gotoState() {
    const selected: string[] = [...note.state.selectedFeatures];
    const filts: Filter[] = addSelectedSetToFilters(cloneFilters(note.state.filters));
    const copiedFeatures: Features = cloneSelectedFeatures(note.state.selectedFeaturesInfo, selected);

    if(filts.length === 0 && $filters.length === 0) {
      // overwrite selected features
      $features = Object.assign($features, copiedFeatures);
    } else {
      const data: Dataset = getFilteredDataset($fullDataset, filts);
      const allFeatures: Features = getFeatures(data);
      $dataset = data;
      // overwrite selected features
      $features = Object.assign(allFeatures, copiedFeatures);
    }

    selectedFeatures.put(selected);
    $filters = filts;
  }
</script>

{#if note !== null}
  <div class="header sub-label">
    {#if edit}
      <button class="small" on:click={() => dispatch('link')}>Link to state</button>
    {:else}
      <button class="small" on:click={gotoState}>Go to state</button>
    {/if}

    <div class="gap"></div>

    {#if edit}
      <button class="small" on:click={() => dispatch('view')}>View</button>
    {:else}
      <button class="small" on:click={() => dispatch('edit')}>Edit</button>
    {/if}

    <button class="small" on:click={() => dispatch('delete')}>Delete</button>

    <button class="small" on:click={() => dispatch('close')}>Close</button>
  </div>

  {#if edit}
    <input class="title bold" type="text" minlength="1" required bind:value={note.title}>
  {:else}
    <p class="title bold hyphen">{note.title}</p>
  {/if}

  {#if edit}
    <textarea
      rows="10"
      class="content small"
      bind:value={note.body}
      placeholder="This text area supports markdown."
    ></textarea>
  {:else}
    <div class="viewer content small hyphen">
      {@html sanitize(marked(note.body))}
    </div>
  {/if}
{/if}

<style>
  textarea {
    resize: none;
    margin: 0;
    border: none;
    font-family: 'Fira Sans';
    padding: 5px;
    max-height: 100%;
    height: 100%;
  }

  input[type=text] {
    border: none;
    height: 20px;
    padding: 0;
    font-size: 1em;
    font-family: 'Fira Sans';
  }

  .title {
    margin-left: 0;
    margin-bottom: 0.25em;
  }

  .header {
    display: flex;
    margin-top: 1em;
    flex: 0 0 auto;
  }

  .viewer {
    padding: 5px;
    background: white;
    border-radius: 5px;
    overflow-y: auto;
  }

  .viewer :global(:first-child) {
    margin-top: 0;
  }

  .viewer :global(p) {
    margin: 1em 0 0 0;
  }

  .viewer :global(strong) {
    font-weight: 500;
  }

  .viewer :global(code) {
    font-family: 'Fira Mono', monospace;
  }
</style>