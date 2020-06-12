<script>
  import { createEventDispatcher } from 'svelte';
  import { selectedFeatures, splitType, numberOfSplits } from '../../stores.js';
  import marked from 'marked';
  import DOMPurify from 'dompurify';

  const dispatch = createEventDispatcher();

  export let note = null;
  export let edit = false;

  function gotoState() {
    $selectedFeatures = note.state.selectedFeatures;
    $splitType = note.state.splitType;
    $numberOfSplits = note.state.numberOfSplits;
  }
</script>

{#if note !== null}
  <div class="header">
    {#if edit}
      {#if note.linked}
        <p class="link small" on:click={() => note.linked = false}>Unlink from current state</p>
      {:else}
        <p class="link small" on:click={() => note.linked = true}>Link to current state</p>
      {/if}
    {:else}
      {#if note.linked}
        <p class="link small" on:click={gotoState}>Go to state</p>
      {/if}
    {/if}

    <div class="gap"></div>

    {#if edit}
      <p class="link small" on:click={() => dispatch('save')}>View</p>
    {:else}
      <p class="link small" on:click={() => dispatch('edit')}>Edit</p>
    {/if}

    <p class="link small" on:click={() => dispatch('delete')}>Delete</p>

    <p class="link small" on:click={() => dispatch('close')}>Close</p>
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
    <div class="content-container">
      <div class="viewer content small hyphen">
        {@html DOMPurify.sanitize(marked(note.body))}
      </div>
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
    margin-bottom: 0.25em;
  }

  .header {
    display: flex;
    margin-top: 1em;
  }

  .header > p {
    padding-right: 7px;
  }

  .content-container {
    flex: 1 1 1px;
    overflow-y: scroll;
    border-radius: 5px;
  }

  .viewer {
    padding: 5px;
    background: white;
    border-radius: 5px;
  }

  .viewer :global(:first-child) {
    margin-top: 0;
  }

  .viewer :global(p) {
    margin: 1em 0;
  }

  .viewer :global(strong) {
    font-weight: 500;
  }

  .viewer :global(code) {
    font-family: 'Fira Mono', monospace;
  }
</style>