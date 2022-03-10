import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as d3 from "d3";
import {
  cloneCategoricalFeature,
  cloneQuantitativeFeature,
  cloneSelectedFeatures,
  areFeaturesEqual,
  getWholeDatasetFeatureExtents,
  isNumericFeature,
  isQuantitativeFeature,
  isCategoricalFeature,
  getBinLabels,
  equalIntervalThresholds,
  quantileThresholds,
  getFeatures
} from '../src/lib/Features';
import * as fs from "fs";
import { parseDataset } from '../src/lib/Dataset';
import type {Features, Dataset, CategoricalFeature, QuantitativeFeature} from '../src/types';

function readCsv(filename: string): Dataset {
  const data = d3.csvParse(
    fs.readFileSync(`./tests/data/${filename}`).toString(),
  );

  const ds = parseDataset(data, filename);

  return ds;
}

function readJson(filename: string) {
  return JSON.parse(
    fs.readFileSync(`./tests/data/${filename}`).toString()
  );
}

// quantitative bin labels

test('quantitative bin labels', () => {
  const expected = [
    '[0.00, 0.20)',
    '[0.20, 0.40)',
    '[0.40, 0.60)',
    '[0.60, 0.80)',
    '[0.80, 1.00]'
  ];

  const data = Array.from({length: 1000}, () => Math.random());

  const format = d3.format('.2f');

  const bins = d3.bin()
      .domain([0, 1])
      .thresholds([0.2, 0.4, 0.6, 0.8])(data);

  const actual = getBinLabels(bins, format);

  assert.equal(actual, expected);
});

// equal interval thresholds

test('equal interval thresholds', () => {
  assert.equal(
    equalIntervalThresholds([0, 100], 5),
    [20, 40, 60, 80]
  );
  assert.equal(
    equalIntervalThresholds([0, 1], 4),
    [0.25, 0.5, 0.75]
  );

  assert.equal(
    equalIntervalThresholds([100, 400], 3),
    [200, 300]
  );

  assert.equal(
    equalIntervalThresholds([-100, 0], 4),
    [-75, -50, -25]
  );

  assert.equal(
    equalIntervalThresholds([-100, -90], 5),
    [-98, -96, -94, -92]
  );
});

// equal interval thresholds

test('quantile thresholds', () => {
  assert.equal(
    quantileThresholds([1, 2, 2, 2, 2, 3, 4, 5, 5, 5, 5, 6], 2),
    [3.5]
  );
});

// get whole dataset features extent

test('get whole dataset feature extents', () => {
  const features: Features = {
    'abc': { name: 'abc', type: 'Q', extent: [-1, 1], numBins: 0, splitType: "interval", thresholds: [], values: [], format: '' },
    'def': { name: 'def', type: 'Q', extent: [15, 30], numBins: 0, splitType: "interval", thresholds: [], values: [], format: '' },
    'ghi': { name: 'ghi', type: 'C', categories: ['1', '2', '3', '4', '5'],  values: [], valueToGroup: {}},
    'jkl': { name: 'jkl', type: 'C', categories: ['a', 'b', 'c', 'd', 'e'], values: [], valueToGroup: {} },
  };

  const expected = {
    'abc': { type: 'Q', extent: [-1, 1] },
    'def': { type: 'Q', extent: [15, 30] },
    'ghi': { type: 'C', categories: ['1', '2', '3', '4', '5'] },
    'jkl': { type: 'C', categories: ['a', 'b', 'c', 'd', 'e'] },
  };

  const actual = getWholeDatasetFeatureExtents(features);

  assert.equal(actual, expected);

  // mutating features should not mutate the feature extents

  if (features['abc'].type === 'Q' && actual['abc'].type === 'Q') {
    features['abc'].extent[0] = 0;
    assert.not.equal(
      actual['abc'].extent,
      features['abc'].extent
    );
  } else {
    throw new Error("feature has wrong type");
  }

  if (features['jkl'].type === 'C' && actual['jkl'].type === 'C') {
    features['jkl'].categories[0] = 'x';
    assert.not.equal(
      actual['jkl'].categories,
      features['jkl'].categories
    );
  } else {
    throw new Error("feature has wrong type");
  }
});

// clone selected features

test('clone selected features', () => {
  // copying
  const features: Features = readJson('features-1.json');
  const actual = cloneSelectedFeatures(features, ['age', 'favoriteNumber', 'job']);
  const expected = {
    'age': features['age'],
    'favoriteNumber': features['favoriteNumber'],
    'job': features['job'],
  };
  assert.equal(actual, expected);

  // mutating

  if (features['age'].type === 'Q' && actual['age'].type === 'Q') {
    features['age'].extent[0] = 0;
    assert.not.equal(
      features['age'].extent,
      actual['age'].extent
    );

    features['age'].thresholds[0] = 0;
    assert.not.equal(
      features['age'].thresholds,
      actual['age'].thresholds
    );
  } else {
    throw new Error("feature has wrong type");
  }

  features['age'].values.push('test');
  assert.not.equal(
    features['age'].values,
    actual['age'].values
  );

  features['favoriteNumber'].values.push('test');
  assert.not.equal(
    features['favoriteNumber'].values,
    actual['favoriteNumber'].values
  );

  features['job'].values.push('test');
  assert.not.equal(
    features['job'].values,
    actual['job'].values
  );

  if (features['job'].type === 'C' && actual['job'].type === 'C') {
    features['job'].categories.push('test');
    assert.not.equal(
      features['job'].categories,
      actual['job'].categories
    );

    features['job'].valueToGroup['test'] = 'test';
    assert.not.equal(
      features['job'].valueToGroup,
      actual['job'].valueToGroup
    );
  } else {
    throw new Error("feature has wrong type");
  }
});

