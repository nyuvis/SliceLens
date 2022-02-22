import type { MetricName, Metrics, Rating } from './RatingMetrics';
import type {Features, Dataset} from './types';
import * as d3 from "d3";
import { getClassificationData, getRegressionData } from './lib/Data';

export { getFeatureRatings, normalize };

function getFeatureRatings(
  {criterion, selected, features, dataset}: {criterion: MetricName, selected: string[], features: Features, dataset: Dataset},
  metrics: Metrics
): Map<string, number> {
  if (criterion === 'none') {
    return new Map();
  }

  const available: string[] = dataset.featureNames.filter(d => !selected.includes(d));

  let ratings: Rating[] = [];

  if (dataset.type === 'classification') {
    if (criterion === 'entropy') {
      ratings = metrics.entropy({selected, features, dataset, available}, getClassificationData);
    } else if (criterion === 'errorCount') {
      ratings = metrics.errorCount({selected, features, dataset, available}, getClassificationData);
    } else if (criterion === 'errorPercent') {
      ratings = metrics.errorPercent({selected, features, dataset, available}, getClassificationData);
    } else if (criterion === 'errorDeviation') {
      ratings = metrics.errorDeviation({selected, features, dataset, available}, getClassificationData)
    }
  } else {
    if (criterion === 'random') {
      ratings = metrics.random({selected, features, dataset, available}, getRegressionData)
    }
  }

  return normalize(ratings);
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