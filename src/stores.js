import { writable, derived } from 'svelte/store';
import { getMetadata, getData } from './DataTransformer.js';

export const dataset = writable([]);

export const selectedFeatures = writable([]);

export const splitType = writable('interval');

export const metadata = derived(
  [dataset, splitType],
  ([$dataset, $splitType]) => getMetadata($dataset, $splitType)
);

export const data = derived(
  [metadata, selectedFeatures, dataset],
  ([$metadata, $selectedFeatures, $dataset]) => getData($metadata, $selectedFeatures, $dataset)
);