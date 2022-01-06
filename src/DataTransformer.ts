import * as d3 from "d3";
import type { QuantitativeFeature, CategoricalFeature, Feature, Metadata, Dataset, Row, Node, Filter, FeatureExtent, TooltipData} from "./types";

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
  parseDataset,
};

function cloneSelectedFeaturesMetadata(features: Record<string, Feature>, selectedFeatures: string[]): Record<string, Feature> {
  const copyOfFeatures = {};

  selectedFeatures.forEach(featureName => {
    const feature = features[featureName];

    if (feature.type === 'Q') {
      const copy: QuantitativeFeature = {
        name: feature.name,
        type: feature.type,
        values: [...feature.values],
        extent: [...feature.extent],
        splitType: feature.splitType,
        numBins: feature.numBins,
        thresholds: [...feature.thresholds],
        format: feature.format
      };

      copyOfFeatures[featureName] = copy;

    } else {
      const copy: CategoricalFeature = {
        name: feature.name,
        type: feature.type,
        values: [...feature.values],
        categories: [...feature.categories],
        valueToGroup: Object.assign({}, feature.valueToGroup)
      }

      copyOfFeatures[featureName] = copy;
    }

  });

  return copyOfFeatures;
}

/* crete copies of each filter. for categorical filters, do not
  copy the selectedSet property, which can't be turned into JSON*/
function cloneFilters(filters: Filter[]): Filter[] {
  return filters.map(filter => {
    if (filter.type === 'Q') {
      return {
        feature: filter.feature,
        type: filter.type,
        valid: filter.valid,
        min: filter.min,
        max: filter.max,
        rightInclusive: filter.rightInclusive
      }
    } else {
      return {
        feature: filter.feature,
        type: filter.type,
        valid: filter.valid,
        selected: [...filter.selected]
      }
    }
  });
}

/* after reading filters from JSON, the selectedSet needs to be
  added, since it is not in the JSON */
function addSelectedSetToFilters(filters: Filter[]) {
  filters.forEach(filter => {
    if (filter.type === 'C') {
      filter.selectedSet = new Set(filter.selected);
    }
  });

  return filters;
}

/* for categorical features, get the unique feature values
   for quantiative features, get the min and max values */
function getWholeDatasetFeatureExtents(md: Metadata): Record<string, FeatureExtent> {
  return Object.fromEntries(
    Object.entries(md.features).map(([name, feature]) => {
      if (feature.type === "Q") {
        return [name, { type: "Q", extent: [...feature.extent]}];
      } else {
        return [name, { type: "C", categories: [...feature.categories]}];
      }
    })
  );
}

/* given the bins and a format function for a quantitative feature
   return the ranges the bins as strings, which are used as labels
   in the visualiztion */
