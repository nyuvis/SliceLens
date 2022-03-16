import type { QuantitativeFeature } from "../types";
import { bin } from 'd3-array';
import { format } from 'd3-format';
import { equalIntervalThresholds, getBinLabels, quantileThresholds } from "./Features";

export { increaseNumberOfBins, decreaseNumberOfBins, setBins, setBinLabels, areThresholdsValid, allowedBinNumbers };

const allowedBinNumbers: number[] = [2, 3, 4, 5, 6];

function increaseNumberOfBins(feature: QuantitativeFeature, featureValues: number[]): QuantitativeFeature {
  if (feature.numBins < allowedBinNumbers[allowedBinNumbers.length - 1]) {
    feature.numBins += 1;
    setBins(feature, featureValues);
  }

  return feature;
}

function decreaseNumberOfBins(feature: QuantitativeFeature, featureValues: number[]): QuantitativeFeature {
  if (feature.numBins > allowedBinNumbers[0]) {
    feature.numBins -= 1;
    setBins(feature, featureValues);
  }

  return feature;
}

function setBins(feature: QuantitativeFeature, featureValues: number[]): boolean {
  if (feature.splitType === 'interval') {
    feature.thresholds = equalIntervalThresholds(feature.extent, feature.numBins);
    setBinLabels(feature, featureValues);
    return true;
  } else if (feature.splitType === 'quantile') {
    feature.thresholds = quantileThresholds(featureValues, feature.numBins);
    setBinLabels(feature, featureValues);
    return true;
  } else if (feature.splitType === 'custom') {
    const targetNumThresholds: number = feature.numBins - 1;
    const numThreshold: number = feature.thresholds.length;
    const diff: number = Math.abs(targetNumThresholds - numThreshold);

    if (targetNumThresholds < numThreshold) {
      feature.thresholds = feature.thresholds.slice(0, -diff);
    } else if (targetNumThresholds > numThreshold) {
      feature.thresholds = feature.thresholds.concat(Array(diff).fill(0));
    }

    return areThresholdsValid(feature.extent, feature.thresholds);
  }
}

function areThresholdsValid(extent: [number, number], thresholds: number[]): boolean {
  // thresholds must be strictly increasing
  const arr: number[] = [extent[0], ...thresholds, extent[1]];

  for (let i = 1, n = arr.length; i < n; i++) {
    if (arr[i - 1] >= arr[i]) {
      return false;
    }
  }

  return true;
}

function setBinLabels(feature: QuantitativeFeature, featureValues: number[]) {
  const binner = bin()
    .domain(feature.extent)
    .thresholds(feature.thresholds);
  const bins = binner(featureValues);
  feature.values = getBinLabels(bins, format(feature.format));
  const thresholdFunc: any = binner.thresholds();
  feature.thresholds = thresholdFunc() as number[];
}