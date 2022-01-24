import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as d3 from "d3";
import {
  cloneSelectedFeatures,
  equalIntervalThresholds,
  getFeatures,
  getClassificationData,
  getBinLabels,
  getFilteredDataset,
  isNumeric,
  getWholeDatasetFeatureExtents,
  cloneFilters,
  addSelectedSetToFilters,
  getScales,
  getPositionOfSquare,
  getTooltipAmounts,
  parseDataset
} from '../src/DataTransformer';
import * as fs from "fs";
import type {Filter, Features, Dataset} from '../src/types';

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

// is numeric

test('is numeric', () => {
  assert.ok(isNumeric('0'));
  assert.ok(isNumeric('1'));
  assert.ok(isNumeric('0.00'));
  assert.ok(isNumeric('-1'));
  assert.ok(isNumeric('-0'));
  assert.ok(isNumeric('-.5'));
  assert.ok(isNumeric('-123.123'));

  assert.not(isNumeric('abc'));
  assert.not(isNumeric('.'));
  assert.not(isNumeric(' '));
  assert.not(isNumeric('.0.'));
  assert.not(isNumeric('10..'));
  assert.not(isNumeric('1.0a'));
  assert.not(isNumeric('NaN'));
  assert.not(isNumeric(''));
  assert.not(isNumeric(null));
  assert.not(isNumeric(undefined));
  assert.not(isNumeric(NaN));
})

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

// clone selected features metadata

test('clone selected features metadata', () => {
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

  features['age'].values.push('test');
  assert.not.equal(
    features['age'].values,
    actual['age'].values
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

// get metadata

test('get metadata with predictions', () => {
  const dataWithPred = readCsv('dataset-1.csv');
  const expectedWithPred = readJson('features-1.json');
  assert.equal(
    getFeatures(dataWithPred),
    expectedWithPred
  );
});

test('get metadata without predictions', () => {
  const dataNoPred = readCsv('dataset-2.csv');
  const expectedNoPred = readJson('features-2.json');
  assert.equal(
    getFeatures(dataNoPred),
    expectedNoPred
  );
});

// get data

test('get data null', () => {
  const dataset = readCsv('dataset-1.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }
  assert.equal(getClassificationData(null, [], dataset), null);
});

test('get data without predictions, no selected features', () => {
  const expected = [
    {
      groundTruth: new d3.InternMap([["no", 12], ["yes", 13]]),
      size: 25,
      splits: new Map()
    }
  ];
  const dataset = readCsv('dataset-2.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }
  const features = readJson('features-2.json');

  assert.equal(
    getClassificationData(features, [], dataset),
    expected
  );
});

test('get data with predictions, no selected features', () => {
  const expected = [
    {
      groundTruth: new d3.InternMap([["no", 12], ["yes", 13]]),
      predictionCounts: new d3.InternMap([["no", 13], ["yes", 12]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["correct", 6], ["incorrect", 7]])],
        ["yes", new d3.InternMap([["correct", 6], ["incorrect", 6]])],
      ]),
      size: 25,
      splits: new Map()
    }
  ];

  const dataset = readCsv('dataset-1.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }
  const features = readJson('features-1.json');

  assert.equal(
    getClassificationData(features, [], dataset),
    expected
  );
});

test('get data without predictions, two selected features', () => {
  const expected = [
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 2]]),
      size: 3,
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 0]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 2]]),
      size: 2,
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 1]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 2]]),
      size: 3,
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 2]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 1]]),
      size: 2,
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 0]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 3]]),
      size: 4,
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 1]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 2]]),
      size: 2,
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 2]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 2]]),
      size: 3,
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 0]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 2], ["yes", 1]]),
      size: 3,
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 1]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 2]]),
      size: 3,
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 2]
      ])
    }
  ];

  const dataset = readCsv('dataset-2.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const features = readJson('features-2.json');
  const data = getClassificationData(features, ['age', 'favoriteNumber'], dataset)
    .sort((a, b) => {
      return d3.ascending(
        `${a.splits.get('age')},${a.splits.get('favoriteNumber')}`,
        `${b.splits.get('age')},${b.splits.get('favoriteNumber')}`,
        )
    });

  assert.equal(data, expected);
});

