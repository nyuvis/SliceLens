import * as d3_array from "d3-array";
import * as d3_all from "d3";

const d3 = {...d3_array, ...d3_all};

export { getMetadata, getData };

function getMetadata(featureNames, dataset, label, splitType) {
  const labelValues = Array.from(new Set(dataset.map(d => d[label])));

  const numBins = 3;
  const verbs = ['low', 'medium', 'high'];

  const features = featureNames.reduce((acc, val) => {
    const values = dataset.map(d => d[val]);
    const feature = {
      name: val
    };

    if (!isNaN(values[0])) {
      feature.type = 'Q';
      feature.values = verbs;
      
      const extent = d3.extent(values);
      
      const equalInterval = d3.bin()
          .value(d => d[val])
          .domain(extent)
          .thresholds(equalIntervalThresholds(extent));
      
      const quantiles = d3.bin()
          .value(d => d[val])
          .domain(extent)
          .thresholds(quantileThresholds(values));

      feature.split = data => {
        if (splitType === 'interval') {
          return equalInterval(data);
        } else {
          return quantiles(data);
        }
      }
    } else if (values[0] instanceof Date) {
      feature.type = 'T';
    } else {
      feature.values = Array.from(new Set(values));
      feature.type = 'C';
      feature.split = data => {
        return d3.groups(data, d => d[val]).map(d => d[1]);
      }
    }

    acc[val] = feature;

    return acc;
  }, {});

  return {
    'features': features,
    'label': label,
    'labelValues': labelValues,
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

function getData(features, selectedFeatures, dataset) {
  return splitData(dataset, 0, '', '');
      
  function splitData(data, index, splitFeature, splitLabel) {
    const counts = d3.rollup(data, v => v.length, d => d.label);

    const node = {counts, splitFeature, splitLabel};

    if (index < selectedFeatures.length) {
      const nextFeatureName = selectedFeatures[index];
      const nextFeature = features[nextFeatureName];
      const splits = nextFeature.split(data);

      node.children = splits
          .map((d, i) => splitData(d, index + 1, nextFeatureName, nextFeature.values[i]))
          .filter(d => d !== undefined);
    } else {
      node.value = data.length;
    }

    return node;
  }
}