import * as d3 from "d3";
import {
  cloneSelectedFeaturesMetadata,
  equalIntervalThresholds,
  getMetadata,
  getData,
  getBinLabels,
  getFilteredDataset,
  isNumeric,
  getWholeDatasetFeatureExtents,
  cloneFilters,
  addSelectedSetToFilters,
} from '../src/DataTransformer.js';

const fs = require('fs');

function readCsv(filename) {
  const data = d3.csvParse(
    fs.readFileSync(`./tests/data/${filename}`).toString(),
    d3.autoType
  );
  data.name = filename;

  return data;
}

function readJson(filename) {
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

  expect(actual).toStrictEqual(expected);
});

// is numeric

test('is numeric', () => {
  expect(isNumeric('0')).toBe(true);
  expect(isNumeric('1')).toBe(true);
  expect(isNumeric('0.00')).toBe(true);
  expect(isNumeric('-1')).toBe(true);
  expect(isNumeric('-0')).toBe(true);
  expect(isNumeric('-.5')).toBe(true);
  expect(isNumeric('-123.123')).toBe(true);

  expect(isNumeric('abc')).toBe(false);
  expect(isNumeric('.')).toBe(false);
  expect(isNumeric(' ')).toBe(false);
  expect(isNumeric('.0.')).toBe(false);
  expect(isNumeric('10..')).toBe(false);
  expect(isNumeric('1.0a')).toBe(false);
  expect(isNumeric('NaN')).toBe(false);
  expect(isNumeric('')).toBe(false);
  expect(isNumeric(null)).toBe(false);
  expect(isNumeric(undefined)).toBe(false);
  expect(isNumeric(NaN)).toBe(false);
})

// equal interval thresholds

test('equal interval thresholds', () => {
  expect(equalIntervalThresholds([0, 100], 5)).toStrictEqual([20, 40, 60, 80]);
  expect(equalIntervalThresholds([0, 1], 4)).toStrictEqual([0.25, 0.5, 0.75]);
  expect(equalIntervalThresholds([100, 400], 3)).toStrictEqual([200, 300]);
  expect(equalIntervalThresholds([-100, 0], 4)).toStrictEqual([-75, -50, -25]);
  expect(equalIntervalThresholds([-100, -90], 5)).toStrictEqual([-98, -96, -94, -92]);
});

// clone filters