test('get data with predictions, two selected features', () => {
  const expected = [
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 2]]),
      size: 3,
      predictionCounts: new d3.InternMap([["no", 1], ["yes", 2]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["incorrect", 1]])],
        ["yes", new d3.InternMap([["correct", 1], ["incorrect", 1]])],
      ]),
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 0]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 2]]),
      size: 2,
      predictionCounts: new d3.InternMap([["no", 2]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["correct", 2]])],
      ]),
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 1]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 2]]),
      size: 3,
      predictionCounts: new d3.InternMap([["no", 1], ["yes", 2]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["incorrect", 1]])],
        ["yes", new d3.InternMap([["correct", 1], ["incorrect", 1]])],
      ]),
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 2]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 1]]),
      size: 2,
      predictionCounts: new d3.InternMap([["yes", 2]]),
      predictionResults: new d3.InternMap([
        ["yes", new d3.InternMap([["correct", 1], ["incorrect", 1]])],
      ]),
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 0]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 3]]),
      size: 4,
      predictionCounts: new d3.InternMap([["no", 2], ["yes", 2]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["incorrect", 2]])],
        ["yes", new d3.InternMap([["correct", 1], ["incorrect", 1]])],
      ]),
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 1]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 2]]),
      size: 2,
      predictionCounts: new d3.InternMap([["no", 2]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["correct", 2]])],
      ]),
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 2]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 2]]),
      size: 3,
      predictionCounts: new d3.InternMap([["no", 2], ["yes", 1]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["correct", 1], ["incorrect", 1]])],
        ["yes", new d3.InternMap([["correct", 1]])],
      ]),
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 0]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 2], ["yes", 1]]),
      size: 3,
      predictionCounts: new d3.InternMap([["no", 1], ["yes", 2]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["incorrect", 1]])],
        ["yes", new d3.InternMap([["incorrect", 2]])],
      ]),
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 1]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 2]]),
      size: 3,
      predictionCounts: new d3.InternMap([["no", 2], ["yes", 1]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["correct", 1], ["incorrect", 1]])],
        ["yes", new d3.InternMap([["correct", 1]])],
      ]),
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 2]
      ])
    }
  ];

  const dataset = readCsv('dataset-1.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const features = readJson('features-1.json');

  const data = getClassificationData(features, ['age', 'favoriteNumber'], dataset)
    .sort((a, b) => {
      return d3.ascending(
        `${a.splits.get('age')},${a.splits.get('favoriteNumber')}`,
        `${b.splits.get('age')},${b.splits.get('favoriteNumber')}`,
        )
    });

  assert.equal(data, expected);
});