// clone categorical feature

test('clone categorical feature', () => {
  const a: CategoricalFeature = {
    name: 'directions',
    type: 'C',
    values: ['N', 'S', 'E', 'W'],
    categories: ['N/S', 'E/W'],
    valueToGroup: {
      'N': 'N/S',
      'S': 'N/S',
      'E': 'E/W',
      'W': 'E/W',
    },
  };

  let copy = cloneCategoricalFeature(a);
  assert.equal(a, copy);

  // mutating values
  copy = cloneCategoricalFeature(a);
  copy.values.push('X');
  assert.not.equal(a, copy);

  // mutating categories
  copy = cloneCategoricalFeature(a);
  copy.categories.push('X');
  assert.not.equal(a, copy);

  // mutating valueToGroup
  copy = cloneCategoricalFeature(a);
  copy.valueToGroup['X'] = 'X';
  assert.not.equal(a, copy);
});

// clone quantitative feature

test('clone categorical feature', () => {
  const a: QuantitativeFeature = {
    name: 'num',
    type: 'Q',
    extent: [0, 9],
    splitType: 'quantile',
    numBins: 3,
    thresholds: [3, 6],
    values: ['[0, 3)', '[3, 6)', '[6, 9]'],
    format: '~s',
  };

  let copy = cloneQuantitativeFeature(a);
  assert.equal(a, copy);

  // mutating extent
  copy = cloneQuantitativeFeature(a);
  copy.extent.push(0);
  assert.not.equal(a, copy);

  // mutating thresholds
  copy = cloneQuantitativeFeature(a);
  copy.thresholds.push(0);
  assert.not.equal(a, copy);

  // mutating values
  copy = cloneQuantitativeFeature(a);
  copy.values.push('X');
  assert.not.equal(a, copy);
});

// are features equal

test('are categorical features equal - true', () => {
  const a: CategoricalFeature = {
    name: 'directions',
    type: 'C',
    values: ['N', 'S', 'E', 'W'],
    categories: ['N/S', 'E/W'],
    valueToGroup: {
      'N': 'N/S',
      'S': 'N/S',
      'E': 'E/W',
      'W': 'E/W',
    },
  };

  const b: CategoricalFeature = {
    name: 'directions',
    type: 'C',
    values: ['N', 'S', 'E', 'W'],
    categories: ['N/S', 'E/W'],
    valueToGroup: {
      'N': 'N/S',
      'S': 'N/S',
      'E': 'E/W',
      'W': 'E/W',
    },
  };

  assert.ok(areFeaturesEqual(a, b));
});

test('are quantitative features equal - true', () => {
  const a: QuantitativeFeature = {
    name: 'num',
    type: 'Q',
    extent: [0, 9],
    splitType: 'quantile',
    numBins: 3,
    thresholds: [3, 6],
    values: ['[0, 3)', '[3, 6)', '[6, 9]'],
    format: '~s',
  };

  const b: QuantitativeFeature = {
    name: 'num',
    type: 'Q',
    extent: [0, 9],
    splitType: 'quantile',
    numBins: 3,
    thresholds: [3, 6],
    values: ['[0, 3)', '[3, 6)', '[6, 9]'],
    format: '~s',
  };

  assert.ok(areFeaturesEqual(a, b));
});

test('are features equal - false, different types', () => {
  const a: CategoricalFeature = {
    name: 'directions',
    type: 'C',
    values: ['N', 'S', 'E', 'W'],
    categories: ['N/S', 'E/W'],
    valueToGroup: {
      'N': 'N/S',
      'S': 'N/S',
      'E': 'E/W',
      'W': 'E/W',
    },
  };

  const b: QuantitativeFeature = {
    name: 'num',
    type: 'Q',
    extent: [0, 9],
    splitType: 'quantile',
    numBins: 3,
    thresholds: [3, 6],
    values: ['[0, 3)', '[3, 6)', '[6, 9]'],
    format: '~s',
  };

  assert.not.ok(areFeaturesEqual(a, b));
});