function getBinLabels(bins: (number[] & { x0: number, x1: number })[], format: (n: number) => string): string[] {
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
function equalIntervalThresholds([min, max]: [number, number], numBins: number): number[] {
  // width of each bin
  const binSize = (max - min) / numBins;
  const thresholds = d3.range(1, numBins)
      .map(d => min + d * binSize);
  return thresholds;
}

/* given all values of a quantitative feature and the number of bins
 return thresholds for equal-frequency bins */
function quantileThresholds(values: number[], numBins: number): number[] {
  return d3.scaleQuantile()
    .domain(values)
    .range(d3.range(numBins))
    .quantiles();
}

function isQuantitativeFeature(values: (string | number)[]): values is number[] {
  return typeof values[0] === 'number';
}

function isCategoricalFeature(values: unknown[]): values is string[] {
  return typeof values[0] === 'string';
}

function isNumericFeature(values: unknown[]): boolean {
  const uniqueValues = new Set(values);
  return Array.from(uniqueValues).every(isNumeric) && uniqueValues.size > 12;
}

function parseDataset(data: d3.DSVRowArray<string>, name: string): Dataset {
  const quantitatveColumns = new Set(
    data.columns.filter(
      col =>
        col !== "label" &&
        col !== "prediction" &&
        isNumericFeature(data.map(d => d[col]))
    )
  );

  const rows = data.map(d => {
    const row: Row = {...d} as Row;
    quantitatveColumns.forEach(col => row[col] = +row[col]);
    return row;
  });

  return Object.assign(rows, { name, columns: data.columns });
}

function getMetadata(dataset: Dataset): Metadata {
  if (!dataset || !dataset.columns) {
    return null;
  }

  const cols: string[] = dataset.columns;

  const labelValues: string[] = Array.from(new Set(dataset.map(d => d.label))).sort().map(d => d.toString());

  const featureNames: string[] = cols.filter(d => d !== 'label' && d !== 'prediction');
  const hasPredictions: boolean = cols.includes('prediction');

  const features = featureNames.reduce((acc, val) => {
    const values: (string | number)[] = dataset.map(d => d[val]);

    if (isQuantitativeFeature(values)) {
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

      const feature: QuantitativeFeature = {
        type: "Q",
        name: val,
        extent: extent,
        splitType: splitType,
        numBins: numBins,
        thresholds: thresholds,
        // values contains the labels for the bins
        values: featureValueLabels,
        format: formatSpecifier,
      };

      acc[val] = feature;

    } else if(isCategoricalFeature(values)){
      const uniqueValues = Array.from(new Set(values)).sort();

      const feature: CategoricalFeature = {
        type: "C",
        name: val,
        // values are the names of the groups
        values: uniqueValues,
        categories: [...uniqueValues],
        // by default, each value is in its own group
        valueToGroup: Object.fromEntries(d3.zip(uniqueValues, uniqueValues))
      };

      acc[val] = feature;
    }

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

function getData(metadata: Metadata, selectedFeatures: string[], dataset: Dataset): Node[] {
  if (metadata === null) {
    return null;
  }

  // g is an array of all of the instances belonging to the same subset
  function reducer(g: Row[]) {
    // map from ground truth label to number of instances with that label
    const groundTruth = d3.rollup(g, v => v.length, d => d.label);

    const node: Node = {
      size: g.length,
      splits: new Map(),
      groundTruth,
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
  function key(d: Row): string {
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
          return d3.bisect(feat.thresholds, d[featureName] as number);
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
    const kvps: [string, number][] = d3.zip(selectedFeatures, key.split(','))
        .map(([a, b]) => ([a, +b]));
    const splits = new Map(kvps);
    value.splits = splits;
    return value;
  });
}

/* https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
   return true if the passed in string is a number and false otherwise */
function isNumeric(str: any): boolean {
  return !isNaN(str) && !isNaN(parseFloat(str));
}

function getFilteredDataset(dataset: Dataset, filters: Filter[]): Dataset {
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
      } else if (!filt.selectedSet.has(value as string)) {
        return false;
      }
    }

    return true;
  });

  return Object.assign(filtered, {columns: dataset.columns, name: dataset.name});
}

/* functions for positioning the squares in the matrix */

/* returns an array of scales for the given features
   space is the width or height of the matrix */
function getScales(selectedFeatures: Feature[], space: number, reverse: boolean) {
  return selectedFeatures.map((feat) => {
    const domain = d3.range(feat.values.length);

    // reverse order for y-axis features
    if (reverse) {
      domain.reverse();
    }

    // range for every scale starts at 0
    const scale = d3.scaleBand<number>().domain(domain).range([0, space]);

    // space for next scale is the band width of the current scale
    space = scale.bandwidth();

    return scale;
  });
}

function zip<T,U>(arr1: T[], arr2: U[]): [T,U][] {
  return arr1.map((d, i) => [d, arr2[i]]);
}

/* d is the data for a given square */
function getPositionOfSquare(d: Node, features: Feature[], scales: d3.ScaleBand<number>[]) {
  // get the bin index for each feature
  // d.splits is a map from the name of the selected feature to the subset's bin index
  // Ex. age -> 1, height -> 2
  const splits = features.map((feat) => d.splits.get(feat.name));

  // adding together the position for each feature gives the position of the square
  return d3.sum(
    zip(scales, splits),
    ([scale, split]) => scale(split)
  );
}

/* tooltip data */

function getTooltipAmounts(showPredictions: boolean, d: Node, percentFormat: (n: number) => string): TooltipData {
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