<script>
  export let notes;

  function onclick() {
    const prefix = 'data:text/plain;charset=utf-8,';
    const url = prefix + encodeURIComponent(JSON.stringify(notes));
    window.open(url);
  }
</script>

<p on:click={onclick} class="link small">Export</p>