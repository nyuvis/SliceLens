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

    const reader = new FileReader();

    reader.onload = function(event) {
      const text = event.target.result;
      const json = JSON.parse(text);
      dispatch('upload', json);
    }

    reader.readAsText(file);
  }

  function onclick() {
    if (fileInput) {
      fileInput.click();
    }
  }
</script>

<input bind:this={fileInput} type="file" accept=".json" style="display:none" on:change={onchange}>
<p on:click={onclick} class="link small">Import</p>