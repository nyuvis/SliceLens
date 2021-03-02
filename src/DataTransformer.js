import * as d3 from "d3";

export {
  cloneMetadata,
  equalIntervalThresholds,
  quantileThresholds,
  getMetadata,
  getData,
  getBinLabels,
};

function cloneMetadata(md) {
  const features = Object.entries(md.features)
    .map(([name, feature]) => {
      const copy = {
        name: feature.name,
        type: feature.type,
        values: feature.values,
      };

      if (feature.type === 'Q') {
        copy.extent = [...feature.extent];
        copy.splitType = feature.splitType;
        copy.numBins = feature.numBins;
        copy.thresholds = [...feature.thresholds];
        copy.format = feature.format;
      } else {
        copy.categories = [...feature.categories];
        copy.valueToGroup = Object.assign({}, feature.valueToGroup);
      }

      return [name, copy];
    });

  return {
    features: Object.fromEntries(features),
    featureNames: [...md.featureNames],
    labelValues: [...md.labelValues],
    hasPredictions: md.hasPredictions,
  };
}

function getBinLabels(bins, format) {
  const n = bins.length;
  return bins.map((bin, i) => {
    // the right endpoint of the last bin is inclusive
    const closing = i === n - 1 ?
      ']' :
      ')';
    return `[${format(bin.x0)}, ${format(bin.x1)}${closing}`;
  });
}

function equalIntervalThresholds([min, max], numBins) {
  const binSize = (max - min) / numBins;
  const thresholds = d3.range(1, numBins)
      .map(d => min + d * binSize);
  return thresholds;
}

function quantileThresholds(values, numBins) {
  return d3.range(1, numBins)
      .map(d => d3.quantile(values, d / numBins));
}

function getMetadata(dataset) {
  if (!dataset || !dataset.columns) {
    return null;
  }

  const cols = dataset.columns;

  const labelValues = Array.from(new Set(dataset.map(d => d['label'])));

  const featureNames = cols.filter(d => d !== 'label' && d !== 'prediction');
  const hasPredictions = cols.includes('prediction');

  const features = featureNames.reduce((acc, val) => {
    const values = dataset.map(d => d[val]);
    const uniqueValues = Array.from(new Set(values)).sort();
    const feature = {
      name: val
    };

    const areNumbers = Array.from(uniqueValues).every(d => !isNaN(d));

    if (areNumbers && uniqueValues.length > 5) {
      const numBins = 3;
      const splitType = 'interval';
      const extent = d3.extent(values);
      const thresholds = equalIntervalThresholds(extent, numBins);

      const bin = d3.bin()
        .domain(extent)
        .thresholds(thresholds);
      const bins = bin(values);
      const formatSpecifier = '.2~f';
      const featureValueLabels = getBinLabels(bins, d3.format(formatSpecifier));

      feature.extent = extent;
      feature.splitType = splitType;
      feature.numBins = numBins;
      feature.thresholds = thresholds;
      feature.values = featureValueLabels;
      feature.format = formatSpecifier;
      feature.type = 'Q';
    } else {
      feature.values = uniqueValues;
      feature.categories = uniqueValues;
      feature.valueToGroup = Object.fromEntries(d3.zip(uniqueValues, uniqueValues));
      feature.type = 'C';
    }

    acc[val] = feature;

    return acc;
  }, {});

  return {
    features: features,
    featureNames: featureNames,
    labelValues: labelValues,
    hasPredictions: hasPredictions,
    size: dataset.length
  }
}

function getData(metadata, selectedFeatures, dataset) {
  if (metadata === null) {
    return null;
  }

  function reducer(g) {
    const groundTruth = d3.rollup(g, v => v.length, d => d.label);
    const node = { groundTruth };
    if (metadata.hasPredictions) {
      // if the dataset has model predictions,
      // also count the number of each prediction
      // and the amount correct and incorrect
      const predictionCounts = d3.rollup(g, v => v.length, d => d.prediction);

      const predictionResults = d3.rollup(
        g,
        v =>
          d3.rollup(
            v,
            g => g.length,
            p => p.prediction === p.label ? "correct" : "incorrect"
          ),
        d => d.prediction
      );

      node['predictionCounts'] = predictionCounts;
      node['predictionResults'] = predictionResults;
    }
    node['size'] = g.length;
    return node;
  }

  function key(d) {
    return selectedFeatures
      .map(f => {
        const feat = metadata.features[f];
        if (feat.type === "Q") {
          return d3.bisect(feat.thresholds, d[f]);
        } else if (feat.type === "C") {
          return feat.values.indexOf(feat.valueToGroup[d[f]]);
        }
      })
      .join(",");
  }

  return d3.rollups(dataset, reducer, key)
    .map(([key, value]) => {
    const splits = new Map(d3.zip(selectedFeatures, key.split(',').map(d => +d)));
    value['splits'] = splits;
    return value;
  })
}

function getDataOld(metadata, selectedFeatures, dataset) {
  if (metadata === null) {
    return null;
  }

  console.log(dataset);

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
        const groups = d3.group(data, d => nextFeature.valueToGroup[d[nextFeatureName]]);
        splits = nextFeature.values.map(d => [d, groups.get(d)])
          .filter(([value, group]) => group !== undefined && group !== null && group.length !== 0);
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
