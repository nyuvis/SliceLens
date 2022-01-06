<script lang="ts">
  export let name: string;
</script>

<div on:click>{name}</div>

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
    border-radius: 5px;
  }

  div:hover {
    color: var(--blue);
  }
</style>
