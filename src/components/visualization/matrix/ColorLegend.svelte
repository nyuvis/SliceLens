<script lang="ts">
  export let showPredictions: boolean;
  export let color: d3.ScaleOrdinal<string, string, string>;
</script>

<div id="legend" class="small">
  <div class="bold title">{showPredictions ? 'Predicted Labels' : 'Ground Truth Labels'}</div>

  <div class="swatches">
    {#if showPredictions}
      <div class="column">
        <div class="legend-cell">Correct:</div>
        <div class="legend-cell">Incorrect:</div>
      </div>
    {/if}

    {#each color.domain() as label}
      <div class="column">
        <div class="legend-cell">
          <div class="legend-square" style="background: {color(label)}"></div>
          <div class="legend-label">{label}</div>
        </div>
        {#if showPredictions}
          <div class="legend-cell">
            <div class="legend-square"
              style="background: repeating-linear-gradient(135deg, {color(label)}, {color(label)} 2px, white 2px, white 4px)">
            </div>
            <div class="legend-label">{label}</div>
          </div>
        {/if}
      </div>
    {/each}
  </div>

</div>

<style>
    #legend {
      flex: 0 0 40px;
      max-height: 40px;
      margin-left: 5px;

      display: flex;
      align-items: center;
    }

    .title {
      margin-right: 1em;
    }

    .legend-cell {
      display: flex;
      align-items: center;
    }

    .legend-square {
      min-width: 14px;
      min-height: 14px;
      margin-right: 0.5em;
    }

    .swatches {
      display: flex;
    }

    .column {
      margin-right: 1em;
    }
</style>