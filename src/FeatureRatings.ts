import type { Metric, Rating } from './RatingMetrics';
import type {Metadata, Dataset} from './types';
import * as d3 from "d3";
import { getData } from './DataTransformer';

export { getFeatureRatings, normalize };

function getFeatureRatings(
  {criterion, selected, metadata, dataset}: {criterion: any, selected: string[], metadata: Metadata, dataset: Dataset},
  { entropy, errorDeviation, errorCount, errorPercent }: Record<string,Metric>
): Map<string, number> {
  if (criterion === 'none') {
    return new Map();
  }

  const available: string[] = metadata.featureNames.filter(d => !selected.includes(d));

  let ratings: Rating[] = [];

  if (criterion === 'entropy') {
    ratings = entropy({selected, metadata, dataset, available}, getData);
  } else if (criterion === 'errorCount') {
    ratings = errorCount({selected, metadata, dataset, available}, getData);
  } else if (criterion === 'errorPercent') {
    ratings = errorPercent({selected, metadata, dataset, available}, getData);
  } else if (criterion === 'errorDeviation') {
    ratings = errorDeviation({selected, metadata, dataset, available}, getData)
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