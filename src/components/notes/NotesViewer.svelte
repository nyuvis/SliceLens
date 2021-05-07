<script>
  import { createEventDispatcher } from 'svelte';
  import { selectedFeatures, metadata, filters, fullDataset, dataset } from '../../stores.js';
  import { cloneSelectedFeaturesMetadata, addSelectedSetToFilters, cloneFilters, getMetadata, getFilteredDataset } from '../../DataTransformer.js';
  import marked from 'marked';
  import DOMPurify from 'dompurify';

  export let note = null;
  export let edit = false;

  const dispatch = createEventDispatcher();

  function gotoState() {
    const selected = [...note.state.selectedFeatures];
    const filts = addSelectedSetToFilters(cloneFilters(note.state.filters));
    const features = cloneSelectedFeaturesMetadata(note.state.selectedFeaturesMetadata, selected);

    if(filts.length === 0 && $filters.length === 0) {
      $metadata.features = Object.assign($metadata.features, features);
      $metadata = $metadata;
    } else {
      const data = getFilteredDataset($fullDataset, filts);
      const md = getMetadata(data);
      md.features = Object.assign(md.features, features)
      $dataset = data;
      $metadata = md;
    }

    $selectedFeatures = selected;
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
      {@html DOMPurify.sanitize(marked(note.body))}
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