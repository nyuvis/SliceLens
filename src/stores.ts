import { writable, derived, Writable, Readable } from 'svelte/store';
import { getData } from './DataTransformer.js';
import type { Dataset, Filter, Metadata, Node } from './types.js';

// un-filtered dataset
export const fullDataset: Writable<Dataset> = writable(Object.assign([], {name: '', columns: []}));

// filtered dataset
export const dataset: Writable<Dataset> = writable(Object.assign([], {name: '', columns: []}));

// filters applied to fullDataset to get filtered dataset
export const filters: Writable<Filter[]> = writable([]);

// features that are currently selected and visualized
export const selectedFeatures: Writable<string[]> = writable([]);

// information on the features and splits
export const metadata: Writable<Metadata> = writable(null);

// data for the squares that are visualized
// run whenever the metadata, selected features, or dataset changes
export const data: Readable<Node[]> = derived(
  [metadata, selectedFeatures, dataset],
  ([$metadata, $selectedFeatures, $dataset]) => getData($metadata, $selectedFeatures, $dataset)
);

// logging user interactions
function createLog() {
  const { subscribe, update } = writable([]);

  return {
    subscribe,
    add: (message: Record<string,unknown>) => {
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