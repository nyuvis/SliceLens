<script>
  import Exporter from './Exporter.svelte';
  import Importer from './Importer.svelte';
  import Viewer from './Viewer.svelte';
  import { selectedFeatures, splitType, numberOfSplits } from '../../stores.js';

  let notes = [];

  let selectedIndex = -1;
  let selectedNote = null;
  let edit = false;

  function selectNote(note, i) {
    if (selectedNote !== null && edit) {
      // save opened note before opening a different one
      setNoteState();
    }

    edit = false;
    selectedIndex = i;
    selectedNote = note;
  }

  function newNote() {
    if (selectedNote !== null && edit) {
      // save opened note before creating a new note
      setNoteState();
    }

    selectedIndex = notes.length;
    selectedNote = { title: 'New Note', body: '', linked: false };
    notes.push(selectedNote);
    notes = notes;
    edit = true;
  }

  function closeNote() {
    if (edit) {
      setNoteState();
    }
    selectedIndex = -1;
    selectedNote = null;
    edit = false;
    notes = notes;
  }

  function deleteNote() {
    notes.splice(selectedIndex, 1);
    selectedIndex = -1;
    selectedNote = null;
    edit = false;
    notes = notes;
  }

  function saveNote() {
    setNoteState();
    edit = false;
    notes = notes;
  }

  function editNote() {
    edit = true;
  }

  function setNoteState() {
    if (selectedNote.linked) {
      selectedNote.state = {
        selectedFeatures: $selectedFeatures,
        splitType: $splitType,
        numberOfSplits: $numberOfSplits,
      };
    } else {
      selectedNote.state = null;
    }
  }
</script>

<div id="notes">
  <p class="label bold">Notes</p>
  <div class="header">
    <p class="link small" on:click={newNote}>New Note</p>
    <div class="gap"></div>
    <Importer on:upload={e => notes = e.detail}/>
    <Exporter {notes}/>
  </div>

  <div class="list small">
    {#each notes as note, i}
      <div on:click={() => selectNote(note, i)}>
        {note.title}
      </div>
    {/each}
    {#if notes.length === 0}
        No notes.
    {/if}
  </div>

  <Viewer
    note={selectedNote}
    edit={edit}
    on:close={closeNote}
    on:delete={deleteNote}
    on:save={saveNote}
    on:edit={editNote}
  />
</div>

<style>
  #notes {
    flex: 0 0 300px;
    background-color: #E5E5E5;
    padding: 5px 15px;

    max-width: 300px;
    display: flex;
    flex-direction: column;
  }

  .list {
    border-radius: 5px;
    padding: 5px;
    background: white;
    line-height: 1.25;
  }

  .list div {
    cursor: pointer;
  }

  .list div:hover {
    font-weight: 500;
  }

  .header {
    display: flex;
  }
</style>