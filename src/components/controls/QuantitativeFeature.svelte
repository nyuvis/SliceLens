<script>
  import { dataset, metadata } from "../../stores.js";
  import { onMount, createEventDispatcher } from "svelte";
  import { flip } from "svelte/animate";

  import * as d3_array from "d3-array";
  import * as d3_all from "d3";

  const d3 = { ...d3_all, ...d3_array };

  const dispatch = createEventDispatcher();

  export let feature;

  export function onWindowClose() {
  }
</script>



<style>
</style>
