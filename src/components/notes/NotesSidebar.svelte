<script>
  import NotesExporter from './NotesExporter.svelte';
  import NotesImporter from './NotesImporter.svelte';
  import NotesViewer from './NotesViewer.svelte';
  import LogExporter from './LogExporter.svelte';
  import { selectedFeatures, metadata, dataset } from '../../stores.js';
  import { cloneMetadata } from '../../DataTransformer.js';

  let notes = [];

  $: notesForDataset = notes.filter(d => d.state === null || d.state.dataset === $dataset.name);

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
    selectedNote = { title: 'New Note', body: '', linked: true, state: null };
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
        selectedFeatures: [...$selectedFeatures],
        metadata: cloneMetadata($metadata),
        dataset: $dataset.name
      };
    } else {
      selectedNote.state = null;
    }
  }
</script>

<p class="label bold">Notes</p>
<div class="header sub-label">
  <button class="small" on:click={newNote}>New Note</button>
  <div class="gap"></div>
  <NotesImporter on:upload={e => notes = e.detail}/>
  <NotesExporter {notes}/>
</div>

<div class="list small">
  {#each notesForDataset as note, i}
    <div class='note-title cutoff' on:click={() => selectNote(note, i)}>
      {note.title}
    </div>
  {/each}
  {#if notes.length === 0}
      No notes.
  {:else if notesForDataset.length === 0}
      No notes for this dataset.
  {/if}
</div>

<NotesViewer
  note={selectedNote}
  edit={edit}
  on:close={closeNote}
  on:delete={deleteNote}
  on:save={saveNote}
  on:edit={editNote}
/>

<div class="header sub-label logs">
  <div class="gap"></div>
  <LogExporter/>
</div>

<style>
  .header {
    display: flex;
    flex: 0 0 auto;
  }

  .list {
    border-radius: 5px;
    padding: 5px;
    background: white;
    line-height: 1.25;

    max-height: 150px;
    overflow-y: scroll;
    flex: 0 0 auto;
  }

  .list div {
    cursor: pointer;
  }

  .list div:hover {
    font-weight: 500;
  }

  .logs {
    margin-top: auto;
  }
</style>