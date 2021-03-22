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
    border: 1px solid #e5e5e5;
    background-color: white;
    z-index: 1;
  }
</style>
