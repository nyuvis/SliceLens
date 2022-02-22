import * as d3 from "d3";

import type {
  ClassificationTooltipData,
  ClassificationNode,
  Feature,
} from "../types";

export {
  getScales,
  getPositionOfSquare,
  getClassificationTooltipAmounts,
};


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
function getPositionOfSquare(nodeSplits: Map<string, number>, features: Feature[], scales: d3.ScaleBand<number>[]) {
  // get the bin index for each feature
  // d.splits is a map from the name of the selected feature to the subset's bin index
  // Ex. age -> 1, height -> 2
  const splits = features.map((feat) => nodeSplits.get(feat.name));

  // adding together the position for each feature gives the position of the square
  return d3.sum(
    zip(scales, splits),
    ([scale, split]) => scale(split)
  );
}

/* tooltip data */

function getClassificationTooltipAmounts(showPredictions: boolean, d: ClassificationNode, percentFormat: (n: number) => string): ClassificationTooltipData {
  if (showPredictions) {
    return d.predictions.map(({label, size, correct}) => ({
        display: `${label} (${correct ? "correct" : "incorrect"})`,
        size: size,
        percent: percentFormat(size / d.size),
        correct: correct,
        label: label,
      }));
  } else {
    return d.groundTruth.map(({label, size}) => ({
      display: label,
      size,
      percent: percentFormat(size / d.size),
      correct: true,
      label: label,
    }));
  }
}