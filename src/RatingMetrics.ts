import type { Node, Features, Dataset, ClassificationNode } from './types';

import * as d3 from "d3";

export {
  entropy,
  errorDeviation,
  errorCount,
  errorPercent,
  getErrorCountForSquare,
  getValidMetrics,
  random
};

// types

export type Metric = (input: RatingInput, getData: (features: Features, selectedFeatures: string[], dataset: Dataset) => Node[]) => Rating[];
export type RatingInput = {selected: string[], features: Features, dataset: Dataset, available: string[]};
export type Rating = {feature: string, value: number};

export type MetricName = 'none' | 'entropy' | 'errorDeviation' | 'errorCount' | 'errorPercent' | 'random';
export type MetricInfo = { value: MetricName, display: string, type: 'classification' | 'regression', requiresPredictions: boolean };
export type MetricGroup = { title: string, requiresPredictions: boolean, options: MetricInfo[] };

// info for feature selector

const metricsInfo: { 'classification': MetricGroup[], 'regression': MetricGroup[] } = {
  'classification': [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'entropy', display: 'Purity', type: 'classification', requiresPredictions: false },
      ]
    },
    {
      title: 'Prediction Metrics',
      requiresPredictions: true,
      options: [
        { value: 'errorDeviation', display: 'Error deviation', type: 'classification', requiresPredictions: true },
        { value: 'errorCount', display: 'Error count', type: 'classification', requiresPredictions: true },
        { value: 'errorPercent', display: 'Error percent', type: 'classification', requiresPredictions: true },
      ]
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'classification', requiresPredictions: false },
      ]
    }
  ],
  'regression': [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'random', display: 'Random', type: 'regression', requiresPredictions: false },
      ]
    },
    {
      title: 'Prediction Metrics',
      requiresPredictions: true,
      options: []
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'regression', requiresPredictions: false },
      ]
    }
  ]
};

function getValidMetrics(type: 'classification' | 'regression', hasPredictions: boolean, chooseNone: boolean) {
  const criteria = metricsInfo[type].filter(group => hasPredictions || !group.requiresPredictions);
  const defaultCriterion =
    chooseNone ?
      criteria[criteria.length - 1].options[0] :
      criteria[0].options[0];
  return { criteria, defaultCriterion };
}

// classification

/*
  Return the feature that results in the nodes with the
  lowest average entropy.
*/
function entropy({selected, features, dataset, available}: RatingInput, getData: (features: Features, selectedFeatures: string[], dataset: Dataset) => Node[]): Rating[] {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(features, sel, dataset);

    // give higher rating to lower entropy, so negate it
    const value = -d3.sum(data, square => {
      const weight = square.size / dataset.size;
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
function errorDeviation({selected, features, dataset, available}: RatingInput, getData: (features: Features, selectedFeatures: string[], dataset: Dataset) => Node[]): Rating[] {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(features, sel, dataset);

    // d3.deviation returns undefined if there are fewer than two numbers
    const value = data.length < 2 ? 0 : d3.deviation(data, d => getErrorCountForSquare(d) / d.size);

    return {feature, value};
  });
}

/*
  Give a higher rating to features that result in the
  single nodes that have the higher number of errors
*/
function errorCount({selected, features, dataset, available}: RatingInput, getData: (features: Features, selectedFeatures: string[], dataset: Dataset) => Node[]): Rating[] {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(features, sel, dataset);

    const value = d3.max(data, getErrorCountForSquare);

    return {feature, value};
  });
}

/*
  Give a higher rating to features that result in the
  single nodes that have the higher percent of errors
*/
function errorPercent({selected, features, dataset, available}: RatingInput, getData: (features: Features, selectedFeatures: string[], dataset: Dataset) => Node[]): Rating[] {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(features, sel, dataset);

    const value = d3.max(data, d => getErrorCountForSquare(d) / d.size);

    return {feature, value};
  });
}


function getErrorCountForSquare(square: ClassificationNode): number {
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

// regression

function random({selected, features, dataset, available}: RatingInput, getData: (features: Features, selectedFeatures: string[], dataset: Dataset) => Node[]): Rating[] {
  return available.map(feature => ({
    feature,
    value: Math.random()
  }));
}