test('clone filters', () => {
  const filters = [
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
  expect(copy[0]).not.toHaveProperty('selectedSet');

  // after removing selectedSet from filters, they should be equal
  delete filters[0].selectedSet;

  expect(copy).toStrictEqual(filters);

  // check that mutating filters does not mutate the copy
  filters[0].selected.push('d');
  expect(copy).not.toStrictEqual(filters);
});

// addSelectedSetToFilters

test('add selected set to filters', () => {
  const filters = [
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

  const filtersWithSelectedSet = [
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

  expect(addSelectedSetToFilters(filters)).toStrictEqual(filtersWithSelectedSet);
});

// get whole dataset features extent

test('get whole dataset feature extents', () => {
  const md = {
    features: {
      'abc': { name: 'abc', type: 'Q', extent: [-1, 1] },
      'def': { name: 'def', type: 'Q', extent: [15, 30] },
      'ghi': { name: 'ghi', type: 'C', categories: [1, 2, 3, 4, 5] },
      'jkl': { name: 'jkl', type: 'C', categories: ['a', 'b', 'c', 'd', 'e'] },
    }
  };

  const expected = {
    'abc': { type: 'Q', extent: [-1, 1] },
    'def': { type: 'Q', extent: [15, 30] },
    'ghi': { type: 'C', categories: [1, 2, 3, 4, 5] },
    'jkl': { type: 'C', categories: ['a', 'b', 'c', 'd', 'e'] },
  };

  const actual = getWholeDatasetFeatureExtents(md);

  expect(actual).toStrictEqual(expected);

  // mutating features should not mutate the feature extents

  md.features['abc'].extent[0] = 0;
  expect(actual['abc'].extent).not.toStrictEqual(md.features['abc'].extent);

  md.features['jkl'].categories[0] = 'x';
  expect(actual['jkl'].categories).not.toStrictEqual(md.features['jkl'].categories);
});

// clone selected features metadata

test('clone selected features metadata', () => {
  // copying
  const md = readJson('metadata-1.json');
  const actual = cloneSelectedFeaturesMetadata(md.features, ['age', 'favoriteNumber', 'job']);
  const expected = {
    'age': md.features['age'],
    'favoriteNumber': md.features['favoriteNumber'],
    'job': md.features['job'],
  };
  expect(actual).toStrictEqual(expected);

  // mutating

  md.features['age'].extent[0] = 0;
  expect(md.features['age'].extent).not.toStrictEqual(actual['age'].extent);

  md.features['age'].thresholds[0] = 0;
  expect(md.features['age'].thresholds).not.toStrictEqual(actual['age'].thresholds);

  md.features['age'].values.push('test');
  expect(md.features['age'].values).not.toStrictEqual(actual['age'].values);

  md.features['age'].values.push('test');
  expect(md.features['age'].values).not.toStrictEqual(actual['age'].values);

  md.features['job'].values.push('test');
  expect(md.features['job'].values).not.toStrictEqual(actual['job'].values);

  md.features['job'].categories.push('test');
  expect(md.features['job'].categories).not.toStrictEqual(actual['job'].categories);

  md.features['job'].valueToGroup['test'] = 'test';
  expect(md.features['job'].valueToGroup).not.toStrictEqual(actual['job'].valueToGroup);
});

// get metadata

test('get metadata with predictions', () => {
  const dataWithPred = readCsv('dataset-1.csv');
  const expectedWithPred = readJson('metadata-1.json');
  expect(getMetadata(dataWithPred)).toStrictEqual(expectedWithPred);
});

test('get metadata without predictions', () => {
  const dataNoPred = readCsv('dataset-2.csv');
  const expectedNoPred = readJson('metadata-2.json');
  expect(getMetadata(dataNoPred)).toStrictEqual(expectedNoPred);
});

// get data

test('get data null', () => {
  expect(getData(null, [], [])).toBe(null);
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
  const md = readJson('metadata-2.json');

  expect(getData(md, [], dataset)).toStrictEqual(expected);
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
  const md = readJson('metadata-1.json');

  expect(getData(md, [], dataset)).toStrictEqual(expected);
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
  const md = readJson('metadata-2.json');
  const data = getData(md, ['age', 'favoriteNumber'], dataset)
    .sort((a, b) => {
      return d3.ascending(
        `${a.splits.get('age')},${a.splits.get('favoriteNumber')}`,
        `${b.splits.get('age')},${b.splits.get('favoriteNumber')}`,
        )
    });

  expect(data).toStrictEqual(expected);
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
  const md = readJson('metadata-1.json');
  const data = getData(md, ['age', 'favoriteNumber'], dataset)
    .sort((a, b) => {
      return d3.ascending(
        `${a.splits.get('age')},${a.splits.get('favoriteNumber')}`,
        `${b.splits.get('age')},${b.splits.get('favoriteNumber')}`,
        )
    });

  expect(data).toStrictEqual(expected);
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
  const md = readJson('metadata-3.json');
  const data = getData(md, ['age', 'job'], dataset)
    .sort((a, b) => {
      return d3.ascending(
        `${a.splits.get('age')},${a.splits.get('job')}`,
        `${b.splits.get('age')},${b.splits.get('job')}`,
        )
    });

  expect(data).toStrictEqual(expected);
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
  const md = readJson('metadata-4.json');
  const data = getData(md, ['height'], dataset)
    .sort((a, b) => d3.ascending(a.splits.get('height'), b.splits.get('height')));

  expect(data).toStrictEqual(expected);
});

// filtered data

test('get filtered dataset - no filters', () => {
  const fullDataset = readCsv('dataset-1.csv');
  expect(getFilteredDataset(fullDataset, [])).toStrictEqual(fullDataset);
});

test('get filtered dataset - quantitative feature right inclusive', () => {
  const fullDataset = readCsv('dataset-1.csv');

  const filters = [
    {
      feature: 'age',
      type: 'Q',
      valid: true,
      min: 30,
      max: 40,
      rightInclusive: true
    }
  ];

  const result = getFilteredDataset(fullDataset, filters);

  expect(result.categories).toStrictEqual(fullDataset.categories);
  expect(result.name).toStrictEqual(fullDataset.name);
  expect(result).not.toStrictEqual(fullDataset);

  const ages = result.map(d => d.age);

  ages.forEach(d => {
    expect(d >= 30 && d <= 40).toBe(true);
  });

  expect(ages).toContain(30);
  expect(ages).toContain(40);
});

test('get filtered dataset - quantitative feature right exclusive', () => {
  const fullDataset = readCsv('dataset-1.csv');

  const filters = [
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

  expect(result.categories).toStrictEqual(fullDataset.categories);
  expect(result.name).toStrictEqual(fullDataset.name);
  expect(result).not.toStrictEqual(fullDataset);

  const ages = result.map(d => d.age);

  ages.forEach(d => {
    expect(d >= 30 && d < 40).toBe(true);
  });

  expect(ages).toContain(30);
  expect(ages).not.toContain(40);
});

test('get filtered dataset - number categories', () => {
  const fullDataset = readCsv('dataset-1.csv');

  const filters = [
    {
      feature: 'favoriteNumber',
      type: 'C',
      valid: true,
      selected: [1, 5],
      selectedSet: new Set([1, 5])
    }
  ];
  const result = getFilteredDataset(fullDataset, filters);

  expect(result.categories).toStrictEqual(fullDataset.categories);
  expect(result.name).toStrictEqual(fullDataset.name);
  expect(result).not.toStrictEqual(fullDataset);

  const favoriteNumbers = result.map(d => d.favoriteNumber);

  favoriteNumbers.forEach(d => {
    expect(d === 1 || d === 5).toBe(true);
  });

  expect(favoriteNumbers).not.toContain(3);
});

test('get filtered dataset - string categories', () => {
  const fullDataset = readCsv('dataset-1.csv');

  const filters = [
    {
      feature: 'job',
      type: 'C',
      valid: true,
      selected: ['student', 'teacher'],
      selectedSet: new Set(['student', 'teacher'])
    }
  ];
  const result = getFilteredDataset(fullDataset, filters);

  expect(result.categories).toStrictEqual(fullDataset.categories);
  expect(result.name).toStrictEqual(fullDataset.name);
  expect(result).not.toStrictEqual(fullDataset);

  const jobs = result.map(d => d.job);

  jobs.forEach(d => {
    expect(d === 'student' || d === 'teacher').toBe(true);
  });

  expect(jobs).not.toContain('zookeeper');
  expect(jobs).not.toContain('bartender');
  expect(jobs).not.toContain('accountant');
});

test('get filtered dataset - two filters', () => {
  const fullDataset = readCsv('dataset-1.csv');

  const filters = [
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

  expect(result.categories).toStrictEqual(fullDataset.categories);
  expect(result.name).toStrictEqual(fullDataset.name);
  expect(result).not.toStrictEqual(fullDataset);
  expect(result.length > 0).toBe(true);
  expect(result.length < fullDataset.length).toBe(true);

  result.forEach(d => {
    expect(d['job'] === 'student' || d['job'] === 'teacher').toBe(true);
    expect(d['age'] >= 30 && d['age'] <= 40).toBe(true);
  });
});