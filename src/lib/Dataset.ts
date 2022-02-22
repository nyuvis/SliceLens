import * as d3 from "d3";
import { isNumericFeature } from "./Features";
import type {
  Dataset,
  RegressionRow,
  ClassificationRow,
  ClassificationDataset,
  RegressionDataset,
} from "../types";

export {
  parseDataset,
};

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
    const extactGTExtent = d3.extent(groundTruth);
    const groundTruthExtent = d3.nice(extactGTExtent[0], extactGTExtent[1], approxNumBins);
    // remove thresholds outside of the domain, as done when bin() is called:
    // https://github.com/d3/d3-array/blob/2f28f41005de2fbb69e99439fabec5eb8bce26f0/src/bin.js#L62-L65
    const groundTruthThresholds = d3.ticks(groundTruthExtent[0], groundTruthExtent[1], approxNumBins)
      .filter(t => t > groundTruthExtent[0] && t < groundTruthExtent[1]);

    const dataset: RegressionDataset = {
      type: "regression" as const,
      rows,
      name,
      featureNames,
      approxNumBins,
      groundTruthExtent,
      groundTruthThresholds,
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

    const labelValues: string[] = Array.from(new Set(data.map(d => d.label))).sort();

    const dataset: ClassificationDataset = {
      type: "classification" as const,
      rows,
      name,
      featureNames,
      labelValues,
      hasPredictions,
      size
    };
    return dataset;
  }
}