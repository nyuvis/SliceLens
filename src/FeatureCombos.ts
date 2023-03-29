import { Combination } from 'js-combinatorics';
import { filterSubsets, MetricName, Metrics } from './RatingMetrics';
import type {Features, ClassificationDataset, ClassificationNode, RegressionNode, Dataset} from './types';
import * as d3 from "d3";
import { getClassificationData, getRegressionData } from './lib/Data';

export { getFeatureCombinations, getFeatureCombosForMetric };

type Metric<T extends Dataset> = (data: Subset<T>[]) => number;
type Subset<T extends Dataset> = T extends ClassificationDataset ? ClassificationNode : RegressionNode;
type GetData<T extends Dataset> = (features: Features, selectedFeatures: string[], dataset: T) => Subset<T>[];

function getFeatureCombinations(
  criterion: MetricName,
  metrics: Metrics,
  selected: string[],
  features: Features,
  dataset: Dataset,
  numFeaturesToConsider: number,
  minSubsetSize: number
): string[][] {
  if (criterion === 'none') {
    return [];
  }

  const metric = metrics[criterion];

  if (dataset.type === 'classification' && metric.type === 'classification') {
    return getFeatureCombosForMetric(dataset, metric.metric, selected, features, getClassificationData, numFeaturesToConsider, criterion, minSubsetSize);
  } else if (dataset.type === 'regression' && metric.type === 'regression') {
    return getFeatureCombosForMetric(dataset, metric.metric, selected, features, getRegressionData, numFeaturesToConsider, criterion, minSubsetSize);
  } else {
    return [];
  }
}

function getFeatureCombosForMetric<T extends Dataset>(
  dataset: T,
  metric: Metric<T>,
  selected: string[],
  features: Features,
  getData: GetData<T>,
  numFeaturesToConsider: number,
  metricName: MetricName,
  minSubsetSize: number,
): string[][] {
  const startTime = performance.now();

  // get the top N individual features
  const allSingles = dataset.featureNames
    .map(feature => {
      const subsets = getData(features, [feature], dataset);
      const filteredSubsets = filterSubsets(subsets, minSubsetSize);
      const score = metric(filteredSubsets);
      return { combo: [feature], score: score };
    })
    .sort((a, b) => d3.descending(a.score, b.score));
  const singles = allSingles.slice(0, numFeaturesToConsider);

  const topFeaturesNames = singles.map(d => d.combo[0]);

  // median score for single features is threshold for pairs
  const pairsThreshold = d3.median(singles, d => d.score);

  // get all pairs of top N features that are above the threshold
  const allPairs = [...new Combination(topFeaturesNames, 2)]
    .map(combo => {
      const subsets = getData(features, combo, dataset);
      const filteredSubsets = filterSubsets(subsets, minSubsetSize);
      const score = metric(filteredSubsets);
      return { combo, score };
    })
  const pairs = allPairs.filter(({ score }) => score > pairsThreshold);

  // median score for pairs is threshold for trios
  const triosThreshold = d3.median(pairs, d => d.score);

  // get all trios of top N features that are above the threshold
  const allTrios = [...new Combination(topFeaturesNames, 3)]
    .map(combo => {
      const subsets = getData(features, combo, dataset);
      const filteredSubsets = filterSubsets(subsets, minSubsetSize);
      const score = metric(filteredSubsets);
      return { combo, score };
    })
  const trios = allTrios.filter(({ score }) => score > triosThreshold);

  const combos = [...singles, ...pairs, ...trios];
  combos.sort((a, b) => d3.descending(a.score, b.score));
  const combosNoScores = combos.map(d => d.combo);

  const endTime = performance.now();
  const ms = endTime - startTime;

  const totalCombosConsidered = allSingles.length + allPairs.length + allTrios.length;

  const info = {
    algorithm: 'top N feat, max 3',
    dataset: dataset.name,
    instances: dataset.size,
    metric: metricName,
    time: ms,
    numFeaturesToConsider: numFeaturesToConsider,
    combosReturned: combos.length,
    combosConsidered: totalCombosConsidered,
    combos: combos
  };

  return combosNoScores;
}
