<!---
References:
https://www.w3schools.com/howto/howto_css_modals.asp
-->

<script lang="ts">
  import CategoricalFeatureEditor from "./CategoricalFeatureEditor.svelte";
  import QuantitativeFeatureEditor from "./QuantitativeFeatureEditor.svelte";
  import { features, logs } from "../../stores";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let featureName: string;
  $: feature = $features[featureName];

  let valid: boolean = true;
  $: canClose = valid || feature.type === 'C';

  let categoricalComponent: CategoricalFeatureEditor;
  let quantitativeComponent: QuantitativeFeatureEditor;

  function onWindowClose() {
    if (!canClose) {
      return;
    }

    if (categoricalComponent) {
      categoricalComponent.onWindowClose();
    } else if (quantitativeComponent) {
      quantitativeComponent.onWindowClose();
    }

    logs.add({ event: 'feature-edit', phase: 'close', feature });

    $features = $features;
    dispatch("close");
  }

  function onkeydown(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      onWindowClose();
    }
  }

</script>

<svelte:window on:keydown={onkeydown}/>

<div class="modal-background">
  <div class="modal-content">
    <div class="header">
      <div class="feature-name large bold">{featureName}</div>

      <div class="gap" />

      {#if canClose}
      <!-- x icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon icon-tabler icon-tabler-x"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          on:click={onWindowClose}>
          <path stroke="none" d="M0 0h24v24H0z" />
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      {/if}
    </div>

    {#if feature.type === 'C'}
      <CategoricalFeatureEditor
        {feature}
        bind:this={categoricalComponent} />
    {:else}
      <QuantitativeFeatureEditor
        {feature}
        on:validate={ev => valid = ev.detail}
        bind:this={quantitativeComponent} />
    {/if}
  </div>
</div>

<style>
  .modal-background {
    position: fixed;
    z-index: 3;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background-color: white;

    max-width: 90%;
    max-height: 90%;

    width: 50em;

    border-radius: 5px;

    padding: 1rem;

    display: flex;
    flex-direction: column;

    overflow-x: auto;
  }

  .header {
    display: flex;
    align-items: center;
  }

  .icon-tabler-x {
    cursor: pointer;
    margin-left: 1em;
  }

  .icon-tabler-x:hover {
    color: var(--red);
  }
</style>
