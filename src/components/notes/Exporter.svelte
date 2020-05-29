<script>
  export let notes;

  function onclick() {
    const prefix = 'data:text/plain;charset=utf-8,';
    const url = prefix + encodeURIComponent(JSON.stringify(notes));
    window.open(url);
  }
</script>

<!-- Download icon -->
<svg xmlns="http://www.w3.org/2000/svg"
  class="icon icon-tabler icon-tabler-download"
  width="24" height="24" viewBox="0 0 24 24"
  stroke-width="2" stroke="currentColor"
  fill="none" stroke-linecap="round"
  stroke-linejoin="round"
  on:click={onclick}
>
  <path stroke="none" d="M0 0h24v24H0z"/>
  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
  <polyline points="7 11 12 16 17 11" />
  <line x1="12" y1="4" x2="12" y2="16" />
</svg>

<style>
  .icon-tabler {
    width: 1.5em;
    height: 1.5em;
  }
</style>