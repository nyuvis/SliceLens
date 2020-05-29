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
<!-- Upload icon -->
<svg xmlns="http://www.w3.org/2000/svg"
  class="icon icon-tabler icon-tabler-upload"
  width="24" height="24" viewBox="0 0 24 24"
  stroke-width="2" stroke="currentColor"
  fill="none" stroke-linecap="round"
  stroke-linejoin="round"
  on:click={onclick}
>
  <path stroke="none" d="M0 0h24v24H0z"/>
  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
  <polyline points="7 9 12 4 17 9" />
  <line x1="12" y1="4" x2="12" y2="16" />
</svg>

<style>
  .icon-tabler {
    width: 1.5em;
    height: 1.5em;
  }
</style>