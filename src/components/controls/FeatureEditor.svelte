<!---
References:
https://www.w3schools.com/howto/howto_css_modals.asp
-->

<script>
  import CategoricalFeature from "./CategoricalFeature.svelte";
  import QuantitativeFeature from "./QuantitativeFeature.svelte";
  import { metadata } from "../../stores.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let featureName;
  $: feature = $metadata.features[featureName];

  let valid = true;
  $: canClose = valid || feature.type === 'C';

  let categoricalComponent;
  let quantitativeComponent;

  function onWindowClose() {
    if (!canClose) {
      return;
    }

    if (categoricalComponent) {
      categoricalComponent.onWindowClose();
    } else if (quantitativeComponent) {
      quantitativeComponent.onWindowClose();
    }

    $metadata = $metadata;
    dispatch("close");
  }

  function onkeydown(ev) {
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
      <CategoricalFeature
        {feature}
        bind:this={categoricalComponent} />
    {:else}
      <QuantitativeFeature
        {feature}
        on:validate={ev => valid = ev.detail}
        bind:this={quantitativeComponent} />
    {/if}
  </div>
</div>

<style>
  .modal-background {
    position: fixed;
    z-index: 1;
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

    max-width: 80%;
    max-height: 80%;

    border-radius: 5px;

    padding: 1rem;

    display: flex;
    flex-direction: column;
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
    color: red;
  }
</style>
