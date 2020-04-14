import { getData } from './DataTransformer.js';

import * as d3_array from "d3-array";
import * as d3_all from "d3";

const d3 = {...d3_array, ...d3_all};


onmessage = e => {
  const suggestion = getSuggestedFeature(e.data);
  postMessage(suggestion);
}

function getSuggestedFeature({criterion, selected, metadata, dataset}) {
  if (criterion === 'none') {
    return '';
  }

  const available = metadata.featureNames.filter(d => !selected.includes(d));

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