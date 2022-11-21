import { writable, Writable } from 'svelte/store';
import type { Dataset } from './types';

export const dataset: Writable<Dataset> = writable(null);

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

// show predicted values
export const showPredictions: Writable<boolean> = writable(false);

// scale by number of instances
export const showSize: Writable<boolean> = writable(true);

// show bars to compare to root node
export const compareToWhole: Writable<boolean> = writable(true);

// visualization type
// https://stackoverflow.com/questions/36836011/checking-validity-of-string-literal-union-type-at-runtime
export const visKind: Writable<string> = writable('');

// has there been a change to the filters or features or metric since generating the suggestions
export const changeSinceGeneratingSuggestion: Writable<boolean> = writable(false);
