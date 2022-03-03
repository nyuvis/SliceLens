<script lang="ts">
  import { selectedFeatures } from '../../../stores';

  $: title = $selectedFeatures.length === 0 ?
    'Dataset' :
    $selectedFeatures.join(' vs. ');
</script>

<div id="title-container" class="small bold">
  <div>{title}</div>
</div>

<style>
    #title-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
</style>