<script>
  import { dataset, metadata } from "../../stores.js";
  import { flip } from "svelte/animate";

  import * as d3 from "d3";

  export let feature;

  export function onWindowClose() {
    console.log('groupToValues', groupToValues);
    console.log('groups', groups);
    console.log('object entries', Object.entries(groups));
    feature.valueToGroup = Object.fromEntries(
      groups.map(({name, values}) =>
        // values is a set
        [...values].map(v => [v, name])
      ).flat()
    );

    feature.values = groups.map(d => d.name);
  }

  let uid = 0;

  let groupToValues = d3.rollup(
    Object.entries(feature.valueToGroup)
      .map(([value, group]) => ({value, group})),
    v => new Set(v.map(d => d.value)),
    d => d.group
  );

  let groups = feature.values.map(d => ({
    name: new String(d),
    values: groupToValues.get(d),
    id: uid++
  }));

  let editingGroupName = null;

  function onClickNewGroup() {
    const group = {
      name: "New",
      id: uid++,
      values: new Set([])
    };
    groups = [group, ...groups];
    editingGroupName = 0;
  }

  // dragging

  let groupBeingDragged = null;
  let groupBeneath = null;
  let valueDragInProgress = false;
  let groupDragInProgress = false;
  let groupHandleHover = null;

  $: if (!groupDragInProgress) {
    groupBeingDragged = null;
    groupHandleHover = null;
  }

  function dropHandler(event, endGroupIndex) {
    const item = JSON.parse(event.dataTransfer.getData("text"));

    valueDragInProgress = false;
    groupDragInProgress = false;
    groupBeneath = null;

    if (item.startGroupIndex === endGroupIndex) {
      return;
    }

    if (item.type === "value") {
      groups[item.startGroupIndex].values.delete(item.value);
      groups[endGroupIndex].values.add(item.value);
      groups = groups.filter(d => d.values.size !== 0);
    } else {
      const group = groups[item.startGroupIndex];
      groups.splice(item.startGroupIndex, 1);
      groups.splice(endGroupIndex, 0, group);
      groups = groups;
    }
  }

  function onValueDragStart(groupIndex, value) {
    valueDragInProgress = true;

    const item = {
      startGroupIndex: groupIndex,
      value,
      type: "value"
    };
    event.dataTransfer.setData("text", JSON.stringify(item));
  }

  function onValueDragEnd() {
    valueDragInProgress = false;
    groupBeneath = null;
  }

  function onGroupDragStart(groupIndex) {
    groupDragInProgress = true;
    groupBeingDragged = groupIndex;
    const item = {
      startGroupIndex: groupIndex,
      type: "group"
    };
    event.dataTransfer.setData("text", JSON.stringify(item));
  }

  function onGroupDragEnd() {
    groupBeingDragged = null;
    groupBeneath = null;
  }

  function onDragEnter(i) {
    groupBeneath = i;
  }

  function getBorderClass(currentIndex, overIndex, startIndex, groupDragInProgress) {
    if (
      !groupDragInProgress ||
      startIndex === null ||
      currentIndex !== overIndex
    ) {
      return "";
    } else if (overIndex <= startIndex) {
      return "border-top";
    } else {
      return "border-bottom";
    }
  }
</script>

<div class="controls">
  <p class="link" on:click={onClickNewGroup}>
    New Group
  </p>
</div>

<div class="groups">
  {#each groups as { name, id, values }, i (id)}
    <div
      class="group-container {getBorderClass(i, groupBeneath, groupBeingDragged, groupDragInProgress)}"
      ondragover="return false"
      on:drop|preventDefault={e => dropHandler(e, i)}
      on:dragenter|stopPropagation={() => onDragEnter(i)}
      animate:flip={{ duration: 300 }}>
      <div
        class="group"
        draggable="{groupHandleHover === i}"
        on:dragstart={() => onGroupDragStart(i)}
        on:dragend={onGroupDragEnd}
        class:highlightGroup={(groupBeneath === i && valueDragInProgress) || groupHandleHover === i}>
        <div class="handle">
          <!-- vertical grip icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon icon-tabler icon-tabler-grip-vertical"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            on:mouseenter={() => groupHandleHover = i}
            on:mouseleave={() => groupHandleHover = null}
            >
            <path stroke="none" d="M0 0h24v24H0z" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>
        <div class="content">
          <div class="group-name-row">
            {#if editingGroupName !== i}
              <div class="bold group-name">{name}</div>
              <div class="gap"></div>
              <div
                class="link edit-name"
                on:click={() => (editingGroupName = i)}>
                Edit name
              </div>
            {:else}
              <input class="bold group-name-input" bind:value={name} size={Math.max(name.length, 1)}/>
              <div class="gap"></div>
              <div
                class="link edit-name"
                on:click={() => (editingGroupName = null)}>
                Save name
              </div>
            {/if}
          </div>
          {#each [...values] as value}
            <div
              class="value small"
              draggable="true"
              on:dragstart|stopPropagation={() => onValueDragStart(i, value)}
              on:dragend={onValueDragEnd}>
              {value}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .controls {
    margin: 0.5em 0;
    align-self: start;
  }

  .group-name {
    margin-right: 1em;
  }

  .group-name-input {
    margin-right: 1em;
    border: 0;
    padding: 0;

    font-family: "Fira Sans", sans-serif;
    font-size: 1rem;
  }

  .group-container {
    border: 1px solid white;
    padding: 0.25em 0;
  }

  /* the border stays gray without !important */
  .highlightGroup {
    border: 1px solid black !important;
  }

  .border-bottom {
    border-bottom: 1px solid black !important;
  }

  .border-top {
    border-top: 1px solid black !important;
  }

  .group {
    padding: 0.5em 0.5em 0.5em 0;

    border-radius: 5px;
    border: 1px solid #e5e5e5;
    background-color: #e5e5e5;

    display: flex;
  }

  .groups {
    flex: 1;
    overflow-y: auto;
  }

  .group-name-row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .icon-tabler-grip-vertical {
    cursor: move;
  }

  .edit-name, .icon-tabler-grip-vertical {
    visibility: hidden;
  }

  .group:hover .edit-name,
  .group:hover .icon-tabler-grip-vertical {
    visibility: visible;
  }

  .handle {
    display: flex;
    align-items: center;
  }

  .content {
    flex: 1;
  }

  .value {
    border: 1px solid white;
    border-radius: 5px;
    background-color: white;
    margin: 0.25em 0;
    padding-left: 0.5em;

    cursor: move;
  }

  .value:hover {
    border: 1px solid black;
  }
</style>