test('get data with predictions, two selected features, one grouped', () => {
  const expected = [
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 2]]),
      size: 3,
      predictionCounts: new d3.InternMap([["no", 1], ["yes", 2]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["incorrect", 1]])],
        ["yes", new d3.InternMap([["correct", 1], ["incorrect", 1]])],
      ]),
      splits: new Map([
        ['age', 0],
        ['job', 0]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 3], ["yes", 2]]),
      size: 5,
      predictionCounts: new d3.InternMap([["no", 3], ["yes", 2]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["correct", 2], ["incorrect", 1]])],
        ["yes", new d3.InternMap([["correct", 1], ["incorrect", 1]])],
      ]),
      splits: new Map([
        ['age', 0],
        ['job', 1]
      ])
    },
    {
      groundTruth: new d3.InternMap([["yes", 2]]),
      size: 2,
      predictionCounts: new d3.InternMap([["no", 1], ["yes", 1]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["incorrect", 1]])],
        ["yes", new d3.InternMap([["correct", 1]])],
      ]),
      splits: new Map([
        ['age', 1],
        ['job', 0]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 4], ["yes", 2]]),
      size: 6,
      predictionCounts: new d3.InternMap([["yes", 3], ["no", 3]]),
      predictionResults: new d3.InternMap([
        ["yes", new d3.InternMap([["incorrect", 2], ["correct", 1]])],
        ["no", new d3.InternMap([["correct", 2], ["incorrect", 1]])],
      ]),
      splits: new Map([
        ['age', 1],
        ['job', 1]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 1], ["yes", 4]]),
      size: 5,
      predictionCounts: new d3.InternMap([["no", 4], ["yes", 1]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["incorrect", 3], ["correct", 1]])],
        ["yes", new d3.InternMap([["correct", 1]])],
      ]),
      splits: new Map([
        ['age', 2],
        ['job', 0]
      ])
    },
    {
      groundTruth: new d3.InternMap([["no", 3], ["yes", 1]]),
      size: 4,
      predictionCounts: new d3.InternMap([["no", 1], ["yes", 3]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["correct", 1]])],
        ["yes", new d3.InternMap([["correct", 1], ["incorrect", 2]])],
      ]),
      splits: new Map([
        ['age', 2],
        ['job', 1]
      ])
    }
  ];

  const dataset = readCsv('dataset-1.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const features = readJson('features-3.json');
  const data = getClassificationData(features, ['age', 'job'], dataset)
    .sort((a, b) => {
      return d3.ascending(
        `${a.splits.get('age')},${a.splits.get('job')}`,
        `${b.splits.get('age')},${b.splits.get('job')}`,
        )
    });

  assert.equal(data, expected);
});

test('get data with predictions, one selected feature, empty subset', () => {
  const expected = [
    {
      groundTruth: new d3.InternMap([["no", 5], ["yes", 7]]),
      size: 12,
      predictionCounts: new d3.InternMap([["no", 8], ["yes", 4]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["incorrect", 5], ["correct", 3]])],
        ["yes", new d3.InternMap([["correct", 2], ["incorrect", 2]])],
      ]),
      splits: new Map([
        ['height', 0],
      ])
    },
    {
      groundTruth: new d3.InternMap([["yes", 6], ["no", 7]]),
      size: 13,
      predictionCounts: new d3.InternMap([["no", 5], ["yes", 8]]),
      predictionResults: new d3.InternMap([
        ["no", new d3.InternMap([["incorrect", 2], ["correct", 3]])],
        ["yes", new d3.InternMap([["incorrect", 4], ["correct", 4]])],
      ]),
      splits: new Map([
        ['height', 2],
      ])
    }
  ];

  const dataset = readCsv('dataset-1.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const features = readJson('features-4.json');
  const data = getClassificationData(features, ['height'], dataset)
    .sort((a, b) => d3.ascending(a.splits.get('height'), b.splits.get('height')));

  assert.equal(data, expected);
});

// filtered data

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

test('get filtered dataset - number categories', () => {
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

  assert.ok(result.rows.length > 0);
  assert.ok(result.size < fullDataset.size);

  assert.not.equal(result.rows, fullDataset.rows);

  const favoriteNumbers = result.rows.map(d => d.favoriteNumber);

  favoriteNumbers.forEach(d => {
    assert.ok(d === '1' || d === '5');
  });

  assert.not(favoriteNumbers.includes('3'));
});

