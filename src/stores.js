import { writable, derived } from 'svelte/store';
import { getMetadata, getData } from './DataTransformer.js';

export const dataset = writable([]);

export const selectedFeatures = writable([]);

export const splitType = writable('interval');

export const numberOfSplits = writable(3);

export const metadata = derived(
  [dataset, splitType, numberOfSplits],
  ([$dataset, $splitType, $numberOfSplits]) => getMetadata($dataset, $splitType, $numberOfSplits)
);

export const data = derived(
  [metadata, selectedFeatures, dataset],
  ([$metadata, $selectedFeatures, $dataset]) => getData($metadata, $selectedFeatures, $dataset)
);