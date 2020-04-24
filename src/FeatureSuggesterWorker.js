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

  if (criterion === 'purity') {
    return purity({selected, metadata, dataset, available});
  } else if (criterion === 'errorCount') {
    return errorCount({selected, metadata, dataset, available});
  } else if (criterion === 'errorPercent') {
    return errorPercent({selected, metadata, dataset, available});
  } else {
    return '';
  }
}

function purity({selected, metadata, dataset, available}) {
  let suggestion = '';
  let maxPurity = 0;

  available.forEach(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata, sel, dataset);
    const root = d3.hierarchy(data).sum(d => d.value);

    const purity = d3.sum(root.leaves(), d => {
      const counts = Array.from(d.data.counts.values());
      return d3.max(counts);
    }) / root.value;
    
    if (purity > maxPurity) {
      suggestion = feature;
      maxPurity = purity;
    }
  });

  return suggestion;
}

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
      return d3.sum(predictionResultsPerClass, p => p.has('incorrect') ? p.get('incorrect') : 0);
    });

    if (errors > maxError) {
      suggestion = feature;
      maxError = errors;
    }
  });

  return suggestion;
}

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
          0);
      return errorCount / d.value;
    });

    if (errors > maxError) {
      suggestion = feature;
      maxError = errors;
    }
  });

  return suggestion;
}