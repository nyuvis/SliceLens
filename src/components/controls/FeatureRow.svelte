<!---
References:
https://svelte.dev/repl/810b0f1e16ac4bbd8af8ba25d5e0deff?version=3.4.2
https://svelte.dev/repl/adf5a97b91164c239cc1e6d0c76c2abe?version=3.14.1
-->

<script>
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  export let feature;
  export let canAddFeatures;
  export let isSelected;
  export let relevance = 0;
  export let draggingOver = false;
</script>

<div class="feature small"
  class:draggingOver
  class:selected={isSelected}
  class:all={!isSelected}
  class:no-pointer-event="{!canAddFeatures && !isSelected}"
  id={feature}
  draggable=true
  ondragover="return false"
  on:drop|preventDefault
  on:dragstart
  on:dragend
  on:dragenter
  on:dragleave
>
  {#if isSelected}
    <!-- trash can icon -->
    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-trash"
      width="24" height="24" viewBox="0 0 24 24"
      stroke-width="2" stroke="currentColor" fill="none"
      stroke-linecap="round" stroke-linejoin="round"
      on:click={() => dispatch('remove')}
    >
      <path stroke="none" d="M0 0h24v24H0z"/>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    </svg>
  {:else}
    <!-- plus icon -->
    <svg xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-plus"
      width="24" height="24" viewBox="0 0 24 24"
      stroke-width="2" stroke="currentColor" fill="none"
      stroke-linecap="round" stroke-linejoin="round"
      on:click={() => dispatch('add')}
    >
      <path stroke="none" d="M0 0h24v24H0z"/>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  {/if}

  <div class="gap feature-name-container">
    {#if relevance !== 0 && canAddFeatures}
      <div class="bar" style="width: {relevance * 100}%;"></div>
    {/if}
    <p class="cutoff feature-name">{feature}</p>
  </div>

  <!-- edit icon -->
  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit"
    width="24" height="24" viewBox="0 0 24 24"
    stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round"
    on:click={() => dispatch('edit')}
  >
    <path stroke="none" d="M0 0h24v24H0z"/>
    <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
    <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
    <line x1="16" y1="5" x2="19" y2="8" />
  </svg>
</div>


<style>
  .feature {
    display: flex;
    cursor: move;
    /* if features are right next to eachother then
    highlighting drop placement doesn't work */
    margin-bottom: 3px;
    align-items: center;
  }

  .feature:hover {
    font-weight: 500;
  }

  .feature p {
    margin: 0;
    padding: 0;
    pointer-events: none;
  }

  .no-pointer-event {
    pointer-events: none;
  }

  .feature-name-container {
    max-width: 85%;
    position: relative;
    display: flex;
    align-items: center;
  }

  .feature-name {
    position: relative;
    z-index: 2;
  }

  .bar {
    height: 1em;
    position: absolute;
    background-color: #ebebeb;
;
    z-index: 1;
  }

  /* icons */

  .icon-tabler-trash, .icon-tabler-plus, .icon-tabler-edit {
    visibility: hidden;
    cursor: pointer;
  }

  .selected:hover .icon-tabler-edit,
  .selected:hover .icon-tabler-trash,
  .all:hover .icon-tabler-plus,
  .all:hover .icon-tabler-edit {
    visibility: visible;
    color: black;
  }

  .selected:hover .icon-tabler-trash:hover {
    color: red;
  }

  .all:hover .icon-tabler-plus:hover {
    color: rgb(0, 99, 206);;
  }

  .selected:hover .icon-tabler-edit:hover,
  .all:hover .icon-tabler-edit:hover {
    color: rgb(0, 99, 206);
  }
</style>