test('get filtered dataset - string categories', () => {
  const fullDataset = readCsv('dataset-1.csv');

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

test('get filtered dataset - two filters', () => {
  const fullDataset = readCsv('dataset-1.csv');

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

  assert.ok(result.rows.length > 0);
  assert.ok(result.size < fullDataset.size);

  assert.not.equal(result.rows, fullDataset.rows);


  result.rows.forEach(d => {
    assert.ok(d['job'] === 'student' || d['job'] === 'teacher');
    assert.ok(d['age'] >= 30 && d['age'] <= 40);
  });
});

// getScales

test('getScales no features', () => {
  assert.equal(getScales([], 100, false), []);
});

test('getScales one feature', () => {
  const md = readJson('metadata-1.json');
  const features = [md.features['age']];
  const actual = getScales(features, 300, false);
  const expected = [
    d3.scaleBand<number>().domain([0, 1, 2]).range([0, 300]),
  ];

  assert.equal(actual[0].domain(), expected[0].domain());
  assert.equal(actual[0].range(), expected[0].range());
  assert.equal(actual[0].bandwidth(), expected[0].bandwidth());
});

test('getScales two features', () => {
  const md = readJson('metadata-1.json');
  const features = [md.features['age'], md.features['job']];
  const actual = getScales(features, 300, false);
  const expected = [
    d3.scaleBand<number>().domain([0, 1, 2]).range([0, 300]),
    d3.scaleBand<number>().domain([0, 1, 2, 3, 4]).range([0, 100]),
  ];

  assert.equal(actual[0].domain(), expected[0].domain());
  assert.equal(actual[0].range(), expected[0].range());
  assert.equal(actual[0].bandwidth(), expected[0].bandwidth());

  assert.equal(actual[1].domain(), expected[1].domain());
  assert.equal(actual[1].range(), expected[1].range());
  assert.equal(actual[1].bandwidth(), expected[1].bandwidth());
});

test('getScales two features reverse', () => {
  const md = readJson('metadata-1.json');
  const features = [md.features['age'], md.features['job']];
  const actual = getScales(features, 300, true);
  const expected = [
    d3.scaleBand<number>().domain([2, 1, 0]).range([0, 300]),
    d3.scaleBand<number>().domain([4, 3, 2, 1, 0]).range([0, 100]),
  ];

  assert.equal(actual[0].domain(), expected[0].domain());
  assert.equal(actual[0].range(), expected[0].range());
  assert.equal(actual[0].bandwidth(), expected[0].bandwidth());

  assert.equal(actual[1].domain(), expected[1].domain());
  assert.equal(actual[1].range(), expected[1].range());
  assert.equal(actual[1].bandwidth(), expected[1].bandwidth());
});

// getPositionOfSquare

test('get position of square no features', () => {
  const d = {
    groundTruth: new d3.InternMap([["no", 100], ["yes", 200]]),
    size: 300,
    predictionCounts: new d3.InternMap([["no", 150], ["yes", 150]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 150]])],
      ["yes", new d3.InternMap([["correct", 100], ["incorrect", 50]])],
    ]),
    splits: new Map([
      ['age', 0],
      ['job', 2]
    ])
  };

  assert.is(getPositionOfSquare(d, [], []), 0);
});

test('get position of square one feature', () => {
  const md = readJson('metadata-1.json');

  const d = {
    groundTruth: new d3.InternMap([["no", 100], ["yes", 200]]),
    size: 300,
    predictionCounts: new d3.InternMap([["no", 150], ["yes", 150]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 150]])],
      ["yes", new d3.InternMap([["correct", 100], ["incorrect", 50]])],
    ]),
    splits: new Map([
      ['age', 0],
      ['job', 2]
    ])
  };

  const features = [md.features['age']];
  const scales = [
    d3.scaleBand<number>().domain([0, 1, 2]).range([0, 300]),
  ];

  d.splits.set('age', 0);
  assert.is(getPositionOfSquare(d, features, scales), 0);

  d.splits.set('age', 1);
  assert.is(getPositionOfSquare(d, features, scales), 100);

  d.splits.set('age', 2);
  assert.is(getPositionOfSquare(d, features, scales), 200);
});

test('get position of square two features', () => {
  const md = readJson('metadata-1.json');

  const d = {
    groundTruth: new d3.InternMap([["no", 100], ["yes", 200]]),
    size: 300,
    predictionCounts: new d3.InternMap([["no", 150], ["yes", 150]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 150]])],
      ["yes", new d3.InternMap([["correct", 100], ["incorrect", 50]])],
    ]),
    splits: new Map([
      ['age', 0],
      ['job', 2]
    ])
  };

  const features = [md.features['age'], md.features['job']];
  const scales = [
    d3.scaleBand<number>().domain([0, 1, 2]).range([0, 300]),
    d3.scaleBand<number>().domain([0, 1, 2, 3, 4]).range([0, 100]),
  ];

  for (let age = 0; age < 3; age++) {
    for (let job = 0; job < 5; job++) {
      d.splits.set('age', age);
      d.splits.set('job', job);
      assert.is(getPositionOfSquare(d, features, scales), age * 100 + job * 20);
    }
  }
});

