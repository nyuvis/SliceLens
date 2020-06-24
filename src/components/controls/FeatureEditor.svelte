<!---
References:
https://www.w3schools.com/howto/howto_css_modals.asp
-->

<script>
  import { dataset, metadata } from '../../stores.js';
  import { onMount, createEventDispatcher } from 'svelte';

  import * as d3_array from "d3-array";
  import * as d3_all from "d3";

  const d3 = {...d3_all, ...d3_array,};

  const dispatch = createEventDispatcher();

  export let featureName;
  const feature = $metadata.features[featureName];

  const groupToValues = d3.rollup(
    Array.from(feature.valueToGroup)
      .map(([value, group]) => ({value, group})),
    v => new Set(v.map(d => d.value)),
    d => d.group
  );

  let groups = feature.values.map(d => ({
    name: d,
    values: groupToValues.get(d)
  }));

  function onWindowClose() {
    feature.valueToGroup = new Map(Array.from(
      groupToValues,
      ([group, values]) => [...values].map(v => [v, group])
    ).flat());

    feature.values = groups.map(d => d.name);

    metadata.set($metadata);

    dispatch('close');
  }

  let editingGroupName = null;

  // dragging

  let groupBeingDragged = null;
  let groupBeneath = null;
  let valueDragInProgress = false;
  let groupDragInProgress = false;

  $: if (!groupDragInProgress) {
    groupBeingDragged = null;
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

  function onDragEnterBackground() {
    groupBeneath = null;
  }

  function getBorderClass(currentIndex, overIndex, startIndex, groupDragInProgress) {
    if (!groupDragInProgress || startIndex === null || currentIndex !== overIndex) {
      return "";
    } else if (overIndex <= startIndex) {
      return "border-top";
    } else {
      return "border-bottom";
    }
  }

</script>

<div class="modal-background">
  <div class="modal-content"
    on:dragenter={onDragEnterBackground}
  >
    <div class="header">
      <div class="feature-name large bold">{featureName}</div>

      <div class="gap"></div>

      <!-- x icon -->
      <svg xmlns="http://www.w3.org/2000/svg"
        class="icon icon-tabler icon-tabler-x"
        width="24" height="24" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor" fill="none"
        stroke-linecap="round" stroke-linejoin="round"
        on:click={onWindowClose}
      >
        <path stroke="none" d="M0 0h24v24H0z"/>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </div>

    {#if feature.type === "C"}
      <div class="groups">
        {#each groups as {name, values}, i}
          <div
            class="group-container {getBorderClass(i, groupBeneath, groupBeingDragged, groupDragInProgress)}"
            ondragover="return false"
            on:drop|preventDefault={e => dropHandler(e, i)}
            on:dragenter|stopPropagation={() => onDragEnter(i)}
          >
            <div class="group"
              draggable="true"
              on:dragstart={() => onGroupDragStart(i)}
              on:dragend={onGroupDragEnd}
              class:highlight={groupBeneath === i && valueDragInProgress}
            >
              <div class="group-name-row"
              >
                {#if editingGroupName !== i}
                  <div class="bold group-name">{name}</div>
                  <div class="gap"></div>
                  <div class="link edit-name"
                    on:click={() => editingGroupName = i}
                  >
                    Edit name
                  </div>
                {:else}
                  <input class="bold group-name-input" bind:value={name}>
                  <div class="link edit-name"
                    on:click={() => editingGroupName = null}
                  >
                    Save name
                  </div>
                {/if}
              </div>
              {#each [...values] as value}
                <div class="value small"
                  draggable="true"
                  on:dragstart|stopPropagation={() => onValueDragStart(i, value)}
                  on:dragend={onValueDragEnd}
                >
                  {value}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>

  .modal-background {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background-color: white;

    max-width: 80%;
    max-height: 80%;

    border-radius: 5px;

    padding: 1rem;

    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: center;
  }

  .divider {
    width: 100%;
    height: 3px;
    background-color: black;
  }
  .group-name {
    margin-right: 1em;
  }

  .group-name-input {
    flex: 1 1 auto;

    width: 0;
    margin-right: 1em;
    border: 0;

    font-family: 'Fira Sans', sans-serif;
    font-size: 1rem;
  }

  .group-container {
    padding: 0.25em 0;
  }

  .border-bottom {
    border-bottom: 1px solid black;
  }

  .border-top {
    border-top: 1px solid black;
  }

  /* the border stays gray without !important */
  .highlight {
    border: 1px solid black !important;
  }

  .group {
    padding: 0.5em;

    border-radius: 5px;
    border: 1px solid #E5E5E5;
    background-color: #E5E5E5;
  }

  .groups {
    flex: 1;
    overflow-y: auto;
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

  .group-name-row {
    display: flex;
    flex-direction: row;
  }

  .edit-name {
    visibility: hidden;
  }

  .group:hover .edit-name {
    visibility: visible;
  }

  .icon-tabler-x {
    cursor: pointer;
    margin-left: 1em;
  }

  .icon-tabler-x:hover {
    color: red;
  }

</style>