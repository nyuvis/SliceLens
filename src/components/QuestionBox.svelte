<script lang="ts">
  let show: boolean = false;
</script>

<div class="tooltip-container">
  <!-- question mark icon -->
  <svg xmlns="http://www.w3.org/2000/svg"
    class="icon icon-tabler icon-tabler-help"
    width="24" height="24" viewBox="0 0 24 24"
    stroke-width="2" stroke="currentColor"
    fill="none" stroke-linecap="round"
    stroke-linejoin="round"
    on:mouseenter={() => show = true}
    on:mouseleave={() => show = false}
  >
    <path stroke="none" d="M0 0h24v24H0z"/>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
    <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
  </svg>
  {#if show}
    <div class="content small">
      <slot></slot>
    </div>
  {/if}
</div>

<style>
  /*
    https://stackoverflow.com/questions/7117073/add-a-tooltip-to-a-div
    https://elazizi.com/a-step-by-step-guide-to-making-pure-css-tooltips
  */

  .content {
    position: absolute;

    margin-left: 1.5em;
    padding: 5px;

    border-radius: 5px;
    max-width: 30em;

    border: 1px solid black;
    color: black;
    background-color: white;

    z-index: 2;

    pointer-events: none;
  }

  .tooltip-container {
    margin-left: 0.5em;
    display: flex;
    align-items: center;
  }
</style>