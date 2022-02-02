import { writable, derived, Writable, Readable } from 'svelte/store';
import { getClassificationData, getRegressionData } from './DataTransformer';
import type { Dataset, Filter, Features, Node } from './types';
import * as d3 from 'd3';

// un-filtered dataset
export const fullDataset: Writable<Dataset> = writable(null);

// filtered dataset
export const dataset: Writable<Dataset> = writable(null);

// filters applied to fullDataset to get filtered dataset
export const filters: Writable<Filter[]> = writable([]);

// feature names that are currently selected and visualized
export const selectedFeatures: Writable<string[]> = writable([]);

// information on the features and splits
export const features: Writable<Features> = writable(null);

// data for the squares that are visualized
// run whenever the feature splits, selected features, or dataset changes
export const data: Readable<Node[]> = derived(
  [features, selectedFeatures, dataset],
  ([$features, $selectedFeatures, $dataset]) => {
    if ($dataset === null) {
      return null;
    } else if ($dataset.type === 'classification') {
      return getClassificationData($features, $selectedFeatures, $dataset);
    } else {
      return getRegressionData($features, $selectedFeatures, $dataset);
    }
  }
);

// show predicted values
export const showPredictions: Writable<boolean> = writable(false);

// scale by number of instances
export const showSize: Writable<boolean> = writable(true);

// color scale
export const color: Readable<d3.ScaleOrdinal<string, string, string>|d3.ScaleThreshold<number, string, string>> = derived(
  [dataset, showPredictions],
  ([$dataset, $showPredictions]) => {
    if ($dataset.type === 'classification') {
      return d3.scaleOrdinal<string, string, string>()
          .domain($dataset.labelValues)
          .range(d3.schemeCategory10)
          .unknown('black');
    } else {
      const thresholds = $showPredictions ? $dataset.deltaThresholds : $dataset.groundTruthThresholds;
      const interpolator = $showPredictions ? d3.interpolatePuOr : d3.interpolateBlues;

      return d3.scaleThreshold<number, string, string>()
          .domain(thresholds)
          .range(d3.quantize(interpolator, thresholds.length + 1))
          .unknown('black');
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