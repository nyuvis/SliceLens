<script>
  import { filters } from '../../../stores.js';
  import { isNumeric } from '../../../DataTransformer.js';

  export let filter;
  export let extent;

  $: [minValue, maxValue] = extent;

  // changing filter for numeric feature
  function onNumberChange(filter) {
    filter.valid =
      isNumeric(filter.min) &&
      isNumeric(filter.max) &&
      +filter.min >= minValue &&
      +filter.max <= maxValue &&
      +filter.min < +filter.max;

    if (filter.valid) {
      filter.min = +filter.min;
      filter.max = +filter.max;
      filter.rightInclusive = filter.max === maxValue;
    }

    $filters = $filters;
  }
</script>

{#if !filter.valid}
  <p class="error">
    Values must be numbers in the range {extent.join(' - ')},
    with the first value less than the second.
  </p>
{/if}
<div>
  Range:
  [<input size=6 bind:value={filter.min} on:change={onNumberChange}>
  ,
  <input size=6 bind:value={filter.max} on:change={onNumberChange}>)
</div>

