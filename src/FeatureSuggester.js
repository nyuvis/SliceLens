import {getMetadata, getData} from './DataTransformer.js';

import * as d3_array from "d3-array";
import * as d3_all from "d3";

const d3 = {...d3_array, ...d3_all};

export { getSuggestedFeature };

function getSuggestedFeature(featureNames, selected, dataset, label, splitType, criterion) {
  const available = featureNames.filter(d => !selected.includes(d));

  if (available.length === 0) {
    return '';
  }

  const metadata = getMetadata(featureNames, dataset, label, splitType);

  let suggestion = '';
  let maxPurity = 0;

  available.forEach(feature => {
    const sel = [...selected, feature];
    const data = getData(metadata.features, sel, dataset);
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