test('are categorical features equal - false', () => {
  const a: CategoricalFeature = {
    name: 'directions',
    type: 'C',
    values: ['N', 'S', 'E', 'W'],
    categories: ['N/S', 'E/W'],
    valueToGroup: {
      'N': 'N/S',
      'S': 'N/S',
      'E': 'E/W',
      'W': 'E/W',
    },
  };

  const b: CategoricalFeature = {
    name: 'directions',
    type: 'C',
    values: ['N', 'S', 'E', 'W'],
    categories: ['N/S', 'E/W'],
    valueToGroup: {
      'N': 'N/S',
      'S': 'N/S',
      'E': 'E/W',
      'W': 'E/W',
    },
  };

  // different name
  assert.ok(areFeaturesEqual(a, b));
  b.name = 'X';
  assert.not.ok(areFeaturesEqual(a, b));

  // different values
  b.name = a.name;
  assert.ok(areFeaturesEqual(a, b));
  b.values = ['X'];
  assert.not.ok(areFeaturesEqual(a, b));

  // different categories
  b.values = a.values;
  assert.ok(areFeaturesEqual(a, b));
  b.categories = ['X'];
  assert.not.ok(areFeaturesEqual(a, b));

  // different valueToGroup
  b.categories = a.categories;
  assert.ok(areFeaturesEqual(a, b));
  b.valueToGroup = { X: 'X' };
  assert.not.ok(areFeaturesEqual(a, b));
});

test('are quantitative features equal - false', () => {
  const a: QuantitativeFeature = {
    name: 'num',
    type: 'Q',
    extent: [0, 9],
    splitType: 'quantile',
    numBins: 3,
    thresholds: [3, 6],
    values: ['[0, 3)', '[3, 6)', '[6, 9]'],
    format: '~s',
  };

  const b: QuantitativeFeature = {
    name: 'num',
    type: 'Q',
    extent: [0, 9],
    splitType: 'quantile',
    numBins: 3,
    thresholds: [3, 6],
    values: ['[0, 3)', '[3, 6)', '[6, 9]'],
    format: '~s',
  };

  // different name
  assert.ok(areFeaturesEqual(a, b));
  b.name = 'X';
  assert.not.ok(areFeaturesEqual(a, b));

  // different extent
  b.name = a.name;
  assert.ok(areFeaturesEqual(a, b));
  b.extent = [-100, -50];
  assert.not.ok(areFeaturesEqual(a, b));

  // different split type
  b.extent = a.extent;
  assert.ok(areFeaturesEqual(a, b));
  b.splitType = 'interval';
  assert.not.ok(areFeaturesEqual(a, b));

  // different num bins
  b.splitType = a.splitType;
  assert.ok(areFeaturesEqual(a, b));
  b.numBins = 1;
  assert.not.ok(areFeaturesEqual(a, b));

  // different thresholds
  b.numBins = a.numBins;
  assert.ok(areFeaturesEqual(a, b));
  b.thresholds = [0];
  assert.not.ok(areFeaturesEqual(a, b));

  // different values
  b.thresholds = a.thresholds;
  assert.ok(areFeaturesEqual(a, b));
  b.values = ['X'];
  assert.not.ok(areFeaturesEqual(a, b));

  // different format
  b.values = a.values;
  assert.ok(areFeaturesEqual(a, b));
  b.format = 'X';
  assert.not.ok(areFeaturesEqual(a, b));
});

// is numeric feature

test('is numeric feature - true', () => {
  assert.ok(isNumericFeature([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]));
});

test('is numeric feature - false, non-number', () => {
  assert.not.ok(isNumericFeature([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'a']));
});

test('is numeric feature - false, too few values', () => {
  assert.not.ok(isNumericFeature([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));
});

test('is numeric feature - false, too few unique values', () => {
  assert.not.ok(isNumericFeature([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 11, 11, 11, 11, 11, 11]));
});

// is quantitative feature

test('is quantitative feature', () => {
  assert.ok(isQuantitativeFeature([0, 1, 2]));
  assert.not.ok(isQuantitativeFeature(['a', 'b', 'c']));
});

// is categorical feature

test('is quantitative feature', () => {
  assert.not.ok(isCategoricalFeature([0, 1, 2]));
  assert.ok(isCategoricalFeature(['a', 'b', 'c']));
});

// get features

test('get features with predictions', () => {
  const dataWithPred = readCsv('dataset-1.csv');
  const expectedWithPred = readJson('features-1.json');
  assert.equal(
    getFeatures(dataWithPred),
    expectedWithPred
  );
});

test('get features without predictions', () => {
  const dataNoPred = readCsv('dataset-2.csv');
  const expectedNoPred = readJson('features-1.json');
  assert.equal(
    getFeatures(dataNoPred),
    expectedNoPred
  );
});

test('get features with one categorical feature with many values', () => {
  const data = readCsv('dataset-3.csv');
  const actual = getFeatures(data);
  const expected = readJson('features-6.json');

  if (actual.letter.type !== 'C') {
    throw new Error('wrong feature type');
  }

  assert.equal(actual.letter.name, expected.letter.name);
  assert.equal(actual.letter.values, expected.letter.values);
  assert.equal(actual.letter.categories.slice().sort(), actual.letter.categories.slice().sort());
  assert.equal(actual.letter.valueToGroup, expected.letter.valueToGroup);
  assert.equal(actual.letter.type, expected.letter.type);
});

test.run();