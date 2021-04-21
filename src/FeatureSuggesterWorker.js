import {
  entropy,
  errorDeviation,
  errorCount,
  errorPercent
} from './RatingMetrics.js';

import * as d3 from "d3";

export { getFeatureRatings, normalize };

self.onmessage = e => {
  const featureToRelevance = getFeatureRatings(e.data);
  postMessage(featureToRelevance);
}

function getFeatureRatings({criterion, selected, metadata, dataset}) {
  if (criterion === 'none') {
    return new Map();
  }

  const available = metadata.featureNames.filter(d => !selected.includes(d));

  let ratings = [];

  if (criterion === 'entropy') {
    ratings = entropy({selected, metadata, dataset, available});
  } else if (criterion === 'errorCount') {
    ratings = errorCount({selected, metadata, dataset, available});
  } else if (criterion === 'errorPercent') {
    ratings = errorPercent({selected, metadata, dataset, available});
  } else if (criterion === 'errorDeviation') {
    ratings = errorDeviation({selected, metadata, dataset, available})
  }

  return normalize(ratings);
}

// normalize values between 0 and 1
function normalize(ratings) {
  if (!ratings) return new Map();

  const [min, max] = d3.extent(ratings, d => d.value);
  const diff = max - min;

  // avoid any divide by zero problems, such as if all ratings
  // have the same value or there is only one rating
  if (diff === 0) {
    return new Map(ratings.map(({feature, value}) => [feature, 1]));
  }

  return new Map(ratings.map(({feature, value}) => [feature, (value - min) / diff]));
}