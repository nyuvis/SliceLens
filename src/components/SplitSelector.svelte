<script>
  import { splitType, numberOfSplits } from '../stores.js';

  const splits = [
    { value: 'interval', display: 'Equal Intervals' },
    { value: 'quantile', display: 'Quantiles' }
  ];

  const bins = [2, 3, 4, 5];
</script>

<div>
  <p class="label">Quantitative Splits</p>

  <p class="sub-label">Type</p>
  <select bind:value={$splitType}>
    {#each splits as {value, display}}
      <option {value}>{display}</option>
    {/each}
  </select>

  <p class="sub-label">Bins</p>
  <select bind:value={$numberOfSplits}>
    {#each bins as bin}
      <option {bin}>{bin}</option>
    {/each}
  </select>
</div>