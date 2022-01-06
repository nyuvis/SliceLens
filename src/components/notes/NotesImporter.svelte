<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Note } from '../../types';

  const dispatch = createEventDispatcher();

  let fileInput: HTMLInputElement;

  function onchange(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    const files = event.currentTarget?.files;

    if (files === undefined || files.length === 0) {
      return;
    }

    const file: File = files[0];

    const reader: FileReader = new FileReader();

    reader.onload = function(event) {
      const text = event.target.result as string;
      const json = JSON.parse(text) as Note[];
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
<button on:click={onclick} class="small">Import</button>