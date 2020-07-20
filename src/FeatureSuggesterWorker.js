import { getData } from './DataTransformer.js';

import * as d3_array from "d3-array";
import * as d3_all from "d3";

const d3 = {...d3_all, ...d3_array,};


onmessage = e => {
  const suggestion = getSuggestedFeature(e.data);
  postMessage(suggestion);
}

function getSuggestedFeature({criterion, selected, metadata, dataset}) {
  if (criterion === 'none') {
    return '';
  }

  const available = metadata.featureNames.filter(d => !selected.includes(d));

  if (criterion === 'entropy') {
    return entropy({selected, metadata, dataset, available});
  } else if (criterion === 'errorCount') {
    return errorCount({selected, metadata, dataset, available});
  } else if (criterion === 'errorPercent') {
    return errorPercent({selected, metadata, dataset, available});
  } else {
    return '';
  }
}

/*
  Return the feature that results in the nodes with the
  lowest average entropy.
*/
function entropy({selected, metadata, dataset, available}) {
  let suggestion = '';
  let minEntropy = Number.POSITIVE_INFINITY;

  available.forEach(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);
    const root = d3.hierarchy(data).sum(d => d.value);

    const ent = d3.sum(root.leaves(), square => {
      const weight = square.value / root.value;
      return weight * H(square);
    });

    if (ent < minEntropy) {
      suggestion = feature;
      minEntropy = ent;
    }
  });

  return suggestion;

  function H(square) {
    return -d3.sum(square.data.counts.values(), v => {
      const p = v / square.value;
      return p * Math.log2(p);
    });
  }
}

/*
  Return the feature that results in the single node that has
  the highest number of errors.
*/
function errorCount({selected, metadata, dataset, available}) {
  let suggestion = '';
  let maxError = 0;

  available.forEach(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);
    const root = d3.hierarchy(data).sum(d => d.value);

    const errors = d3.max(root.leaves(), d => {
      // one Map per class
      const predictionResultsPerClass = Array.from(d.data.predictionResults.values());
      // get sum of incorrect predictions for each class
      return d3.sum(predictionResultsPerClass,
        p => p.has('incorrect') ?
          p.get('incorrect') :
          0
      );
    });

    if (errors > maxError) {
      suggestion = feature;
      maxError = errors;
    }
  });

  return suggestion;
}

/*
  Return the feature that results in the single node that has
  the highest percent of errors.
*/
function errorPercent({selected, metadata, dataset, available}) {
  let suggestion = '';
  let maxError = 0;

  available.forEach(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);
    const root = d3.hierarchy(data).sum(d => d.value);

    const errors = d3.max(root.leaves(), d => {
      const predictionResultsPerClass = Array.from(d.data.predictionResults.values());
      const errorCount = d3.sum(predictionResultsPerClass,
        p => p.has('incorrect') ?
          p.get('incorrect') :
          0
      );
      return errorCount / d.value;
    });

    if (errors > maxError) {
      suggestion = feature;
      maxError = errors;
    }
  });

  return suggestion;
}