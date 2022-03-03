<!--
  References:
  https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
  https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
  https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
-->

<script lang="ts">
  import type { Note } from "../../types";

  export let notes: Note[];

  let download: HTMLAnchorElement;

  function onclick() {
    if (!download) {
      return;
    }
    const prefix: string = 'data:text/plain;charset=utf-8,';
    const url: string = prefix + encodeURIComponent(JSON.stringify(notes));
    download.href = url;
    download.click();
  }
</script>

<button on:click={onclick} class="small">Export</button>

<a href="." download="notes.json" bind:this={download}>Download</a>

<style>
  a {
    display: none;
  }
</style>