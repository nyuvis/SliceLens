import type {
  ClassificationDataset,
  Dataset,
  Filter,
  RegressionDataset,
} from "../types";
import { getGroundTruthDistribution, getPredictionDistribution } from "./Dataset";

import { areArraysEqual } from "./Utils";

export {
  areFiltersEqual,
  getFilteredDataset,
  cloneFilters,
  addSelectedSetToFilters,
};

/* create copies of each filter. for categorical filters, do not
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

function areFiltersEqual(a: Filter, b: Filter) {
  if (a.type === 'Q' && b.type === 'Q') {
    return (
      a.feature === b.feature &&
      a.min === b.min &&
      a.max === b.max &&
      a.rightInclusive === b.rightInclusive &&
      a.valid === b.valid
    );
  } else if (a.type === 'C' && b.type === 'C') {
    return (
      a.feature === b.feature &&
      areArraysEqual(a.selected, b.selected) &&
      a.valid === b.valid
    );
  } else {
    return false;
  }
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

function getFilteredDataset(dataset: Dataset, filters: Filter[]): Dataset {
  if (filters.length === 0) {
    return dataset;
  }

  function getFilteredRows<Type>(rows: Type[]): Type[] {
    return rows.filter(row => {
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
  }

  if (dataset.type === 'classification') {
    const rows = getFilteredRows(dataset.rows);
    const groundTruthDistribution = getGroundTruthDistribution(rows);

    const filteredDs: ClassificationDataset = {
      type: 'classification',
      rows: rows,
      name: dataset.name,
      featureNames: dataset.featureNames,
      labelValues: dataset.labelValues,
      hasPredictions: dataset.hasPredictions,
      size: rows.length,
      groundTruthDistribution,
    };

    if (dataset.hasPredictions) {
      const predictionDistribution = getPredictionDistribution(rows);
      filteredDs.predictionDistribution = predictionDistribution;
    }

    return filteredDs;
  } else {
    const rows = getFilteredRows(dataset.rows);
    const ds: RegressionDataset = {
      type: 'regression',
      rows: rows,
      name: dataset.name,
      featureNames: dataset.featureNames,
      approxNumBins: dataset.approxNumBins,
      groundTruthExtent: dataset.groundTruthExtent,
      groundTruthThresholds: dataset.groundTruthThresholds,
      hasPredictions: dataset.hasPredictions,
      size: rows.length
    };

    if (ds.hasPredictions) {
      ds.deltaExtent = dataset.deltaExtent;
      ds.deltaThresholds = dataset.deltaThresholds;
    }

    return ds;
  }
}
