import { writable, derived, Writable, Readable } from 'svelte/store';
import { getClassificationData, getRegressionData } from './lib/Data';
import type { Dataset, Filter, Features, Node, visKinds } from './types';
import * as d3 from 'd3';

// un-filtered dataset
export const fullDataset: Writable<Dataset> = writable(null);

// filtered dataset
export const dataset: Writable<Dataset> = writable(null);

// filters applied to fullDataset to get filtered dataset
export const filters: Writable<Filter[]> = writable([]);

// feature names that are currently selected and visualized
function createSelectedFeatures() {
  const { subscribe, set, update }: Writable<string[]> = writable([]);

  function addAtIndex(feature: string, index: number): void {
    update(selected => {
      const filtered = selected.filter(d => d !== feature);
      filtered.splice(index, 0, feature);
      return filtered;
    });
  }

  function add(feature: string): void {
    update(selected => {
      if (!selected.includes(feature)) {
        selected.push(feature);
      }
      return selected;
    });
  }

  function remove(feature: string): void {
    update(selected => selected.filter(d => d !== feature));
  }

  function put(features: string[]): void {
    set(features);
  }

  function reset(): void {
    set([]);
  }

  return {
    subscribe,
    addAtIndex,
    add,
    remove,
    reset,
    put
  };
}

export const selectedFeatures = createSelectedFeatures();

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

// show bars to compare to root node
export const compareToWhole: Writable<boolean> = writable(true);

// use quantile color scale for regression datasets
export const quantileColor: Writable<boolean> = writable(false);

// visualization type
// https://stackoverflow.com/questions/36836011/checking-validity-of-string-literal-union-type-at-runtime
export const visKind: Writable<typeof visKinds[number]> = writable('squares');

// color scale
export const color: Readable<d3.ScaleOrdinal<string, string, string>|d3.ScaleThreshold<number, string, string>> = derived(
  [dataset, showPredictions, quantileColor],
  ([$dataset, $showPredictions, $quantileColor]) => {
    if ($dataset.type === 'classification') {
      return d3.scaleOrdinal<string, string, string>()
          .domain($dataset.labelValues)
          .range(d3.schemeCategory10)
          .unknown('black');
    } else {
      const thresholds = $showPredictions ?
        // predictions
        $quantileColor ? $dataset.deltaQuantileThresholds : $dataset.deltaThresholds :
        // ground truth
        $quantileColor ? $dataset.groundTruthQuantileThresholds : $dataset.groundTruthThresholds;

      const interpolator = $showPredictions ? d3.interpolatePuOr : d3.interpolateBlues;

      return d3.scaleThreshold<number, string, string>()
          .domain(thresholds)
          .range(d3.quantize(interpolator, thresholds.length + 1))
          .unknown('black');
    }
  }
);

// has there been a change to the filters or features or metric since generating the suggestions
export const changeSinceGeneratingSuggestion: Writable<boolean> = writable(false);
