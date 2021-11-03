import {
  entropy,
  errorDeviation,
  errorCount,
  errorPercent
} from './RatingMetrics.js';

import * as d3 from "d3";

export { getRecommendedSubsets };

const criteria = {
  entropy,
  errorDeviation,
  errorCount,
  errorPercent
}

function getRecommendedSubsets({criterion, selected, metadata, dataset}) {
  const available = metadata.featureNames.filter(d => !selected.includes(d));
  const subsets = d3.shuffle(getPermutations(available, 2)).slice(0, 10);

  if (!selected) {
    return subsets;
  }

  return subsets.map(s => [...selected, ...s]);

  // let ratings = [];

  // if (criterion === 'entropy') {
  //   ratings = entropy({selected, metadata, dataset, available});
  // } else if (criterion === 'errorCount') {
  //   ratings = errorCount({selected, metadata, dataset, available});
  // } else if (criterion === 'errorPercent') {
  //   ratings = errorPercent({selected, metadata, dataset, available});
  // } else if (criterion === 'errorDeviation') {
  //   ratings = errorDeviation({selected, metadata, dataset, available})
  // }

  // return normalize(ratings);
}


function getPermutations(array, size) {
  function p(t, i) {
      if (t.length === size) {
          result.push(t);
          return;
      }
      if (i + 1 > array.length) {
          return;
      }
      p(t.concat(array[i]), i + 1);
      p(t, i + 1);
  }

  var result = [];
  p([], 0);
  return result;
}