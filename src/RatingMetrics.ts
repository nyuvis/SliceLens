import type { Node, Metadata, Dataset } from './types';

import * as d3 from "d3";

export {
  entropy,
  errorDeviation,
  errorCount,
  errorPercent,
  getErrorCountForSquare,
};

export type Metric = (input: RatingInput, getData: (metadata: Metadata, selectedFeatures: string[], dataset: Dataset) => Node[]) => Rating[];
export type Rating = {feature: string, value: number};
export type RatingInput = {selected: string[], metadata: Metadata, dataset: Dataset, available: string[]};

/*
  Return the feature that results in the nodes with the
  lowest average entropy.
*/
function entropy({selected, metadata, dataset, available}: RatingInput, getData: (metadata: Metadata, selectedFeatures: string[], dataset: Dataset) => Node[]): Rating[] {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);

    // give higher rating to lower entropy, so negate it
    const value = -d3.sum(data, square => {
      const weight = square.size / metadata.size;
      return weight * H(square);
    });

    return {feature, value};
  });

  function H(square: Node) {
    return -d3.sum(square.groundTruth.values(), v => {
      const p = v / square.size;
      return p * Math.log2(p);
    });
  }
}

/*
  Give a higher rating to features that result in the
  subsets with higher standard deviations of percent error
*/
function errorDeviation({selected, metadata, dataset, available}: RatingInput, getData: (metadata: Metadata, selectedFeatures: string[], dataset: Dataset) => Node[]): Rating[] {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);

    // d3.deviation returns undefined if there are fewer than two numbers
    const value = data.length < 2 ? 0 : d3.deviation(data, d => getErrorCountForSquare(d) / d.size);

    return {feature, value};
  });
}

/*
  Give a higher rating to features that result in the
  single nodes that have the higher number of errors
*/
function errorCount({selected, metadata, dataset, available}: RatingInput, getData: (metadata: Metadata, selectedFeatures: string[], dataset: Dataset) => Node[]): Rating[] {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);

    const value = d3.max(data, getErrorCountForSquare);

    return {feature, value};
  });
}

/*
  Give a higher rating to features that result in the
  single nodes that have the higher percent of errors
*/
function errorPercent({selected, metadata, dataset, available}: RatingInput, getData: (metadata: Metadata, selectedFeatures: string[], dataset: Dataset) => Node[]): Rating[] {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);

    const value = d3.max(data, d => getErrorCountForSquare(d) / d.size);

    return {feature, value};
  });
}


function getErrorCountForSquare(square: Node): number {
  // this should not happen
  if (square.predictionResults === undefined) {
    return 0;
  }

  // predictionResults is a map map from predicted label to
  // map from "correct" or "incorrect" to count
  // one Map per class

  // get sum of incorrect predictions for each class
  const errorCount = d3.sum(square.predictionResults.values(),
    p => p.has('incorrect') ?
      p.get('incorrect') :
      0
  );

  return errorCount;
}