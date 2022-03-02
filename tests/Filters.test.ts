import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as d3 from "d3";
import {
  areFiltersEqual,
  getFilteredDataset,
  cloneFilters,
  addSelectedSetToFilters,
} from '../src/lib/Filters';
import { getGroundTruthDistribution, getPredictionDistribution, parseDataset } from '../src/lib/Dataset';
import * as fs from "fs";
import type {Filter, Dataset, CategoricalFilter, QuantitativeFilter} from '../src/types';

function readCsv(filename: string): Dataset {
  const data = d3.csvParse(
    fs.readFileSync(`./tests/data/${filename}`).toString(),
  );

  const ds = parseDataset(data, filename);

  return ds;
}

// clone filters

test('clone filters', () => {
  const filters: Filter[] = [
    {
      feature: 'feature0',
      type: 'C',
      valid: true,
      selected: ['a', 'b', 'c'],
      selectedSet: new Set(['a', 'b', 'c'])
    },
    {
      feature: 'feature1',
      type: 'C',
      valid: false,
      selected: ['one'],
    },
    {
      feature: 'feature2',
      type: 'Q',
      valid: true,
      min: 1,
      max: 2,
      rightInclusive: true
    },
    {
      feature: 'feature2',
      type: 'Q',
      valid: true,
      min: 1,
      max: 2,
      rightInclusive: false
    },
  ];

  const copy = cloneFilters(filters);

  // selectedSet should not be copied over
  assert.not(copy[0].hasOwnProperty('selectedSet'));

  if (filters[0].type === 'C') {
    // after removing selectedSet from filters, they should be equal
    delete filters[0].selectedSet;

    assert.equal(copy, filters);

    // check that mutating filters does not mutate the copy
    filters[0].selected.push('d');
    assert.not.equal(copy, filters);
  } else {
    throw new Error("filter has wrong type");
  }
});

// addSelectedSetToFilters

test('add selected set to filters', () => {
  const filters: Filter[] = [
    {
      feature: 'feature0',
      type: 'C',
      valid: true,
      selected: ['a', 'b', 'c'],
    },
    {
      feature: 'feature1',
      type: 'C',
      valid: false,
      selected: ['one'],
    },
    {
      feature: 'feature2',
      type: 'Q',
      valid: true,
      min: 1,
      max: 2,
      rightInclusive: true
    },
    {
      feature: 'feature2',
      type: 'Q',
      valid: true,
      min: 1,
      max: 2,
      rightInclusive: false
    },
  ];

  const filtersWithSelectedSet: Filter[] = [
    {
      feature: 'feature0',
      type: 'C',
      valid: true,
      selected: ['a', 'b', 'c'],
      selectedSet: new Set(['a', 'b', 'c'])
    },
    {
      feature: 'feature1',
      type: 'C',
      valid: false,
      selected: ['one'],
      selectedSet: new Set(['one']),
    },
    {
      feature: 'feature2',
      type: 'Q',
      valid: true,
      min: 1,
      max: 2,
      rightInclusive: true
    },
    {
      feature: 'feature2',
      type: 'Q',
      valid: true,
      min: 1,
      max: 2,
      rightInclusive: false
    },
  ];

  assert.equal(
    addSelectedSetToFilters(filters),
    filtersWithSelectedSet
  );
});

// filtered data

// classification

test('get filtered dataset - no filters', () => {
  const fullDataset = readCsv('dataset-1.csv');
  assert.equal(
    getFilteredDataset(fullDataset, []),
    fullDataset
  );
});

