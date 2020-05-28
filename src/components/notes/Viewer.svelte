<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let note = null;
  export let edit = false;
</script>

{#if note !== null}
  <div class="header">
    <p class="control-label">{note.title}</p>
    <div class="gap"></div>
    <div class="control-label">
      <!-- edit icon -->
      <svg xmlns="http://www.w3.org/2000/svg"
        class="icon icon-tabler icon-tabler-edit"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor"
        fill="none" stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z"/>
        <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
        <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
        <line x1="16" y1="5" x2="19" y2="8" />
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
  <div class="viewer">
    {note.body}
  </div>
{/if}

<style>
  .viewer {
    border-radius: 5px;
    padding: 5px;
    background: white;
    font-size: 14px;
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

  .icon-tabler-edit:hover {
    color: steelblue;
  }

  .icon-tabler-x:hover {
    color: red;
  }
</style>