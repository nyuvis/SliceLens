<script>
  import Exporter from './Exporter.svelte';
  import Importer from './Importer.svelte';
  import Viewer from './Viewer.svelte';

  let notes = [];
  notes = [
    { title: 'Note 1', body: 'Contents of note one.' },
    { title: 'Note 2', body: 'Contents of note two.' },
    { title: 'Note 3', body: 'Contents of note three.' }
  ];

  let selectedIndex = -1;
  let selectedNote = null;
  let edit = false;

  function selectNote(note, i) {
    selectedIndex = i;
    selectedNote = note;
    edit = false;
  }

  function newNote() {
    selectedIndex = notes.length;
    selectedNote = { title: 'New Note', body: '' };
    notes.push(selectedNote);
    notes = notes;
    edit = true;
  }

  function closeNote() {
    selectedIndex = -1;
    selectedNote = null;
    notes = notes;
  }

  function deleteNote() {
    notes.splice(selectedIndex, 1);
    selectedIndex = -1;
    selectedNote = null;
    notes = notes;
  }
</script>

<div id="notes">
  <div class="header">
    <h2>Notes</h2>
    <div class="gap"></div>
    <Importer on:upload={e => notes = e.detail}/>
    <Exporter {notes}/>
  </div>

  <button on:click={newNote}>New Note</button>

  <p class="control-label">Recorded</p>
  <div id="list">
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
    {edit}
    on:close={closeNote}
    on:delete={deleteNote}
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

  #list {
    border-radius: 5px;
    padding: 5px;
    background: white;
    font-size: 14px;
    line-height: 1.25;
  }

  #list div {
    cursor: pointer;
  }

  #list div:hover {
    font-weight: bold;
  }

  .header {
    display: flex;
  }

  .gap {
    flex-grow: 1;
  }

  button {
    width: 100px;
  }
</style>