test('get filtered dataset - quantitative feature right inclusive', () => {
  const fullDataset = readCsv('dataset-1.csv');
  if (fullDataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const filters: Filter[] = [
    {
      feature: 'age',
      type: "Q",
      valid: true,
      min: 30,
      max: 40,
      rightInclusive: true
    }
  ];

  const result = getFilteredDataset(fullDataset, filters);
  if (result.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  assert.equal(result.type, fullDataset.type);
  assert.equal(result.name, fullDataset.name);
  assert.equal(result.featureNames, fullDataset.featureNames);
  assert.equal(result.labelValues, fullDataset.labelValues);
  assert.equal(result.hasPredictions, fullDataset.hasPredictions);
  assert.equal(result.size, result.rows.length);
  assert.equal(result.groundTruthDistribution, getGroundTruthDistribution(result.rows));
  assert.equal(result.predictionDistribution, getPredictionDistribution(result.rows));

  assert.ok(result.rows.length > 0);
  assert.ok(result.size < fullDataset.size);

  assert.not.equal(result.rows, fullDataset.rows);

  const ages = result.rows.map(d => d.age);

  ages.forEach(d => {
    assert.ok(d >= 30 && d <= 40);
  });

  assert.ok(ages.includes(30));
  assert.ok(ages.includes(40));
});

test('get filtered dataset - quantitative feature right exclusive', () => {
  const fullDataset = readCsv('dataset-1.csv');
  if (fullDataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const filters: Filter[] = [
    {
      feature: 'age',
      type: 'Q',
      valid: true,
      min: 30,
      max: 40,
      rightInclusive: false
    }
  ];
  const result = getFilteredDataset(fullDataset, filters);
  if (result.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  assert.equal(result.type, fullDataset.type);
  assert.equal(result.name, fullDataset.name);
  assert.equal(result.featureNames, fullDataset.featureNames);
  assert.equal(result.labelValues, fullDataset.labelValues);
  assert.equal(result.hasPredictions, fullDataset.hasPredictions);
  assert.equal(result.size, result.rows.length);
  assert.equal(result.groundTruthDistribution, getGroundTruthDistribution(result.rows));
  assert.equal(result.predictionDistribution, getPredictionDistribution(result.rows));

  assert.ok(result.rows.length > 0);
  assert.ok(result.size < fullDataset.size);

  assert.not.equal(result.rows, fullDataset.rows);

  const ages = result.rows.map(d => d.age);

  ages.forEach(d => {
    assert.ok(d >= 30 && d < 40);
  });

  assert.ok(ages.includes(30));
  assert.not(ages.includes(40));
});

test('get filtered classification dataset - number categories', () => {
  const fullDataset = readCsv('dataset-1.csv');

  if (fullDataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const filters: Filter[] = [
    {
      feature: 'favoriteNumber',
      type: 'C',
      valid: true,
      selected: ['1', '5'],
      selectedSet: new Set(['1', '5'])
    }
  ];
  const result = getFilteredDataset(fullDataset, filters);
  if (result.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  assert.equal(result.type, fullDataset.type);
  assert.equal(result.name, fullDataset.name);
  assert.equal(result.featureNames, fullDataset.featureNames);
  assert.equal(result.labelValues, fullDataset.labelValues);
  assert.equal(result.hasPredictions, fullDataset.hasPredictions);
  assert.equal(result.size, result.rows.length);
  assert.equal(result.groundTruthDistribution, getGroundTruthDistribution(result.rows));
  assert.equal(result.predictionDistribution, getPredictionDistribution(result.rows));

  assert.ok(result.rows.length > 0);
  assert.ok(result.size < fullDataset.size);

  assert.not.equal(result.rows, fullDataset.rows);

  const favoriteNumbers = result.rows.map(d => d.favoriteNumber);

  favoriteNumbers.forEach(d => {
    assert.ok(d === '1' || d === '5');
  });

  assert.not(favoriteNumbers.includes('3'));
});

test('get filtered classification dataset - string categories', () => {
  const fullDataset = readCsv('dataset-1.csv');

  if (fullDataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const filters: Filter[] = [
    {
      feature: 'job',
      type: 'C',
      valid: true,
      selected: ['student', 'teacher'],
      selectedSet: new Set(['student', 'teacher'])
    }
  ];
  const result = getFilteredDataset(fullDataset, filters);
  if (result.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  assert.equal(result.type, fullDataset.type);
  assert.equal(result.name, fullDataset.name);
  assert.equal(result.featureNames, fullDataset.featureNames);
  assert.equal(result.labelValues, fullDataset.labelValues);
  assert.equal(result.hasPredictions, fullDataset.hasPredictions);
  assert.equal(result.size, result.rows.length);
  assert.equal(result.groundTruthDistribution, getGroundTruthDistribution(result.rows));
  assert.equal(result.predictionDistribution, getPredictionDistribution(result.rows));

  assert.ok(result.rows.length > 0);
  assert.ok(result.size < fullDataset.size);

  assert.not.equal(result.rows, fullDataset.rows);

  const jobs = result.rows.map(d => d.job);

  jobs.forEach(d => {
    assert.ok(d === 'student' || d === 'teacher');
  });

  assert.not(jobs.includes('zookeeper'));
  assert.not(jobs.includes('bartender'));
  assert.not(jobs.includes('accountant'));
});

test('get filtered classification dataset - two filters', () => {
  const fullDataset = readCsv('dataset-1.csv');

  if (fullDataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const filters: Filter[] = [
    {
      feature: 'age',
      type: 'Q',
      valid: true,
      min: 30,
      max: 40,
      rightInclusive: true
    },
    {
      feature: 'job',
      type: 'C',
      valid: true,
      selected: ['student', 'teacher'],
      selectedSet: new Set(['student', 'teacher'])
    }
  ];
  const result = getFilteredDataset(fullDataset, filters);
  if (result.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  assert.equal(result.type, fullDataset.type);
  assert.equal(result.name, fullDataset.name);
  assert.equal(result.featureNames, fullDataset.featureNames);
  assert.equal(result.labelValues, fullDataset.labelValues);
  assert.equal(result.hasPredictions, fullDataset.hasPredictions);
  assert.equal(result.size, result.rows.length);
  assert.equal(result.groundTruthDistribution, getGroundTruthDistribution(result.rows));
  assert.equal(result.predictionDistribution, getPredictionDistribution(result.rows));

  assert.ok(result.rows.length > 0);
  assert.ok(result.size < fullDataset.size);

  assert.not.equal(result.rows, fullDataset.rows);

  result.rows.forEach(d => {
    assert.ok(d['job'] === 'student' || d['job'] === 'teacher');
    assert.ok(d['age'] >= 30 && d['age'] <= 40);
  });
});

// are filters equal

test('are filters equal - different types', () => {
  const a: CategoricalFilter = {
    type: 'C',
    feature: 'job',
    selected: ['student', 'retired'],
    selectedSet: new Set(['student', 'retired']),
    valid: true,
  };

  const b: QuantitativeFilter = {
    type: 'Q',
    feature: 'a',
    min: 0,
    max: 1,
    rightInclusive: false,
    valid: true
  };

  assert.not.ok(areFiltersEqual(a, b));
});

test('are filters equal - categorical true', () => {
  const a: CategoricalFilter = {
    type: 'C',
    feature: 'job',
    selected: ['student', 'retired'],
    selectedSet: new Set(['student', 'retired']),
    valid: true,
  };

  const b: CategoricalFilter = {
    type: 'C',
    feature: 'job',
    selected: ['student', 'retired'],
    selectedSet: new Set(['student', 'retired']),
    valid: true,
  };

  assert.ok(areFiltersEqual(a, b));
});

test('are filters equal - categorical false', () => {
  const a: CategoricalFilter = {
    type: 'C',
    feature: 'job',
    selected: ['student', 'retired'],
    selectedSet: new Set(['student', 'retired']),
    valid: true,
  };

  const b: CategoricalFilter = {
    type: 'C',
    feature: 'job',
    selected: ['student', 'retired'],
    selectedSet: new Set(['student', 'retired']),
    valid: true,
  };

  // different feature
  b.feature = 'relationship';
  assert.not.ok(areFiltersEqual(a, b));

  // different selected
  b.feature = a.feature;
  b.selected = ['student'];
  assert.not.ok(areFiltersEqual(a, b));

  // different valid
  b.selected = a.selected;
  b.valid = !a.valid;
  assert.not.ok(areFiltersEqual(a, b));
});

test('are filters equal - quantitative true', () => {
  const a: QuantitativeFilter = {
    type: 'Q',
    feature: 'a',
    min: 0,
    max: 1,
    rightInclusive: false,
    valid: true
  };

  const b: QuantitativeFilter = {
    type: 'Q',
    feature: 'a',
    min: 0,
    max: 1,
    rightInclusive: false,
    valid: true
  };

  assert.ok(areFiltersEqual(a, b));
});

test('are filters equal - quantitative false', () => {
  const a: QuantitativeFilter = {
    type: 'Q',
    feature: 'a',
    min: 0,
    max: 1,
    rightInclusive: false,
    valid: true
  };

  const b: QuantitativeFilter = {
    type: 'Q',
    feature: 'a',
    min: 0,
    max: 1,
    rightInclusive: false,
    valid: true
  };

  // different feature
  assert.ok(areFiltersEqual(a, b));
  b.feature = 'b';
  assert.not.ok(areFiltersEqual(a, b));

  // different min
  b.feature = a.feature;
  assert.ok(areFiltersEqual(a, b));
  b.min = 0.5;
  assert.not.ok(areFiltersEqual(a, b));

  // different max
  b.min = a.min;
  assert.ok(areFiltersEqual(a, b));
  b.max = 1.5;
  assert.not.ok(areFiltersEqual(a, b));

  // different right inclusive
  b.max = a.max;
  assert.ok(areFiltersEqual(a, b));
  b.rightInclusive = !a.rightInclusive;
  assert.not.ok(areFiltersEqual(a, b));

  // different valid
  b.rightInclusive = a.rightInclusive;
  assert.ok(areFiltersEqual(a, b));
  b.valid = !a.valid;
  assert.not.ok(areFiltersEqual(a, b));
});

test.run();