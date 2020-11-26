<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { getMetadata } from '../../DataTransformer.js';
  import { dataset, selectedFeatures, metadata } from '../../stores.js';
  import QuestionBox from '../QuestionBox.svelte';
  import * as d3 from "d3";

  let showSize = true;
  const dispatch = createEventDispatcher();
  $: dispatch('update', showSize);
  dispatch('update', showSize);
</script>

<div>
  <p class="label bold">Visualization</p>
  <label class="sub-label small">
      <input type="checkbox" bind:checked={showSize}>Scale by num. instances
  </label>
</div>

<style>
  label {
    display: inline-block;
  }
</style>