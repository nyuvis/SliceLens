<script>
  import { selectedFeatures, hov } from '../../../stores.js';

  export let showPredictions;
  export let color;

  function enter(label) {
    $hov = { label, correct: true };
  }

  function leave() {
    $hov = null;
  }

  $: title = $selectedFeatures
    ? $selectedFeatures.join(' vs. ')
    : '';
</script>

<div id="legend" class="small">
  <div class="item">
    <div id="color">
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
              <div class="legend-square" style="background: {color(label)}" on:mouseenter={() => enter(label)} on:mouseleave={leave}></div>
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
  </div>

  <div class="bold large item"><div>{title}</div></div>
  <div class="item"><div></div></div>
</div>

<style>
    #legend {
      flex: 0 0 40px;
      max-height: 40px;
      margin-left: 5px;

      display: flex;
      align-items: center;
    }

    .item {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    #color {
      display: flex;
      align-items: center;
    }

    .item:first-child > div { margin-right: auto; }
    .item:last-child > div { margin-left: auto; }

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