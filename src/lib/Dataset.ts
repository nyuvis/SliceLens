import * as d3 from "d3";
import { isNumericFeature, quantileThresholds } from "./Features";
import type {
  Dataset,
  RegressionRow,
  ClassificationRow,
  ClassificationDataset,
  RegressionDataset,
} from "../types";

export {
  parseDataset,
  getGroundTruthDistribution,
  getPredictionDistribution
};

/**
 *
 * @param rows rows in the dataset
 * @returns map from ground truth class label to the percentage of rows with that label
 */
function getGroundTruthDistribution(rows: ClassificationRow[]): d3.InternMap<string,number> {
  return d3.rollup(
    rows,
    v => v.length / rows.length,
    d => d.label
  );
}

/**
 *
 * @param rows rows in the dataset
 * @returns map from predicted class label to whether or not the prediction is correct to the percentage of rows with that label and correctness
 */
function getPredictionDistribution(rows: ClassificationRow[]): d3.InternMap<string,d3.InternMap<boolean,number>> {
  return d3.rollup(
    rows,
    v => v.length / rows.length,
    d => d.prediction,
    d => d.prediction === d.label
  );
}

function parseDataset(data: d3.DSVRowArray<string>, name: string): Dataset {
  const size = data.length;
  const featureNames: string[] = data.columns.filter(d => d !== 'label' && d !== 'prediction');
  const hasPredictions: boolean = data.columns.includes('prediction');

  const quantitatveColumns = new Set(data.columns.filter(col => isNumericFeature(data.map(d => d[col]))));

  const isRegression = quantitatveColumns.has("label") || quantitatveColumns.has("prediction");

  if (isRegression) {
    quantitatveColumns.add("label");
    if (hasPredictions) {
      quantitatveColumns.add("prediction");
    }

    // convert strings to numbers for quantitative columns
    const rows = data.map(d => {
      const row = {...d} as RegressionRow;
      quantitatveColumns.forEach(col => row[col] = +row[col]);
      return row;
    });

    const approxNumBins = 20;

    const groundTruth: number[] = rows.map((d: RegressionRow) => d.label);
    const exactGTExtent = d3.extent(groundTruth);
    const groundTruthExtent = d3.nice(exactGTExtent[0], exactGTExtent[1], approxNumBins);
    // remove thresholds outside of the domain, as done when bin() is called:
    // https://github.com/d3/d3-array/blob/2f28f41005de2fbb69e99439fabec5eb8bce26f0/src/bin.js#L62-L65
    const groundTruthThresholds = d3.ticks(groundTruthExtent[0], groundTruthExtent[1], approxNumBins)
      .filter(t => t > groundTruthExtent[0] && t < groundTruthExtent[1]);

    const groundTruthQuantileThresholds = quantileThresholds(groundTruth, approxNumBins)
      .filter(t => t > groundTruthExtent[0] && t < groundTruthExtent[1]);

    const dataset: RegressionDataset = {
      type: "regression" as const,
      rows,
      name,
      featureNames,
      approxNumBins,
      groundTruthExtent,
      groundTruthThresholds,
      groundTruthQuantileThresholds,
      hasPredictions,
      size
    };

    if (hasPredictions) {
      const predictions: number[] = rows.map((d: RegressionRow) => d.prediction);
      const deltas: number[] = d3.zip<number>(groundTruth, predictions)
        .map(([truth, pred]) => pred - truth);

      const maxAbsDelta = d3.max(deltas, d => Math.abs(d));
      const deltaExtent = d3.nice(-maxAbsDelta, maxAbsDelta, approxNumBins);;
      dataset.deltaExtent = deltaExtent;
      // remove thresholds outside of the domain, as done when bin() is called:
      // https://github.com/d3/d3-array/blob/2f28f41005de2fbb69e99439fabec5eb8bce26f0/src/bin.js#L62-L65
      dataset.deltaThresholds = d3.ticks(deltaExtent[0], deltaExtent[1], approxNumBins)
        .filter(t => t > deltaExtent[0] && t < deltaExtent[1]);

      const absDeltas = deltas.map(d => Math.abs(d));
      const positiveQuantiles = quantileThresholds(absDeltas, approxNumBins / 2);
      const negativeQuantiles = positiveQuantiles.map(d => -d).reverse();
      dataset.deltaQuantileThresholds = negativeQuantiles.concat(positiveQuantiles);
    }
    return dataset;
  } else {
    quantitatveColumns.delete("label");
    quantitatveColumns.delete("prediction");

    // convert strings to numbers for quantitative columns
    const rows = data.map(d => {
      const row = {...d} as ClassificationRow;
      quantitatveColumns.forEach(col => row[col] = +row[col]);
      return row;
    });

    const groundTruthDistribution = getGroundTruthDistribution(rows);

    const labelValues: string[] = Array.from(groundTruthDistribution.keys()).sort();

    const dataset: ClassificationDataset = {
      type: "classification" as const,
      rows,
      name,
      featureNames,
      labelValues,
      hasPredictions,
      size,
      groundTruthDistribution
    };

    if (hasPredictions) {
      const predictionDistribution = getPredictionDistribution(rows);
      dataset.predictionDistribution = predictionDistribution;
    }

    return dataset;
  }
}