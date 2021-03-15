import { getData } from './DataTransformer.js';

import * as d3 from "d3";


onmessage = e => {
  const t0 = performance.now();
  const featureToRelevance = getFeatureRatings(e.data);
  const t1 = performance.now();
  const [d, features, rows] = e.data.dataset.name.split('.')[0].split('-');
  // console.log(`${features},${rows},${e.data.selected.length},${e.data.criterion},${(t1 - t0).toFixed(2)}`);
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

  return new Map(ratings.map(({feature, value}) => [feature, (value - min) / diff]));
}

/*
  Return the feature that results in the nodes with the
  lowest average entropy.
*/
function entropy({selected, metadata, dataset, available}) {
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

  function H(square) {
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
function errorDeviation({selected, metadata, dataset, available}) {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);

    const value = -d3.deviation(data, d => getErrorCountForSquare(d) / d.size);

    return {feature, value};
  });
}

/*
  Give a higher rating to features that result in the
  single nodes that have the higher number of errors
*/
function errorCount({selected, metadata, dataset, available}) {
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
function errorPercent({selected, metadata, dataset, available}) {
  return available.map(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);

    const value = d3.max(data, d => getErrorCountForSquare(d) / d.size);

    return {feature, value};
  });
}

function getErrorCountForSquare(square) {
  // one Map per class
  const predictionResultsPerClass = Array.from(square.predictionResults.values());
  // get sum of incorrect predictions for each class
  const errorCount = d3.sum(predictionResultsPerClass,
    p => p.has('incorrect') ?
      p.get('incorrect') :
      0
  );

  return errorCount;
}