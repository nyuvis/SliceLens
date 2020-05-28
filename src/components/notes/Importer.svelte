<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let fileInput;

  function onchange(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    const file = files[0];
    file.text().then(text => {
      const json = JSON.parse(text);
      dispatch('upload', json);
    });
  }

  function onclick() {
    if (fileInput) {
      fileInput.click();
    }
  }
</script>

<input bind:this={fileInput} type="file" accept=".json" style="display:none" on:change={onchange}>
<button on:click={onclick}>Upload</button>

<style>
  button {
    display: inline;
  }
</style>