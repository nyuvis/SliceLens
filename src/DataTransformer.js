import * as d3_array from "d3-array";
import * as d3_all from "d3";

const d3 = {...d3_all, ...d3_array,};

export { getMetadata, getData };

function getMetadata(dataset, splitType, numBins) {
  if (!dataset || !dataset.columns) {
    return null;
  }

  const cols = dataset.columns;

  const label = 'label';
  const labelValues = Array.from(new Set(dataset.map(d => d[label])));

  const featureNames = cols.filter(d => d !== 'label' && d !== 'prediction');
  const hasPredictions = cols.includes('prediction');

  const features = featureNames.reduce((acc, val) => {
    const values = dataset.map(d => d[val]);
    const uniqueValues = Array.from(new Set(values)).sort();
    const feature = {
      name: val
    };

    if (uniqueValues.length <= 5) {
      feature.values = uniqueValues;
      feature.type = 'C';
    } else if (!isNaN(values[0])) {
      feature.type = 'Q';

      const extent = d3.extent(values);
      feature.extent = extent;

      if (splitType === 'interval') {
        feature.thresholds = equalIntervalThresholds(extent);
      } else {
        feature.thresholds = quantileThresholds(values);
      }
      const format = d3.format(".2~f");
      feature.values = d3.pairs(
        [extent[0], ...feature.thresholds, extent[1]],
        (a, b) => `[${format(a)}, ${format(b)})`
      );

    } else if (values[0] instanceof Date) {
      feature.type = 'T';
      // TODO: handle dates
    } else {
      feature.values = uniqueValues;
      feature.type = 'C';
    }

    acc[val] = feature;

    return acc;
  }, {});

  return {
    features: features,
    featureNames: featureNames,
    label: label,
    labelValues: labelValues,
    hasPredictions: hasPredictions,
  }

  function equalIntervalThresholds([min, max]) {
    const binSize = (max - min) / numBins;
    const thresholds = d3.range(1, numBins)
        .map(d => min + d * binSize);
    return thresholds;
  }

  function quantileThresholds(values) {
    return d3.range(1, numBins)
        .map(d => d3.quantile(values, d / numBins));
  }
}

function getData(metadata, selectedFeatures, dataset) {
  if (metadata === null) {
    return null;
  }

  return splitData(dataset, 0, '', '');

  function splitData(data, index, splitFeature, splitLabel) {
    // count number of instances for each ground truth label
    const counts = d3.rollup(data, v => v.length, d => d.label);

    const node = {counts, splitFeature, splitLabel};

    if (metadata.hasPredictions) {
      // if the dataset has model predictions, also count the number of each prediction
      // and the amount correct and incorrect
      const predictionCounts = d3.rollup(data, v => v.length, d => d.prediction);

      const predictionResults = d3.rollup(data,
        v => d3.rollup(v, g => g.length, p => {
          if (p.prediction === p.label) {
            return 'correct';
          } else {
            return 'incorrect';
          }
        }),
        d => d.prediction);

      node.predictionCounts = predictionCounts;
      node.predictionResults = predictionResults;
    }

    // if there are more features to split on
    if (index < selectedFeatures.length) {
      const nextFeatureName = selectedFeatures[index];
      const nextFeature = metadata.features[nextFeatureName];
      let splits;

      if (nextFeature.type === 'Q') {
        const bin = d3.bin()
            .value(d => d[nextFeatureName])
            .domain(nextFeature.extent)
            .thresholds(nextFeature.thresholds);
        const bins = bin(data);
        splits = d3.zip(nextFeature.values, bins);
      } else if (nextFeature.type === 'C') {
        splits = d3.groups(data, d => d[nextFeatureName]);
      }

      node.children = splits
          .map(([label, d]) => splitData(d, index + 1, nextFeatureName, label))
          .filter(d => d !== undefined);
    } else {
      node.value = data.length;
    }

    return node;
  }
}
