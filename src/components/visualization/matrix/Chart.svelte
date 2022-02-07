<script lang="ts">
  import ColorLegend from './ColorLegend.svelte';
  import Matrix from './Matrix.svelte';
  import Title from './Title.svelte';
</script>

<div id="chart-container">
  <ColorLegend/>
  <Title/>
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