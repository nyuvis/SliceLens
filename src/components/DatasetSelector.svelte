<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { dataset, selectedFeatures, metadata } from '../stores.js';
  import * as d3 from "d3";

  let selected = 'census';

  const datasets = [
    { value: 'census', display: 'Census' },
    { value: 'heart-disease-with-predictions', display: 'Heart Disease' },
    { value: 'graduate-admissions-binary-with-predictions', display: 'Graduate Admissions' },
  ];

  function load(name) {
    d3.csv(`../datasets/${name}.csv`, d3.autoType).then(data => {
      $selectedFeatures = [];
      $dataset = data;
    });
  }

  function onchange() {
    load(selected);
  }

  onMount(async () => {
    load(selected);
  });

  // whether or not the chart should show predicted values

  let showPredictionsCheckBox = false;
  let predictions = false;

  $: if ($metadata !== null && $metadata.hasPredictions) {
    showPredictionsCheckBox = true;
  } else {
    showPredictionsCheckBox = false;
    predictions = false;
  }

  const dispatch = createEventDispatcher();
  $: dispatch('update', predictions);
</script>

<div>
  <p class="control-label">Dataset</p>
  <select bind:value={selected} on:change={onchange}>
    {#each datasets as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>

  {#if showPredictionsCheckBox}
    <label>
      <input type="checkbox" bind:checked={predictions}>Show predictions
    </label>
  {/if}
</div>

<style>
  label {
    font-size: 14px;
    display: inline-block;
  }
</style>