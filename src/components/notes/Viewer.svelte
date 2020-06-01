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
      <input class="control-label" type="text" minlength="1" required bind:value={note.title}>
    {:else}
      <p class="control-label">{note.title}</p>
    {/if}

    <div class="gap"></div>

    <div class="control-label">
      {#if edit}
        <!-- eye icon -->
        <svg xmlns="http://www.w3.org/2000/svg"
          class="icon icon-tabler icon-tabler-eye"
          width="24" height="24" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor"
          fill="none" stroke-linecap="round"
          stroke-linejoin="round"
          on:click={() => dispatch('save')}
        >
          <path stroke="none" d="M0 0h24v24H0z"/>
          <circle cx="12" cy="12" r="2" />
          <path d="M2 12l1.5 2a11 11 0 0 0 17 0l1.5 -2" />
          <path d="M2 12l1.5 -2a11 11 0 0 1 17 0l1.5 2" />
        </svg>
      {:else}
        <!-- edit icon -->
        <svg xmlns="http://www.w3.org/2000/svg"
          class="icon icon-tabler icon-tabler-edit"
          width="24" height="24" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor"
          fill="none" stroke-linecap="round"
          stroke-linejoin="round"
          on:click={() => dispatch('edit')}
        >
          <path stroke="none" d="M0 0h24v24H0z"/>
          <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
          <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
          <line x1="16" y1="5" x2="19" y2="8" />
        </svg>
      {/if}
      <!-- trash can icon -->
      <svg xmlns="http://www.w3.org/2000/svg"
        class="icon icon-tabler icon-tabler-trash"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor" fill="none"
        stroke-linecap="round" stroke-linejoin="round"
        on:click={() => {
          dispatch('delete');
        }}
      >
        <path stroke="none" d="M0 0h24v24H0z"/>
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
      </svg>
      <!-- x icon -->
      <svg xmlns="http://www.w3.org/2000/svg"
        class="icon icon-tabler icon-tabler-x"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor"
        fill="none" stroke-linecap="round"
        stroke-linejoin="round"
        on:click={() => dispatch('close')}
      >
        <path stroke="none" d="M0 0h24v24H0z"/>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </div>
  </div>

  {#if edit}
    <label class="sub-control-label">
      <input type="checkbox" bind:checked={note.linked}> Link note to current state
    </label>
  {:else}
    {#if note.linked}
      <button class="sub-control-label" on:click={gotoState}>Go to state</button>
    {/if}
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

  button {
    align-self: flex-start;
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

  .gap {
    flex-grow: 1;
  }

  .icon-tabler {
    width: 1em;
    height: 1em;
    display: inline-block;
    cursor: pointer;
  }

  .icon-tabler-edit:hover, .icon-tabler-eye:hover {
    color: steelblue;
  }

  .icon-tabler-x:hover, .icon-tabler-trash:hover {
    color: red;
  }
</style>