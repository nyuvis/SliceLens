<!--
  References:
  https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
  https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
  https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
-->

<script>
  import { logs } from '../../stores.js';

  let download;

  function onclick() {
    if (!download) {
      return;
    }
    const prefix = 'data:text/plain;charset=utf-8,';
    const url = prefix + encodeURIComponent(JSON.stringify($logs));
    download.href = url;
    download.click();
  }
</script>

<p on:click={onclick} class="link small">Logs</p>

<a href="." download="logs.json" bind:this={download}>Download</a>

<style>
  a {
    display: none;
  }
</style>