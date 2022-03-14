import { Combination } from 'js-combinatorics';
import { filterSubsets, MetricName, Metrics, Rating } from './RatingMetrics';
import type {Features, ClassificationDataset, ClassificationNode, RegressionNode, Dataset} from './types';
import * as d3 from "d3";
import { getClassificationData, getRegressionData } from './lib/Data';

export { getFeatureCombinations, getFeatureCombosForMetric };

type Metric<T extends Dataset> = (data: Subset<T>[]) => number;
type Subset<T extends Dataset> = T extends ClassificationDataset ? ClassificationNode : RegressionNode;
type GetData<T extends Dataset> = (features: Features, selectedFeatures: string[], dataset: T) => Subset<T>[];

function getFeatureCombinations(criterion: MetricName, metrics: Metrics, selected: string[], features: Features, dataset: Dataset): string[][] {
  if (criterion === 'none') {
    return [];
  }

  const metric = metrics[criterion];

  if (dataset.type === 'classification' && metric.type === 'classification') {
    return getFeatureCombosForMetric(dataset, metric.metric, selected, features, getClassificationData);
  } else if (dataset.type === 'regression' && metric.type === 'regression') {
    return getFeatureCombosForMetric(dataset, metric.metric, selected, features, getRegressionData);
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
  threshold: number = 30
): string[][] {
  const singles = dataset.featureNames
    .map(feature => {
      const subsets = getData(features, [feature], dataset);
      const filteredSubsets = filterSubsets(subsets, threshold);
      const score = metric(filteredSubsets);
      return { combo: [feature], score: score };
    })
    .sort((a, b) => d3.descending(a.score, b.score))
    .slice(0, 10);

  const topFeaturesNames = singles.map(d => d.combo[0]);

  const minScore1Feature = d3.mean(singles, d => d.score);

  const pairs = [...new Combination(topFeaturesNames, 2)]
    .map(combo => {
      const subsets = getData(features, combo, dataset);
      const filteredSubsets = filterSubsets(subsets, threshold);
      const score = metric(filteredSubsets);
      return { combo, score};
    })
    .filter(({ score }) => score > minScore1Feature );

  const minScore2Features = d3.mean(pairs, d => d.score);

  const trios = [...new Combination(topFeaturesNames, 3)]
    .map(combo => {
      const subsets = getData(features, combo, dataset);
      const filteredSubsets = filterSubsets(subsets, threshold);
      const score = metric(filteredSubsets);
      return { combo, score};
    })
    .filter(({ score }) => score > minScore2Features );

  const combos = [...singles, ...pairs, ...trios];
  combos.sort((a, b) => d3.descending(a.score, b.score));

  return combos.map(d => d.combo);
}
