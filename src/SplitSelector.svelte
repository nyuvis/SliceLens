<script>
  import { splitType } from './stores.js';

  const splits = [
    { value: 'interval', display: 'Equal Intervals' },
    { value: 'quantile', display: 'Quantiles' }
  ];
</script>

<div>
  <p class="control-label">Splits</p>
  <select bind:value={$splitType}>
    {#each splits as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>
</div>