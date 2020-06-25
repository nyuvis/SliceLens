<!---
References:
https://www.w3schools.com/howto/howto_css_modals.asp
-->

<script>
  import CategoricalFeature from "./CategoricalFeature.svelte";
  import { dataset, metadata } from "../../stores.js";
  import { onMount, createEventDispatcher } from "svelte";
  import { flip } from "svelte/animate";

  import * as d3_array from "d3-array";
  import * as d3_all from "d3";

  const d3 = { ...d3_all, ...d3_array };

  const dispatch = createEventDispatcher();

  export let featureName;
  const feature = $metadata.features[featureName];

  const groupToValues = d3.rollup(
    Array.from(feature.valueToGroup)
      .map(([value, group]) => ({value, group})),
    v => new Set(v.map(d => d.value)),
    d => d.group
  );

  let groups = feature.values.map((d, i) => ({
    name: d,
    values: groupToValues.get(d),
    id: i
  }));

  function onWindowClose() {
    feature.valueToGroup = new Map(
      Array.from(groupToValues, ([group, values]) =>
        [...values].map(v => [v, group])
      ).flat()
    );

    feature.values = groups.map(d => d.name);

    metadata.set($metadata);

    dispatch("close");
  }

</script>

<div class="modal-background">
  <div class="modal-content">
    <div class="header">
      <div class="feature-name large bold">{featureName}</div>

      <div class="gap" />

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
    </div>

    {#if feature.type === 'C'}
      <CategoricalFeature {groups} />
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
