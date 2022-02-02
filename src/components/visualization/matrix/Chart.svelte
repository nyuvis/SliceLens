<script lang="ts">
  import ColorLegend from './ColorLegend.svelte';
  import Matrix from './Matrix.svelte';
</script>

<div id="chart-container">
  <ColorLegend/>
  <Matrix/>
</div>

<style>
    #chart-container {
      flex: 1;
      height: 100vh;

      display: flex;
      flex-direction: column;
    }
</style>