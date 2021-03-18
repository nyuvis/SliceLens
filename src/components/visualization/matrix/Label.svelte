<script>
  export let width = 0;
  export let height = 0;
  export let x = 0;
  export let y = 0;
  export let bold = false;
  export let rotate = false;
  export let label = "";
</script>

<!-- using a foreignObject because SVG text does
not support anything like `text-overflow: ellipsis` -->

<foreignObject {x} {y} width={rotate ? height : width} height={rotate ? width : height}>
  <div class="container">
    <div class="content" class:rotate style="width: {width}px; height: {height}px;">
      <p class:bold class="small cutoff" title={label}>{label}</p>
    </div>
  </div>
</foreignObject>

<style>
  .container {
    width: 100%;
    height: 100%;

    /* we want to center the content div in the container
    so that we can rotate the content div around its center
    and have it stay in the foreignObject */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .content {
    /* center the label in the div */
    display: flex;
    justify-content: center;
    align-items: center;

    /* removing this messes up the rotation on safari,
    but adding it causes the div to appear above tooltips */
    position: fixed;
  }

  .rotate {
    transform: rotate(270deg);
  }
</style>