<script lang="ts">
  import ColorLegend from './legends/ColorLegend.svelte';
  import Title from './Title.svelte';
  import Vis from './Vis.svelte';
</script>

<div id="chart-container">
  <!-- <Title/> -->
  <ColorLegend/>
  <Vis/>
</div>

<style>
    #chart-container {
      flex: 1;
      height: 100vh;
      max-height: 100vh;

      display: flex;
      flex-direction: column;
    }
</style>
