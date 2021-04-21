import { writable, derived } from 'svelte/store';
import { getData } from './DataTransformer.js';

// un-filtered dataset
export const fullDataset = writable([]);

// filtered dataset
export const dataset = writable([]);

// filters applied to fullDataset to get filtered dataset
export const filters = writable([]);

// features that are currently selected and visualized
export const selectedFeatures = writable([]);

// information on the features and splits
export const metadata = writable(null);

// data for the squares that are visualized
// run whenever the metadata, selected features, or dataset changes
export const data = derived(
  [metadata, selectedFeatures, dataset],
  ([$metadata, $selectedFeatures, $dataset]) => getData($metadata, $selectedFeatures, $dataset)
);

// logging user interactions
function createLog() {
  const { subscribe, update } = writable([]);

  return {
    subscribe,
    add: message => {
      message.time = Date.now();
      return update(logs => {
        // use JSON.stringify so that the logged value can't be mutated
        logs.push(JSON.stringify(message));
        return logs;
      });
    }
  }
}

export const logs = createLog();