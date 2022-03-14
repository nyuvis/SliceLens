import { filterSubsets, MetricName, Metrics, Rating } from './RatingMetrics';
import type {Features, ClassificationDataset, ClassificationNode, RegressionNode, Dataset} from './types';
import * as d3 from "d3";
import { getClassificationData, getRegressionData } from './lib/Data';

export { getFeatureRatings, getFeatureRatingsForMetric, normalize };

type Metric<T extends Dataset> = (data: Subset<T>[]) => number;
type Subset<T extends Dataset> = T extends ClassificationDataset ? ClassificationNode : RegressionNode;
type GetData<T extends Dataset> = (features: Features, selectedFeatures: string[], dataset: T) => Subset<T>[];

function getFeatureRatings(criterion: MetricName, metrics: Metrics, selected: string[], features: Features, dataset: Dataset): Map<string, number> {
  if (criterion === 'none') {
    return new Map();
  }

  const metric = metrics[criterion];

  if (dataset.type === 'classification' && metric.type === 'classification') {
    return normalize(getFeatureRatingsForMetric(dataset, metric.metric, selected, features, getClassificationData));
  } else if (dataset.type === 'regression' && metric.type === 'regression') {
    return normalize(getFeatureRatingsForMetric(dataset, metric.metric, selected, features, getRegressionData));
  } else {
    return new Map();
  }
}

function getFeatureRatingsForMetric<T extends Dataset>(
  dataset: T,
  metric: Metric<T>,
  selected: string[],
  features: Features,
  getData: GetData<T>,
  threshold: number = 30
): {feature: string, value: number}[] {
  const available: string[] = dataset.featureNames.filter(d => !selected.includes(d));

  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(features, sel, dataset);
    const filteredSubsets = filterSubsets(data, threshold)
    const value = metric(filteredSubsets);
    return {feature, value};
  });
}

// normalize values between 0 and 1
function normalize(ratings: Rating[]): Map<string, number> {
  if (!ratings) return new Map();

  const [min, max] = d3.extent(ratings, d => d.value);
  const diff = max - min;

  // avoid any divide by zero problems, such as if all ratings
  // have the same value or there is only one rating
  if (diff === 0) {
    return new Map(ratings.map(({feature}) => [feature, 1]));
  }

  return new Map(ratings.map(({feature, value}) => [feature, (value - min) / diff]));
}