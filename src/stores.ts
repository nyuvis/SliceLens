import { writable, derived, Writable, Readable } from 'svelte/store';
import { getClassificationData, getRegressionData } from './DataTransformer.js';
import type { Dataset, Filter, Features, Node } from './types.js';

// un-filtered dataset
export const fullDataset: Writable<Dataset> = writable(null);

// filtered dataset
export const dataset: Writable<Dataset> = writable(null);

// filters applied to fullDataset to get filtered dataset
export const filters: Writable<Filter[]> = writable([]);

// features that are currently selected and visualized
export const selectedFeatures: Writable<string[]> = writable([]);

// information on the features and splits
export const features: Writable<Features> = writable(null);

// data for the squares that are visualized
// run whenever the feature splits, selected features, or dataset changes
export const data: Readable<Node[]> = derived(
  [features, selectedFeatures, dataset],
  ([$features, $selectedFeatures, $dataset]) => {
    if ($dataset.type === 'classification') {
      return getClassificationData($features, $selectedFeatures, $dataset);
    } else {
      const reg = getRegressionData($features, $selectedFeatures, $dataset);
      console.log("test");
      console.log('reg', reg);
      return reg;
    }
  }
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