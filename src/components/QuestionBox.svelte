<script>
  export let text = "";
</script>

<div class="tooltip-container" data-tooltip="{text}">
  <svg xmlns="http://www.w3.org/2000/svg"
    class="icon icon-tabler icon-tabler-help"
    width="24" height="24" viewBox="0 0 24 24"
    stroke-width="2" stroke="currentColor"
    fill="none" stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z"/>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
    <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
  </svg>
</div>

<style>
  /*
    https://stackoverflow.com/questions/7117073/add-a-tooltip-to-a-div
    https://elazizi.com/a-step-by-step-guide-to-making-pure-css-tooltips
  */

  [data-tooltip]::after {
    position: absolute;
    content: attr(data-tooltip);
    opacity: 0;

    margin-left: 0.5em;
    padding: 5px;

    transform: translateY(0.5em) translateY(-50%);

    border-radius: 5px;
    max-width: 30em;

    font-size: 0.875em;
    font-weight: 400;

    /* background: black;
    color: white; */
    border: 1px solid black;
    color: black;
    background: white;

    z-index: 99;

    pointer-events: none;
  }

  [data-tooltip]:hover::after {
    opacity: 1;
  }

  .tooltip-container {
    margin-left: 0.5em;
  }

  .icon-tabler-help{
    vertical-align: top;
  }
</style>