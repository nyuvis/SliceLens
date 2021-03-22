<script>
  import { slide } from "svelte/transition";

  export let name;
</script>

<div on:click transition:slide={{duration: 150}}>{name}</div>

<style>
  div {
    cursor: pointer;
    background-color: white;

    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    padding: 5px;

    min-height: 1em;

    overflow: hidden;
  }

  div:hover {
    color: var(--blue);
  }
</style>