// tooltips

test('get tooltip amounts with predictions', () => {
  const d = {
    groundTruth: new d3.InternMap([["no", 100], ["yes", 200]]),
    size: 300,
    predictionCounts: new d3.InternMap([["no", 150], ["yes", 150]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 150]])],
      ["yes", new d3.InternMap([["correct", 100], ["incorrect", 50]])],
    ]),
    splits: new Map([
      ['age', 0],
      ['favoriteNumber', 2]
    ])
  };

  const expected = [
    {
      label: 'no (incorrect)',
      count: 150,
      percent: '50.0%',
      stripes: true,
      colorLabel: 'no'
    },
    {
      label: 'yes (incorrect)',
      count: 50,
      percent: '16.7%',
      stripes: true,
      colorLabel: 'yes'
    },
    {
      label: 'yes (correct)',
      count: 100,
      percent: '33.3%',
      stripes: false,
      colorLabel: 'yes'
    }
  ];

  const actual = getTooltipAmounts(true, d, d3.format('.1%'));

  assert.equal(actual, expected);
});

test('get tooltip amounts with predictions sorting', () => {
  const d = {
    // change order of elements in maps
    groundTruth: new d3.InternMap([["yes", 200], ["no", 100]]),
    size: 300,
    predictionCounts: new d3.InternMap([["yes", 150], ["no", 150]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 150]])],
      ["yes", new d3.InternMap([["incorrect", 50], ["correct", 100]])],
    ]),
    splits: new Map([
      ['age', 0],
      ['favoriteNumber', 2]
    ])
  };

  const expected = [
    {
      label: 'no (incorrect)',
      count: 150,
      percent: '50.0%',
      stripes: true,
      colorLabel: 'no'
    },
    {
      label: 'yes (incorrect)',
      count: 50,
      percent: '16.7%',
      stripes: true,
      colorLabel: 'yes'
    },
    {
      label: 'yes (correct)',
      count: 100,
      percent: '33.3%',
      stripes: false,
      colorLabel: 'yes'
    }
  ];

  const actual = getTooltipAmounts(true, d, d3.format('.1%'));

  assert.equal(actual, expected);
});

test('get tooltip amounts no predictions', () => {
  const d = {
    groundTruth: new d3.InternMap([["no", 100], ["yes", 200]]),
    size: 300,
    predictionCounts: new d3.InternMap([["no", 150], ["yes", 150]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 150]])],
      ["yes", new d3.InternMap([["correct", 100], ["incorrect", 50]])],
    ]),
    splits: new Map([
      ['age', 0],
      ['favoriteNumber', 2]
    ])
  };

  const expected = [
    {
      label: 'no',
      count: 100,
      percent: '33.3%',
      stripes: false,
      colorLabel: 'no'
    },
    {
      label: 'yes',
      count: 200,
      percent: '66.7%',
      stripes: false,
      colorLabel: 'yes'
    }
  ];

  const actual = getTooltipAmounts(false, d, d3.format('.1%'));

  assert.equal(actual, expected);
});

test('get tooltip amounts no predictions sorting', () => {
  const d = {
    // flipped order of yes and no here
    groundTruth: new d3.InternMap([["yes", 200], ["no", 100]]),
    size: 300,
    predictionCounts: new d3.InternMap([["no", 150], ["yes", 150]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 150]])],
      ["yes", new d3.InternMap([["correct", 100], ["incorrect", 50]])],
    ]),
    splits: new Map([
      ['age', 0],
      ['favoriteNumber', 2]
    ])
  };

  const expected = [
    {
      label: 'no',
      count: 100,
      percent: '33.3%',
      stripes: false,
      colorLabel: 'no'
    },
    {
      label: 'yes',
      count: 200,
      percent: '66.7%',
      stripes: false,
      colorLabel: 'yes'
    }
  ];

  const actual = getTooltipAmounts(false, d, d3.format('.1%'));

  assert.equal(actual, expected);
});

test.run();