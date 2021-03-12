<script>
  export let showPredictions;
  export let color;
</script>

<div id="legend">
  {#each color.domain() as label}
    <div class="legend-cell">
      <div class="legend-square" style="background: {color(label)}"></div>
      <p class="small legend-label">{label}
      </p>
    </div>
  {/each}
  {#if showPredictions}
    <div class="legend-cell">
        <div class="legend-square" id="incorrect"></div>
        <p class="small legend-label">Incorrect</p>
    </div>
  {/if}
</div>

<style>
    #legend {
      flex: 0 0 20px;
      max-height: 20px;
      margin-top: 5px;

      display: flex;
    }

    .legend-cell {
      display: flex;
      align-items: center;
    }

    .legend-square {
      width: 14px;
      height: 14px;
      margin-right: 0.5em;
      margin-left: 1em;
    }

    #incorrect {
      background: repeating-linear-gradient(
        135deg,
        black,
        black 2px,
        white 2px,
        white 4px
      );
    }
</style>