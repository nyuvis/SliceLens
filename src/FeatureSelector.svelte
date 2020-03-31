<script>
  export let features = [];
  export let selected = [];
</script>

<div>
  <h2>Features</h2>
  {#each features as feature}
    <div>
      <label>
        <input type=checkbox bind:group={selected} value={feature}>
        {feature}
      </label>
    </div>
  {/each}

  <h2>Selected</h2>
  {#each selected as feature}
    <div>
      {feature}
    </div>
  {/each}
</div>