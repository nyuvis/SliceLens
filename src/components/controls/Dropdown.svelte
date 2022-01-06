<script lang="ts">
  let expanded: boolean = false;

  // https://stackoverflow.com/questions/152975/how-do-i-detect-a-click-outside-an-element/3028037#3028037
  function bodyClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('#dropdown-container') && expanded) {
      expanded = false;
    }
  }

  function buttonClick() {
    expanded = !expanded;
  }
</script>

<svelte:body on:click={bodyClick}/>

<div id="dropdown-container">
  <button on:click={buttonClick}>Sorting</button>
  {#if expanded}
    <div>
      <div id="dropdown-content">
        <slot></slot>
      </div>
    </div>
  {/if}
</div>

<style>
  #dropdown-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  #dropdown-content {
    position: absolute;
    border-radius: 5px;
    border: 1px solid var(--dark-gray);
    background-color: white;
    z-index: 1;
    margin: 2px;
  }
</style>
