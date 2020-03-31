<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from "d3";

  let selected = 'census';

  const dispatch = createEventDispatcher();

  const datasets = [
    { value: 'census', display: 'Census' },
    { value: 'heart-disease', display: 'Heart Disease' }
  ];

  function load(name) {
    d3.csv(`../datasets/${name}.csv`, d3.autoType).then(data => {
      dispatch('update', data);
    });
  }

  function onchange() {
    load(selected);
  }

  onMount(async () => {
    load(selected);
  });
</script>

<div>
  <h2>Dataset</h2>
  <select bind:value={selected} on:change={onchange}>
    {#each datasets as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>
</div>