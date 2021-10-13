import * as d3 from "d3";
import {kernelDensityEstimation} from 'simple-statistics'

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
  getScales,
  getPositionOfSquare,
  getTooltipAmounts,
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

/* crete copies of each filter. for categorical filters, do not
  copy the selectedSet property, which can't be turned into JSON*/
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

/* after reading filters from JSON, the selectedSet needs to be
  added, since it is not in the JSON */
function addSelectedSetToFilters(filters) {
  filters.forEach(filter => {
    if (filter.type === 'C') {
      filter.selectedSet = new Set(filter.selected);
    }
  });

  return filters;
}

/* for categorical features, get the unique feature values
   for quantiative features, get the min and max values */
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

/* given the bins and a format function for a quantitative feature
   return the ranges of the bins as strings, which are used as labels
   in the visualiztion */
function getBinLabels(bins, format) {
  const n = bins.length;
  return bins.map((bin, i) => {
    // the right endpoint of the last bin is inclusive
    const closing = (i === n - 1) ? ']' : ')';
    return `[${format(bin.x0)}, ${format(bin.x1)}${closing}`;
  });
}

/*
  Following the convetion used by d3.bin https://github.com/d3/d3-array#bin,
  the lower bounds of all bins are inclusive and the upper bound of all bins
  except the last one are exclusive. The lower bound of the first bin is always
  the min value and the upper bound of the last bin is always the max value.

  "Thresholds are defined as an array of values [x0, x1, …].
  Any value less than x0 will be placed in the first bin;
  any value greater than or equal to x0 but less than x1
  will be placed in the second bin; and so on.
  Thus, the generated bins will have thresholds.length + 1 bins."

  min  t0  t1  t2  t3  max
     b0  b1  b2  b3  b4
*/

/* given the extent of a quantiative feature and the number of bins
   return evenly spaced thresholds. this will give equal-width bins.
   this could be replaced with d3.scaleQuantize maybe */
function equalIntervalThresholds([min, max], numBins) {
  // width of each bin
  const binSize = (max - min) / numBins;
  const thresholds = d3.range(1, numBins)
      .map(d => min + d * binSize);
  return thresholds;
}

/* given all values of a quantitative feature and the number of bins
 return thresholds for equal-frequency bins */
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

  const allLabels = dataset.map(d => d['label']);
  const labelValues = Array.from(new Set(allLabels)).sort(d3.ascending);

  const featureNames = cols.filter(d => d !== 'label' && d !== 'prediction');
  const hasPredictions = cols.includes('prediction');

  /*
    If the dataset has more than 10 unique labels and those labels are all
    numbers, then it is a regression dataset. Otherwise, it is classification.
  */
  const isRegression = labelValues.length > 10 && labelValues.every(isNumeric);

  /*
  categorical features:
  - name: string
  - values: array of primitive values
  - categories: array of primitive values
  - valueToGroup: map from primitive to primitive
  - type: string

  quantitative features:
  - name: string
  - extent: array of numbers
  - splitType: string
  - numBins: int
  - thresholds: array of numbers
  - values: array of strings
  - format: string
  - type: string
  */
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
      // values contains the labels for the bins
      feature.values = featureValueLabels;
      feature.format = formatSpecifier;
      feature.type = 'Q';
    } else {
      // values are the names of the groups
      feature.values = uniqueValues;
      feature.categories = [...uniqueValues];
      // by default, each value is in its own group
      feature.valueToGroup = Object.fromEntries(d3.zip(uniqueValues, uniqueValues));
      feature.type = 'C';
    }

    acc[val] = feature;

    return acc;
  }, {});

  const md = {
    isRegression: isRegression,
    features: features,
    featureNames: featureNames,
    hasPredictions: hasPredictions,
    size: dataset.length,
  };

  if (isRegression) {

    md.labelExtent = d3.extent(allLabels);
    const xScaleLabel = d3.scaleLinear()
        .domain(md.labelExtent).nice();

    const binLabel = d3.bin()
        .domain(xScaleLabel.domain())
        .thresholds(xScaleLabel.ticks(20));

    md.labelDomain = binLabel.domain()();
    md.labelThresholds = binLabel.thresholds()();

    if (hasPredictions) {
      const allPredictions = dataset.map(d => d['prediction']);
      md.predictionExtent = d3.extent(allPredictions);
      const deltas = d3.zip(allLabels, allPredictions).map(([label, pred]) => label - pred);
      const maxDiff = d3.max(deltas, d => Math.abs(d));
      md.deltaExtent = [-maxDiff, 0, maxDiff];

      const xScaleDelta = d3.scaleDiverging()
          .domain(md.deltaExtent).nice();

      const binDelta = d3.bin()
          .domain([xScaleDelta.domain()[0], xScaleDelta.domain()[2]])
          .thresholds(xScaleDelta.ticks(20));

      md.deltaDomain = binDelta.domain()();
      md.deltaThresholds = binDelta.thresholds()();
    }
  } else {
    md.labelValues = labelValues;
  }

  return md;
}

