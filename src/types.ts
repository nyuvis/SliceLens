import type {InternMap} from "d3";

// metadata

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

export type Metadata = {
  features: Record<string, Feature>,
  featureNames: string[],
  labelValues: string[],
  hasPredictions: boolean,
  size: number
};

export type CategoricalExtent = {
  type: "C",
  categories: string[],
};

export type QuantitativeExtent = {
  type: "Q",
  extent: [number, number]
};

export type FeatureExtent = CategoricalExtent | QuantitativeExtent;

// dataset

export type Row = Record<string, string|number> & { label: string, prediction?: string };

export type Dataset = Row[] & { columns: string[], name: string };

export type Node = {
  size: number,
  splits: Map<string, number>,
  groundTruth: InternMap<string, number>,
  predictionCounts?: InternMap<string, number>,
  predictionResults?: InternMap<string, InternMap<string, number>>
};

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

export type TooltipData = {
  label: string | number,
  count: number,
  percent: string,
  stripes: boolean,
  colorLabel: string
}[];


// notes

export type NoteState = {
  selectedFeatures: string[],
  selectedFeaturesMetadata: Record<string, Feature>,
  dataset: string,
  filters: Filter[]
};

export type Note = {
  title: string,
  body: string,
  state: NoteState
};