import * as d3 from "d3";
import { areArraysEqual, isNumeric } from "./Utils";
import type {
  QuantitativeFeature,
  CategoricalFeature,
  Feature,
  Features,
} from "../types";

export {
  cloneCategoricalFeature,
  cloneQuantitativeFeature,
  cloneSelectedFeatures,
  areFeaturesEqual,
  isNumericFeature,
  isQuantitativeFeature,
  isCategoricalFeature,
  getBinLabels,
  equalIntervalThresholds,
  quantileThresholds,
};

function cloneCategoricalFeature(feature: CategoricalFeature) : CategoricalFeature {
  return {
    name: feature.name,
    type: feature.type,
    values: [...feature.values],
    categories: [...feature.categories],
    valueToGroup: Object.assign({}, feature.valueToGroup)
  };
}

function cloneQuantitativeFeature(feature: QuantitativeFeature) : QuantitativeFeature {
  return {
    name: feature.name,
    type: feature.type,
    extent: [...feature.extent],
  };
}

function cloneSelectedFeatures(features: Features, selectedFeatures: string[]): Features {
  const copyOfFeatures = {};

  selectedFeatures.forEach(featureName => {
    const feature = features[featureName];

    if (feature.type === 'Q') {
      copyOfFeatures[featureName] = cloneQuantitativeFeature(feature);
    } else {
      copyOfFeatures[featureName] = cloneCategoricalFeature(feature);
    }

  });

  return copyOfFeatures;
}

function areFeaturesEqual(a: Feature, b: Feature): boolean {
  if (a.type === 'C' && b.type === 'C') {
    return (
      a.type === b.type &&
      a.name === b.name &&
      areArraysEqual(a.values, b.values) &&
      areArraysEqual(a.categories, b.categories) &&
      areArraysEqual(Object.keys(a.valueToGroup), Object.keys(b.valueToGroup)) &&
      areArraysEqual(Object.values(a.valueToGroup), Object.values(b.valueToGroup))
    );
  } else if (a.type === 'Q' && b.type === 'Q') {
    return (
      a.type === b.type &&
      a.name === b.name &&
      areArraysEqual(a.extent, b.extent)
    );
  } else {
    return false;
  }
}

function isNumericFeature(values: unknown[]): boolean {
  const uniqueValues = new Set(values);
  return Array.from(uniqueValues).every(isNumeric) && uniqueValues.size > 12;
}

function isQuantitativeFeature(values: (string | number)[]): values is number[] {
  return typeof values[0] === 'number';
}

function isCategoricalFeature(values: unknown[]): values is string[] {
  return typeof values[0] === 'string';
}

/* given the bins and a format function for a quantitative feature
  return the ranges of the bins as strings, which are used as labels
  in the visualiztion */
function getBinLabels(bins: (number[] & { x0: number, x1: number })[], format: (n: number) => string): string[] {
  const n = bins.length;
  return bins.map((bin, i) => {
    // the right endpoint of the last bin is inclusive
    const closing = (i === n - 1) ? ']' : ')';
    return `[${format(bin.x0)}, ${format(bin.x1)}${closing}`;
  });
}

/*
  Following the convention used by d3.bin https://github.com/d3/d3-array#bin,
  the lower bounds of all bins are inclusive and the upper bound of all bins
  except the last one are exclusive. The lower bound of the first bin is always
  the min value and the upper bound of the last bin is always the max value.

  "Thresholds are defined as an array of values [x0, x1, …].
  Any value less than x0 will be placed in the first bin;
  any value greater than or equal to x0 but less than x1
  will be placed in the second bin; and so on.
  Thus, the generated bins will have thresholds.length + 1 bins."

  min  t0  t1  t2  t3  max
     b0  b1  b2  b3  b4
*/

/* given the extent of a quantiative feature and the number of bins
    return evenly spaced thresholds. this will give equal-width bins.
    this could be replaced with d3.scaleQuantize maybe */
function equalIntervalThresholds([min, max]: [number, number], numBins: number): number[] {
  // width of each bin
  const binSize = (max - min) / numBins;
  const thresholds = d3.range(1, numBins)
      .map(d => min + d * binSize);
  return thresholds;
}

/* given all values of a quantitative feature and the number of bins
  return thresholds for equal-frequency bins */
function quantileThresholds(values: number[], numBins: number): number[] {
  return d3.scaleQuantile()
    .domain(values)
    .range(d3.range(numBins))
    .quantiles();
}
