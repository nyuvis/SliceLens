import type { ClassificationNode, RegressionNode, Node } from './types';

import * as d3 from "d3";

export {
  metrics,
  getErrorCountForSquare,
  getValidMetrics,
  filterSubsets
};

// types

type ClassificationMetric = (data: ClassificationNode[]) => number;
type RegressionMetric = (data: RegressionNode[]) => number;
export type Rating = {feature: string, value: number};

type RegressionMetricName = 'mseDeviation' | 'similarity';
type ClassificationMetricName = 'entropy' | 'errorDeviation' | 'errorCount' | 'errorPercent'
export type MetricName = RegressionMetricName | ClassificationMetricName | 'none';

export type MetricInfo = { value: MetricName, display: string, type: 'classification' | 'regression', requiresPredictions: boolean };
export type MetricGroup = { title: string, requiresPredictions: boolean, options: MetricInfo[] };

export type Metrics =
  Record<ClassificationMetricName, {type: 'classification', metric: ClassificationMetric}> &
  Record<RegressionMetricName, {type: 'regression', metric: RegressionMetric}>

// metrics

const metrics: Metrics = {
  entropy: { type: 'classification', metric: entropy },
  errorDeviation: { type: 'classification', metric: errorDeviation },
  errorCount: { type: 'classification', metric: errorCount },
  errorPercent: { type: 'classification', metric: errorPercent },
  mseDeviation: { type: 'regression', metric: mseDeviation },
  similarity: { type: 'regression', metric: similarity }
};

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
        { value: 'similarity', display: 'Similarity', type: 'regression', requiresPredictions: false },
      ]
    },
    {
      title: 'Prediction Metrics',
      requiresPredictions: true,
      options: [
        { value: 'mseDeviation', display: 'MSE Deviation', type: 'regression', requiresPredictions: true },
      ]
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
function entropy(data: ClassificationNode[]): number {
  function H(square: ClassificationNode): number {
    return -d3.sum(square.groundTruth, v => {
      const p = v.size / square.size;
      return p * Math.log2(p);
    });
  }

  const datasetSize = d3.sum(data, square => square.size);

  // give higher rating to lower entropy, so negate it
  const value = -d3.sum(data, square => {
    const weight = square.size / datasetSize;
    return weight * H(square);
  });

  return value;
}

/*
  Give a higher rating to features that result in the
  subsets with higher standard deviations of percent error
*/
function errorDeviation(data: ClassificationNode[]): number {
  return data.length < 2 ? 0 : d3.deviation(data, d => getErrorCountForSquare(d) / d.size);
}

/*
  Give a higher rating to features that result in the
  single nodes that have the higher number of errors
*/
function errorCount(data: ClassificationNode[]): number {
  return d3.max(data, getErrorCountForSquare);;
}

/*
  Give a higher rating to features that result in the
  single nodes that have the higher percent of errors
*/
function errorPercent(data: ClassificationNode[]): number {
  return d3.max(data, d => getErrorCountForSquare(d) / d.size);
}


function getErrorCountForSquare(square: ClassificationNode): number {
  // this should not happen
  if (square.predictions === undefined) {
    return 0;
  }

  return d3.sum(square.predictions, d => d.correct ? 0 : d.size);
}

// regression

function mseDeviation(data: RegressionNode[]): number {
  // d3.deviation must be passed an array with at least 2 values
  return data.length < 2 ? 0 : d3.deviation(data, square => mse(square));

  // mean squared error
  function mse(square: RegressionNode) {
    const labels = d3.zip(square.groundTruthLabels, square.predictedLabels);
    return d3.mean(labels, ([truth, prediction]) => (truth - prediction) ** 2)
  }
}

function similarity(data: RegressionNode[]): number {
  // number of instances in these subsets
  const datasetSize = d3.sum(data, square => square.size);

  // weighted average
  // negate because lower avg deviation = more similar subsets = better
  return -d3.sum(data, square => {
    // get the deviation of the ground truth labels in each subset
    const dev = d3.deviation(square.groundTruthLabels);
    // weight is percent of instances in this subset
    // weights sum to 1
    const weight = square.size / datasetSize;
    return dev * weight;
  });
}

// filter subsets

function filterSubsets<T extends Node>(subsets: T[], threshold: number): T[] {
  return subsets.filter(subset => subset.size >= threshold);
}