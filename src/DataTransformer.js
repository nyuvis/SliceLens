import * as d3 from "d3";

export {
  cloneSelectedFeaturesMetadata,
  equalIntervalThresholds,
  quantileThresholds,
  getMetadata,
  getData,
  getBinLabels,
  getFilteredDataset,
  isNumeric,
  getWholeDatasetFeatureExtents,
  cloneFilters,
  addSelectedSetToFilters,
};

function cloneSelectedFeaturesMetadata(features, selectedFeatures) {
  const copyOfFeatures = {};

  selectedFeatures.forEach(featureName => {
    const feature = features[featureName];

    const copy = {
      name: feature.name,
      type: feature.type,
      values: [...feature.values],
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

    copyOfFeatures[featureName] = copy;
  });

  return copyOfFeatures;
}

function cloneFilters(filters) {
  return filters.map(filter => {
    const copy = {
      feature: filter.feature,
      type: filter.type,
      valid: filter.valid,
    };

    if (filter.type === 'Q') {
      copy.min = filter.min;
      copy.max = filter.max;
      copy.rightInclusive = filter.rightInclusive;
    } else {
      copy.selected = [...filter.selected];
    }

    return copy;
  });
}

function addSelectedSetToFilters(filters) {
  filters.forEach(filter => {
    if (filter.type === 'C') {
      filter.selectedSet = new Set(filter.selected);
    }
  });

  return filters;
}

function getWholeDatasetFeatureExtents(md) {
  return Object.fromEntries(
    Object.entries(md.features).map(([name, feature]) => {
      const copy = {
        type: feature.type,
      };

      if (feature.type === "Q") {
        copy.extent = [...feature.extent];
      } else {
        copy.categories = [...feature.categories];
      }

      return [name, copy];
    })
  );
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
  return d3.scaleQuantile()
    .domain(values)
    .range(d3.range(numBins))
    .quantiles();
}

function getMetadata(dataset) {
  if (!dataset || !dataset.columns) {
    return null;
  }

  const cols = dataset.columns;

  const labelValues = Array.from(new Set(dataset.map(d => d['label']))).sort();

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
      // values are the names of the groups
      feature.values = uniqueValues;
      feature.categories = uniqueValues;
      // by default, each value is in its own group
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
    size: dataset.length,
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
  });
}

// https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
function isNumeric(str) {
  return !isNaN(str) && !isNaN(parseFloat(str));
}

function getFilteredDataset(dataset, filters) {
  if (filters.length === 0) {
    return dataset;
  }

  const filtered = dataset.filter(row => {
    for (let i = 0; i < filters.length; i++) {
      const filt = filters[i];
      const value = row[filt.feature];

      if (filt.type === 'Q') {
        if (value < filt.min) {
          return false;
        }

        if (filt.rightInclusive) {
          if (value > filt.max) {
            return false;
          }
        } else {
          if (value >= filt.max) {
            return false;
          }
        }
      } else if (!filt.selectedSet.has(value)) {
        return false;
      }
    }

    return true;
  });

  filtered.columns = dataset.columns;
  filtered.name = dataset.name;

  return filtered;
}