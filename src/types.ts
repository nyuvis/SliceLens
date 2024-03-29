// dataset

export type ClassificationRow = Record<string, string|number> & { label: string, prediction?: string };
export type RegressionRow = Record<string, string|number> & { label: number, prediction?: number };
export type Row = ClassificationRow | RegressionRow;

export type ClassificationDataset = {
  type: "classification",
  rows: ClassificationRow[]
  name: string,
  featureNames: string[],
  labelValues: string[],
  hasPredictions: boolean,
  size: number,
  groundTruthDistribution: d3.InternMap<string,number>,
  predictionDistribution?: d3.InternMap<string,d3.InternMap<boolean,number>>
};

export type RegressionDataset = {
  type: "regression",
  rows: RegressionRow[],
  name: string,
  featureNames: string[],
  approxNumBins: number,
  groundTruthExtent: [number, number],
  groundTruthThresholds: number[],
  groundTruthQuantileThresholds: number[],
  deltaExtent?: [number, number],
  deltaThresholds?: number[],
  deltaQuantileThresholds?: number[],
  hasPredictions: boolean,
  size: number
};

export type Dataset = ClassificationDataset | RegressionDataset;


// data

export type ClassificationNode = {
  type: 'classification',
  size: number,
  splits: Map<string, number>,
  groundTruth: { label: string, size: number, correct: true, offset: number, pctPtDiffFromWhole: number }[],
  predictions?: { label: string, size: number, correct: boolean, offset: number, pctPtDiffFromWhole: number }[],
};

export type RegressionNode = {
  type: 'regression',
  size: number,
  splits: Map<string, number>,
  groundTruthQuantiles: { x0: number, x1: number, offset: number, size: number }[],
  groundTruth: { x0: number, x1: number, offset: number, size: number }[],
  predictionsQuantiles?: { x0: number, x1: number, offset: number, size: number }[],
  predictions?: { x0: number, x1: number, offset: number, size: number }[],
  groundTruthLabels: number[],
  predictedLabels?: number[]
};

export type Node = ClassificationNode | RegressionNode;

export type NodeArray = ClassificationNode[] | RegressionNode[];


// features

export type QuantitativeFeature = {
  type: "Q",
  name: string,
  extent: [number, number],
  splitType: string,
  numBins: number,
  thresholds: number[],
  values: string[],
  format: string,
};

export type CategoricalFeature = {
  type: "C",
  name: string,
  values: string[],
  categories: string[],
  valueToGroup: Record<string, string>,
};

export type Feature = QuantitativeFeature | CategoricalFeature;

export type Features = Record<string, Feature>;


// extents

export type CategoricalExtent = {
  type: "C",
  categories: string[],
};

export type QuantitativeExtent = {
  type: "Q",
  extent: [number, number]
};

export type FeatureExtent = CategoricalExtent | QuantitativeExtent;


// filters

export type QuantitativeFilter = {
  type: "Q",
  feature: string,
  min: number,
  max: number,
  rightInclusive: boolean,
  valid: boolean
};

export type CategoricalFilter = {
  type: "C",
  feature: string,
  selected: string[],
  selectedSet?: Set<string>,
  valid: boolean
};

export type Filter = QuantitativeFilter | CategoricalFilter;


// tooltip

export type ClassificationTooltipData = {
  display: string,
  size: number,
  percent: string,
  correct: boolean,
  label: string
}[];


// notes

export type NoteState = {
  selectedFeatures: string[],
  selectedFeaturesInfo: Record<string, Feature>,
  dataset: string,
  filters: Filter[]
};

export type Note = {
  title: string,
  body: string,
  state: NoteState
};

// visualization settings

export const visKinds = ['squares', 'bars vertical', 'bars horizontal'] as const;