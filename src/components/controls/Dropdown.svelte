<script>
  let expanded = false;
</script>

<div class="container">
  <button class="head" on:click={() => expanded = !expanded}>Sorting</button>
  {#if expanded}
    <div>
      <div class="content">
        <slot></slot>
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .content {
    position: absolute;
    border-radius: 5px;
    border: 1px solid var(--dark-gray);
    background-color: white;
    z-index: 1;
    margin: 2px;
  }
</style>