function getData(metadata, selectedFeatures, dataset) {
  if (metadata === null) {
    return null;
  }

  if (metadata.isRegression) {
    return getDataRegression(metadata, selectedFeatures, dataset);
  } else {
    return getDataClassification(metadata, selectedFeatures, dataset);
  }
}

function getDataRegression(metadata, selectedFeatures, dataset) {
  // g is an array of all of the instances belonging to the same subset
  function reducer(g) {
    const node = {
      size: g.length,
      labels: g.map(d => d.label)
    };

    // const count = 100;
    // const thresholds = d3.ticks(...d3.nice(...metadata.targetExtent, count), count);

    // const labelPDF = kernelDensityEstimation(node.labels);
    // node.labelDensities = thresholds.map(t => ({ target: t, density: labelPDF(t) }));

    const binLabel = d3.bin()
        .domain(metadata.labelDomain)
        .thresholds(metadata.labelThresholds);

    node.labelBins = binLabel(node.labels)
        .map(b => ({ x0: b.x0, x1: b.x1, count: b.length, mid: d3.mean([b.x0, b.x1]) }))
        .filter(b => b.x0 !== b.x1);

    node.labelSlices = new Map(node.labelBins.map((b, i) => [i, { count: b.count, mid: b.mid }]));

    if (metadata.hasPredictions) {
      node.predictions = g.map(d => d.prediction);
      node.deltas = g.map(d => d.prediction - d.label);

      // const targetPDF = kernelDensityEstimation(node.predictions);
      // node.targetDensities = thresholds.map(t => ({ value: t, density: targetPDF(t) }));

      // node.predictionBins = bin(node.predictions)
      //     .map(b => ({ x0: b.x0, x1: b.x1, count: b.length}))
      //     .filter(b => b.x0 !== b.x1);
      const binDelta = d3.bin()
        .domain(metadata.deltaDomain)
        .thresholds(metadata.deltaThresholds);

      node.deltaBins = binDelta(node.deltas)
        .map(b => ({ x0: b.x0, x1: b.x1, count: b.length, mid: d3.mean([b.x0, b.x1])}))
        .filter(b => b.x0 !== b.x1);

      node.deltaSlices = new Map(node.deltaBins.map((b, i) => [i, { count: b.count, mid: b.mid }]));

      node.deltaThresholds = binDelta.thresholds()();
    }

    return node;
  }

  /* return the key that is used to group an instance
     Ex: 0-2-1 means the first bin for the first selected feature,
     the third bin for the second selected feature, and the second
     bin for the third selected feature. */
  function key(d) {
    return selectedFeatures
      .map(featureName => {
        const feat = metadata.features[featureName];
        if (feat.type === "Q") {
          /* d3.bisect(array, x): "returns an insertion point which comes after
            (to the right of) any existing entries of x in array"

            if the instance's value for this feature is less than the first
            threshold, then 0 is returned. if it's less than the second threshold,
            then one is returned, etc.
          */
          return d3.bisect(feat.thresholds, d[featureName]);
        } else if (feat.type === "C") {
          /* values contains the names of the groups/bins */
          return feat.values.indexOf(feat.valueToGroup[d[featureName]]);
        }
      })
      .join(",");
  }

  return d3.rollups(dataset, reducer, key)
    .map(([key, value]) => {
    // splits is a map from the name of the selected feature
    // to the subset's bin index
    // this is done after since reducer doesn't have access to group's key
    const splits = new Map(d3.zip(selectedFeatures, key.split(',').map(d => +d)));
    value['splits'] = splits;
    return value;
  });
}

