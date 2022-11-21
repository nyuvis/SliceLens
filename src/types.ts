// dataset

export type ClassificationDataset = {
  type: "classification",
  name: string,
  featureNames: string[],
  features: Features,
  size: number,
  hasPredictions: boolean,
  labelValues: string[],
  color: d3.ScaleOrdinal<string, string, string>
};

export type RegressionDataset = {
  type: "regression",
  name: string,
  featureNames: string[],
  features: Features,
  size: number,
  hasPredictions: boolean,
  labelExtent: [number, number],
  color: d3.ScaleSequential<string, string>,
};

export type Dataset = ClassificationDataset | RegressionDataset;

// features

export type QuantitativeFeature = {
  type: "Q",
  name: string,
  extent: [number, number],
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