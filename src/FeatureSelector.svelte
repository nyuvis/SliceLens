<!---
References:
https://svelte.dev/repl/810b0f1e16ac4bbd8af8ba25d5e0deff?version=3.4.2
https://svelte.dev/repl/adf5a97b91164c239cc1e6d0c76c2abe?version=3.14.1
-->

<script>
  export let features = [];
  export let selected = [];

  let dragInProgress = false;
  let draggingOver = null;

  function dropHandler(event, i) {
    const item = JSON.parse(event.dataTransfer.getData("text"));
    const filtered = selected.filter(d => d !== item.id);
    filtered.splice(i, 0, item.id);
    selected = filtered;
  }

  function startHandler(event) {
    dragInProgress = true;
    const item = {id: event.target.id};
    event.dataTransfer.setData("text", JSON.stringify(item));
  }

  function endHandler() {
    dragInProgress = false;
    draggingOver = null;
  }

  function featureClickHandler(feature) {
    if (!selected.includes(feature)) {
      selected = [...selected, feature];
    }
  }

  function trashClickHandler(feature) {
    selected = selected.filter(d => d !== feature);
  }
</script>

<div>
  <h2>Features</h2>
  <div>
    {#each features as feature, i  (feature)}
      <div class="feature"
        id={feature}
        draggable=true
        on:dragstart={startHandler}
        on:dragend={endHandler}
        on:click={() => featureClickHandler(feature)}
      >
        <p>{feature}</p>
      </div>
    {/each}
  </div>

  <h2>Selected</h2>
  <div id="selected-features" class:dragInProgress>
    {#each selected as feature, i (feature)}
      <div class="feature selected"
        id={feature}
        draggable=true
        ondragover="return false"
        on:drop|preventDefault={e => dropHandler(e, i)}
        on:dragstart={startHandler}
        on:dragend={endHandler}
        on:dragenter={() => draggingOver = feature}
        on:dragleave={() => draggingOver = null}
        class:draggingOver={draggingOver === feature}
      >
        <p>{feature}</p>
        <svg xmlns="http://www.w3.org/2000/svg"
          class="icon icon-tabler icon-tabler-trash"
          width="24" height="24" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor" fill="none"
          stroke-linecap="round" stroke-linejoin="round"
          on:click={() => trashClickHandler(feature)}
        >
          <path stroke="none" d="M0 0h24v24H0z"/>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
        </svg>
      </div>
    {/each}
    <div class="placeHolder"
      ondragover="return false"
      on:drop|preventDefault={e => dropHandler(e, selected.length)}
    >
    </div>
  </div>
</div>

<style>
  .draggingOver {
    font-weight: bold;
  }

  .draggingOver * {
    pointer-events: none;
  }

  .feature:hover {
    font-weight: bold;
  }

  .placeHolder {
    height: 1.5em;
  }

  .dragInProgress {
    background-color: white;
  }

  .selected {
    margin-top: 5px;
    display: flex;
    justify-content: space-between;
  }

  p {
    margin: 0;
    padding: 0;
  }

  .icon-tabler-trash {
    width: 1em;
    height: 1em;
    visibility: hidden;
  }

  .selected:hover .icon-tabler-trash {
    visibility: visible;
    color: black;
  }

  .selected:hover .icon-tabler-trash:hover {
    color: red;
  }
</style>