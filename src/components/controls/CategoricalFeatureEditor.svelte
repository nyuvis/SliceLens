<script lang="ts">
  import { flip } from "svelte/animate";
  import Barchart from '../visualization/barchart/Barchart.svelte';
  import Dropdown from './Dropdown.svelte';
  import MenuItem from './MenuItem.svelte';
  import QuestionBox from "../QuestionBox.svelte";
  import { changeSinceGeneratingSuggestion, dataset, features } from "../../stores";
  import { cloneCategoricalFeature, areFeaturesEqual } from "../../lib/Features";
  import type { CategoricalFeature } from "../../types";
  import { getGroups, updateFeature, addGroup, deleteGroup, mergeGroups, splitGroups, sortGroupsByName, sortGroupsByCount, moveValue, moveGroup } from "../../lib/CategoricalFeatureEditing";

  export let feature: CategoricalFeature;

  // save copy of feature before edits are made
  const original = cloneCategoricalFeature(feature);

  let groups = getGroups(feature);

  // this function gets called by FeatureEditor.svelte when the window is closed
  export function onWindowClose() {
    feature = updateFeature(feature, groups);

    if (!areFeaturesEqual(original, feature)) {
      $changeSinceGeneratingSuggestion = true;
    }
  }

  // feature editing

  let editingGroupName: number = null;

  function onEditName(i: number) {
    editingGroupName = i;
  }

  function onSaveName() {
    editingGroupName = null;
  }

  function saveOnEnter(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      onSaveName();
    }
  }

  function onClickNewGroup() {
    groups = addGroup(groups);
    editingGroupName = 0;
  }

  function onClickDeleteGroup(i: number) {
    groups = deleteGroup(groups, i);
  }

  function onClickMergeGroups() {
    // put all of the values into one group
    groups = mergeGroups(feature);
  }

  function onClickSplitGroups() {
    // put each value in its own group
    groups = splitGroups(feature);
  }

  // sorting

  function onClickSortCount() {
    groups = sortGroupsByCount(feature, groups, $dataset, $features);
  }

  function onClickSortName() {
    groups = sortGroupsByName(groups);
  }

  // dragging

  let groupBeingDragged: number = null;
  let groupBeneath: number = null;
  let valueDragInProgress: boolean = false;
  let groupDragInProgress: boolean = false;
  let groupHandleHover: number = null;

  $: if (!groupDragInProgress) {
    groupBeingDragged = null;
    groupHandleHover = null;
  }

  type DragInfo =
    | { type: "value", value: string, startGroupIndex: number }
    | { type: "group", startGroupIndex: number };

  function dropHandler(event: DragEvent, endGroupIndex: number) {
    const item: DragInfo = JSON.parse(event.dataTransfer.getData("text"));

    valueDragInProgress = false;
    groupDragInProgress = false;
    groupBeneath = null;

    if (item.startGroupIndex === endGroupIndex) {
      return;
    }

    if (item.type === "value") {
      groups = moveValue(item.value, item.startGroupIndex, endGroupIndex, groups);
    } else {
      groups = moveGroup(item.startGroupIndex, endGroupIndex, groups);
    }
  }

  function onValueDragStart(event: DragEvent, groupIndex: number, value: string) {
    valueDragInProgress = true;

    const item: DragInfo = {
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

  function onGroupDragStart(event: DragEvent, groupIndex: number) {
    groupDragInProgress = true;
    groupBeingDragged = groupIndex;
    const item: DragInfo = {
      startGroupIndex: groupIndex,
      type: "group"
    };
    event.dataTransfer.setData("text", JSON.stringify(item));
  }

  function onGroupDragEnd() {
    groupBeingDragged = null;
    groupBeneath = null;
  }

  function onDragEnter(i: number) {
    groupBeneath = i;
  }

  function getBorderClass(currentIndex: number, overIndex: number, startIndex: number, groupDragInProgress: boolean): string {
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

<div class="chart">
  <p class="label large">Distribution</p>
  <Barchart feature={feature.name}/>
</div>

<div class="group-question">
  <p class="large">Groups</p>
  <QuestionBox>
    You can drag the gray boxes to reorder the groups.
    You can drag the white boxes to move feature values from one group to another.
  </QuestionBox>
</div>

<div class="controls">
  <button id="new-group" on:click={onClickNewGroup}>New Group</button>

  <Dropdown>
    <MenuItem on:click={onClickSortCount} name={'Count'}/>
    <MenuItem on:click={onClickSortName} name={'Name'}/>
  </Dropdown>

  <div class="gap"></div>

  <button on:click={onClickSplitGroups}>Split All Groups</button>
  <button on:click={onClickMergeGroups}>Merge All Groups</button>
</div>

<div class="groups">
  {#each groups as { name, id, values }, i (id)}
    <div
      class="group-container {getBorderClass(i, groupBeneath, groupBeingDragged, groupDragInProgress)}"
      on:dragover|preventDefault={() => false}
      on:drop|preventDefault={e => dropHandler(e, i)}
      on:dragenter|stopPropagation={() => onDragEnter(i)}
      animate:flip={{ duration: 300 }}>
      <div
        class="group"
        draggable="{groupHandleHover === i}"
        on:dragstart={(event) => onGroupDragStart(event, i)}
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
              {#if values.size === 0}
                <button class="show-on-hover small" on:click={() => onClickDeleteGroup(i)}>
                  Delete group
                </button>
              {/if}
              <button class="show-on-hover small" on:click={() => onEditName(i)}>
                Edit name
              </button>
            {:else}
              <!-- If someone presses "Edit name", then their intention
                is to start editing the text in the input, so I think
                having autofocus on the input is appropriate.-->
              <!-- svelte-ignore a11y-autofocus -->
              <input
                class="bold group-name-input"
                bind:value={name}
                size={Math.max(name.length, 1)}
                on:keydown={saveOnEnter}
                autofocus
              />
              <div class="gap"></div>
              {#if values.size === 0}
                <button class="show-on-hover small" on:click={() => onClickDeleteGroup(i)}>
                  Delete group
                </button>
              {/if}
              <button class="show-on-hover small" on:click={onSaveName}>
                Save name
              </button>
            {/if}
          </div>
          {#each [...values] as value}
            <div
              class="value small"
              draggable="true"
              on:dragstart|stopPropagation={event => onValueDragStart(event, i, value)}
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
  .chart {
    align-self: flex-start;
    width: 100%;
  }

  .controls {
    margin: 0.5em 0;
    align-self: start;
    display: flex;
    width: 100%;
    align-items: center;
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

  .group-question {
    display: flex;
    align-items: center;
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
    padding: 0.25em 0.25em 0.25em 0;

    border-radius: 5px;
    border: 1px solid var(--medium-gray);
    background-color: var(--medium-gray);

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

  .show-on-hover, .icon-tabler-grip-vertical {
    visibility: hidden;
  }

  .group:hover .show-on-hover,
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

  .sorting-label {
    margin-right: 5px;
  }

  #new-group {
    margin-right: 4px;
  }
</style>
