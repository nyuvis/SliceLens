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
        <p class="link" on:click={() => note.linked = false}>Unlink from current state</p>
      {:else}
        <p class="link" on:click={() => note.linked = true}>Link to current state</p>
      {/if}
    {:else}
      {#if note.linked}
        <p class="link" on:click={gotoState}>Go to state</p>
      {/if}
    {/if}

    <div class="gap"></div>

    {#if edit}
      <p class="link" on:click={() => dispatch('save')}>View</p>
    {:else}
      <p class="link" on:click={() => dispatch('edit')}>Edit</p>
    {/if}

    <p class="link" on:click={() => dispatch('delete')}>Delete</p>

    <p class="link" on:click={() => dispatch('close')}>Close</p>
  </div>

  {#if edit}
    <input class="label" type="text" minlength="1" required bind:value={note.title}>
  {:else}
    <p class="label">{note.title}</p>
  {/if}

  {#if edit}
    <textarea
      rows="5"
      class="viewer"
      bind:value={note.body}
      placeholder="This text area supports markdown."
    ></textarea>
  {:else}
    <div class="viewer">
      {@html DOMPurify.sanitize(marked(note.body))}
    </div>
  {/if}
{/if}

<style>
  textarea {
    resize: vertical;
    margin: 0;
    border: none;
  }

  input[type=text] {
    border: none;
    border-radius: 5px;
    font-size: 16px;
    height: 20px;
    padding: 0;
    font-family: monospace;
  }

  .viewer {
    border-radius: 5px;
    padding: 5px;
    background: white;
    font-size: 14px;
  }

  .viewer :global(p) {
    margin-top: 0;
  }

  .header {
    display: flex;
  }

  .header > p {
    padding-right: 7px;
  }
</style>