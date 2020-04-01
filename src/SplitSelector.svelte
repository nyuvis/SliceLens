<script>
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  const splits = [
    { value: 'interval', display: 'Equal Intervals' },
    { value: 'quantile', display: 'Quantiles' }
  ];

  let split = 'interval';
  $: dispatch('update', split);
  onMount(() => dispatch('update', split));
</script>

<div>
  <p class="control-label">Splits</p>
  <select bind:value={split}>
    {#each splits as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>
</div>