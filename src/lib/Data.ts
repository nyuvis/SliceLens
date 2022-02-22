import * as d3 from "d3";
import type {
  Features,
  Dataset,
  RegressionRow,
  ClassificationRow,
  Node,
  ClassificationDataset,
  Row,
  RegressionDataset,
  ClassificationNode,
  RegressionNode
} from "../types";

export {
  getClassificationData,
  getRegressionData,
};

function getData(features: Features, selectedFeatures: string[], dataset: Dataset, reducer: (g: Row[]) => Node): Node[] {
  if (features === null) {
    return null;
  }

  /* return the key that is used to group an instance
     Ex: 0-2-1 means the first bin for the first selected feature,
     the third bin for the second selected feature, and the second
     bin for the third selected feature. */
  function key(d: Row): string {
    return selectedFeatures
      .map(featureName => {
        const feat = features[featureName];
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

  return d3.rollups(dataset.rows, reducer, key)
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


function getClassificationData(features: Features, selectedFeatures: string[], dataset: ClassificationDataset): ClassificationNode[] {
  // g is an array of all of the instances belonging to the same subset
  function reducer(g: ClassificationRow[]) {
    // map from ground truth label to number of instances with that label
    const groundTruth = d3.rollups(
      g,
      v => v.length,
      d => d.label
    )
      .map(([label, size]) => ({label, size, correct: true as const, offset: 0}))
      .sort((a, b) => d3.ascending(a.label, b.label));

    let sum = 0;
    for (let bin of groundTruth) {
      bin.offset = sum;
      sum += bin.size;
    }

    const node: ClassificationNode = {
      type: 'classification',
      size: g.length,
      splits: new Map(),
      groundTruth,
    };

    if (dataset.hasPredictions) {
      // map from predicted label to map from "correct" or "incorrect" to count
      const predictions = d3.flatRollup(
        g,
        v => v.length,
        d => d.prediction,
        d => d.prediction === d.label
      )
        .map(([label, correct, size]) => ({label, correct, size, offset: 0}))
        // sort primarily by label, secondarily by correctness
        .sort((a, b) => d3.ascending(a.label, b.label) || d3.ascending(a.correct, b.correct));

      let sum = 0;
      for (let bin of predictions) {
        bin.offset = sum;
        sum += bin.size;
      }

      node.predictions = predictions;
    }

    return node;
  }

  return getData(features, selectedFeatures, dataset, reducer) as ClassificationNode[];
}

function getRegressionData(features: Features, selectedFeatures: string[], dataset: RegressionDataset): RegressionNode[] {
  const groundTruthBinner = d3.bin()
      .domain(dataset.groundTruthExtent)
      .thresholds(dataset.groundTruthThresholds);

  const predictionBinner = dataset.hasPredictions ?
    d3.bin()
      .domain(dataset.deltaExtent)
      .thresholds(dataset.deltaThresholds) :
    null;

  // g is an array of all of the instances belonging to the same subset
  function reducer(g: RegressionRow[]) {
    const labels = g.map(d => d.label);
    // do I need to check for bins where x0 === x1?
    // is it possible the bins won't have exactly uniform widths?
    const groundTruth = groundTruthBinner(labels)
        .map(bin => ({ x0: bin.x0, x1: bin.x1, offset: 0, size: bin.length }));

    let sum = 0;
    for (let bin of groundTruth) {
      bin.offset = sum;
      sum += bin.size;
    }

    const node: RegressionNode = {
      type: 'regression',
      size: g.length,
      splits: new Map(),
      groundTruth,
    };

    if (predictionBinner !== null) {
      const deltas = g.map(d => d.prediction - d.label);

      const predictions = predictionBinner(deltas)
        .map(bin => ({ x0: bin.x0, x1: bin.x1, offset: 0, size: bin.length }));

      sum = 0;
      for (let bin of predictions) {
        bin.offset = sum;
        sum += bin.size;
      }

      node.predictions = predictions;
    }

    return node;
  }

  return getData(features, selectedFeatures, dataset, reducer) as RegressionNode[];
}

