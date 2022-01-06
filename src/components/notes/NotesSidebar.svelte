<script lang="ts">
  import NotesExporter from './NotesExporter.svelte';
  import NotesImporter from './NotesImporter.svelte';
  import NotesViewer from './NotesViewer.svelte';
  import LogExporter from './LogExporter.svelte';
  import { selectedFeatures, metadata, dataset, filters } from '../../stores.js';
  import { cloneSelectedFeaturesMetadata, cloneFilters } from '../../DataTransformer.js';
  import type { Note } from '../../types';

  let notes: Note[] = [];

  $: notesForDataset = notes.filter(d => d.state === null || d.state.dataset === $dataset.name);

  let selectedIndex: number = -1;
  let selectedNote: Note = null;
  let edit: boolean = false;
  let noteCounter: number = 0;

  function selectNote(note: Note, i: number) {
    edit = false;
    selectedIndex = i;
    selectedNote = note;
    notes = notes;
  }

  function newNote() {
    noteCounter++;
    selectedIndex = notes.length;
    selectedNote = { title: `Note ${noteCounter}`, body: '', state: null };
    notes.push(selectedNote);
    notes = notes;
    edit = true;
    linkNote();
  }

  function closeNote() {
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

  function viewNote() {
    edit = false;
    notes = notes;
  }

  function editNote() {
    edit = true;
  }

  function linkNote() {
    selectedNote.state = {
      selectedFeatures: [...$selectedFeatures],
      selectedFeaturesMetadata: cloneSelectedFeaturesMetadata($metadata.features, $selectedFeatures),
      dataset: $dataset.name,
      filters: cloneFilters($filters),
    };
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
  on:view={viewNote}
  on:edit={editNote}
  on:link={linkNote}
/>

<div class="header logs">
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
    overflow-y: auto;
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
    padding-top: 0.25em;
  }
</style>