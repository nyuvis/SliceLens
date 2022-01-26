import type {InternMap} from "d3";


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
  size: number
};

export type RegressionDataset = {
  type: "regression",
  rows: RegressionRow[],
  name: string,
  featureNames: string[],
  approxNumBins: number,
  groundTruthExtent: [number, number],
  groundTruthThresholds: number[],
  deltaExtent?: [number, number],
  deltaThresholds?: number[],
  hasPredictions: boolean,
  size: number
};

export type Dataset = ClassificationDataset | RegressionDataset;


// data

export type ClassificationNode = {
  type: 'classification',
  size: number,
  splits: Map<string, number>,
  groundTruth: InternMap<string, number>,
  predictionCounts?: InternMap<string, number>,
  predictionResults?: InternMap<string, InternMap<string, number>>
};

export type RegressionNode = {
  type: 'regression',
  size: number,
  splits: Map<string, number>,
  groundTruthBins: { x0: number, x1: number, y0: number, size: number }[],
  deltaBins?: { x0: number, x1: number, y0: number, size: number }[],
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
  label: string | number,
  count: number,
  percent: string,
  stripes: boolean,
  colorLabel: string
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