function getDataClassification(metadata, selectedFeatures, dataset) {
  // g is an array of all of the instances belonging to the same subset
  function reducer(g) {
    // map from ground truth label to number of instances with that label
    const groundTruth = d3.rollup(g, v => v.length, d => d.label);

    const node = {
      groundTruth,
      size: g.length
    };

    if (metadata.hasPredictions) {
      // if the dataset has model predictions,
      // also count the number of each prediction
      // and the amount correct and incorrect

      // map from predicted label to number of instances with that prediction
      const predictionCounts = d3.rollup(g, v => v.length, d => d.prediction);

      // map from predicted label to map from "correct" or "incorrect" to count
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

    return node;
  }

  /* return the key that is used to group an instance
     Ex: 0-2-1 means the first bin for the first selected feature,
     the third bin for the second selected feature, and the second
     bin for the third selected feature. */
  function key(d) {
    return selectedFeatures
      .map(featureName => {
        const feat = metadata.features[featureName];
        if (feat.type === "Q") {
          /* d3.bisect(array, x): "returns an insertion point which comes after
            (to the right of) any existing entries of x in array"

            if the instance's value for this feature is less than the first
            threshold, then 0 is returned. if it's less than the second threshold,
            then one is returned, etc.
          */
          return d3.bisect(feat.thresholds, d[featureName]);
        } else if (feat.type === "C") {
          /* values contains the names of the groups/bins */
          return feat.values.indexOf(feat.valueToGroup[d[featureName]]);
        }
      })
      .join(",");
  }

  return d3.rollups(dataset, reducer, key)
    .map(([key, value]) => {
    // splits is a map from the name of the selected feature
    // to the subset's bin index
    // this is done after since reducer doesn't have access to group's key
    const splits = new Map(d3.zip(selectedFeatures, key.split(',').map(d => +d)));
    value['splits'] = splits;
    return value;
  });
}

/* https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
   return true if the passed value is a number and false otherwise */
function isNumeric(x) {
  return !isNaN(x) && !isNaN(parseFloat(x));
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

/* functions for positioning the squares in the matrix */

/* returns an array of scales for the given features
   space is the width or height of the matrix */
function getScales(selectedFeatures, space, reverse) {
  return selectedFeatures.map((feat) => {
    const domain = d3.range(feat.values.length);

    // reverse order for y-axis features
    if (reverse) {
      domain.reverse();
    }

    // range for every scale starts at 0
    const scale = d3.scaleBand().domain(domain).range([0, space]);

    // space for next scale is the band width of the current scale
    space = scale.bandwidth();

    return scale;
  });
}

/* d is the data for a given square */
function getPositionOfSquare(d, features, scales) {
  // get the bin index for each feature
  // d.splits is a map from the name of the selected feature to the subset's bin index
  // Ex. age -> 1, height -> 2
  const splits = features.map((feat) => d.splits.get(feat.name));

  // adding together the position for each feature gives the position of the square
  return d3.sum(
    d3.zip(scales, splits),
    ([scale, split]) => scale(split)
  );
}

/* tooltip data */

function getTooltipAmounts(showPredictions, d, percentFormat) {
  if (showPredictions) {
    return (
      Array.from(d.predictionResults)
        // sort by predicted label
        .sort((a, b) => d3.ascending(a[0], b[0]))
        .map(([label, counts]) =>
          Array.from(counts, ([correct, count]) => ({
            label: `${label} (${correct})`,
            count: count,
            percent: percentFormat(count / d.size),
            stripes: correct === "incorrect",
            colorLabel: label,
            // put incorrect before correct to match order of layers in square
          })).sort((a, b) => d3.descending(a.label, b.label))
        )
        .flat()
    );
  } else {
    return Array.from(d.groundTruth, ([label, count]) => ({
      label,
      count,
      percent: percentFormat(count / d.size),
      stripes: false,
      colorLabel: label,
    })).sort((a, b) => d3.ascending(a.label, b.label));
  }
}