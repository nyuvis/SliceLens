import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as d3 from "d3";
import {
  getClassificationData,
} from '../src/lib/Data';
import * as fs from "fs";
import { parseDataset } from '../src/lib/Dataset';
import type { Dataset, ClassificationNode, Features } from '../src/types';

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

// get classification data

test('get classification data null', () => {
  const dataset = readCsv('dataset-1.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }
  assert.equal(getClassificationData(null, [], dataset), null);
});

test('get classification data without predictions, no selected features', () => {
  const expected: ClassificationNode[] = [
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 12, correct: true, offset: 0 },
        { label: "yes", size: 13, correct: true, offset: 12 },
      ],
      size: 25,
      splits: new Map()
    }
  ];

  const dataset = readCsv('dataset-2.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const features: Features = readJson('features-2.json');

  assert.equal(
    getClassificationData(features, [], dataset),
    expected
  );
});

test('get classification data with predictions, no selected features', () => {
  const expected: ClassificationNode[] = [
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 12, correct: true, offset: 0 },
        { label: "yes", size: 13, correct: true, offset: 12 },
      ],
      predictions: [
        { label: "no", size: 7, correct: false, offset: 0 },
        { label: "no", size: 6, correct: true, offset: 7 },
        { label: "yes", size: 6, correct: false, offset: 13 },
        { label: "yes", size: 6, correct: true, offset: 19 },
      ],
      size: 25,
      splits: new Map()
    }
  ];

  const dataset = readCsv('dataset-1.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const features: Features = readJson('features-1.json');

  assert.equal(
    getClassificationData(features, [], dataset),
    expected
  );
});

test('get classification data without predictions, two selected features', () => {
  const expected: ClassificationNode[] = [
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 1 },
      ],
      size: 3,
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 2, correct: true, offset: 0 },
      ],
      size: 2,
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 1 },
      ],
      size: 3,
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 2]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 1, correct: true, offset: 1 },
      ],
      size: 2,
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 3, correct: true, offset: 1 },
      ],
      size: 4,
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 2, correct: true, offset: 0 },
      ],
      size: 2,
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 2]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 1 },
      ],
      size: 3,
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 2, correct: true, offset: 0 },
        { label: "yes", size: 1, correct: true, offset: 2 },
      ],
      size: 3,
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 1 },
      ],
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

  const features: Features = readJson('features-2.json');
  const data = getClassificationData(features, ['age', 'favoriteNumber'], dataset)
    .sort((a, b) => {
      return d3.ascending(
        `${a.splits.get('age')},${a.splits.get('favoriteNumber')}`,
        `${b.splits.get('age')},${b.splits.get('favoriteNumber')}`,
        )
    });

  assert.equal(data, expected);
});

test('get classification data with predictions, two selected features', () => {
  const expected: ClassificationNode[] = [
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 1 },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0 },
        { label: "yes", size: 1, correct: false, offset: 1 },
        { label: "yes", size: 1, correct: true, offset: 2 },
      ],
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 2, correct: true, offset: 0 },
      ],
      size: 2,
      predictions: [
        { label: "no", size: 2, correct: true, offset: 0 },
      ],
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 1 },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0 },
        { label: "yes", size: 1, correct: false, offset: 1 },
        { label: "yes", size: 1, correct: true, offset: 2 },
      ],
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 2]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 1, correct: true, offset: 1 },
      ],
      size: 2,
      predictions: [
        { label: "yes", size: 1, correct: false, offset: 0 },
        { label: "yes", size: 1, correct: true, offset: 1 },
      ],
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 3, correct: true, offset: 1 },
      ],
      size: 4,
      predictions: [
        { label: "no", size: 2, correct: false, offset: 0 },
        { label: "yes", size: 1, correct: false, offset: 2 },
        { label: "yes", size: 1, correct: true, offset: 3 },
      ],
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 2, correct: true, offset: 0 },
      ],
      size: 2,
      predictions: [
        { label: "no", size: 2, correct: true, offset: 0 },
      ],
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 2]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 1 },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0 },
        { label: "no", size: 1, correct: true, offset: 1 },
        { label: "yes", size: 1, correct: true, offset: 2 },
      ],
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 2, correct: true, offset: 0 },
        { label: "yes", size: 1, correct: true, offset: 2 },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0 },
        { label: "yes", size: 2, correct: false, offset: 1 },
      ],
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 1 },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0 },
        { label: "no", size: 1, correct: true, offset: 1 },
        { label: "yes", size: 1, correct: true, offset: 2 },
      ],
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

  const features: Features = readJson('features-1.json');

  const data = getClassificationData(features, ['age', 'favoriteNumber'], dataset)
    .sort((a, b) => {
      return d3.ascending(
        `${a.splits.get('age')},${a.splits.get('favoriteNumber')}`,
        `${b.splits.get('age')},${b.splits.get('favoriteNumber')}`,
        )
    });

  assert.equal(data, expected);
});

test('get classification data with predictions, two selected features, one grouped', () => {
  const expected: ClassificationNode[] = [
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 1 },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0 },
        { label: "yes", size: 1, correct: false, offset: 1 },
        { label: "yes", size: 1, correct: true, offset: 2 },
      ],
      splits: new Map([
        ['age', 0],
        ['job', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 3, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 3 },
      ],
      size: 5,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0 },
        { label: "no", size: 2, correct: true, offset: 1 },
        { label: "yes", size: 1, correct: false, offset: 3 },
        { label: "yes", size: 1, correct: true, offset: 4 },
      ],
      splits: new Map([
        ['age', 0],
        ['job', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "yes", size: 2, correct: true, offset: 0 },
      ],
      size: 2,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0 },
        { label: "yes", size: 1, correct: true, offset: 1 },
      ],
      splits: new Map([
        ['age', 1],
        ['job', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 4, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: true, offset: 4 },
      ],
      size: 6,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0 },
        { label: "no", size: 2, correct: true, offset: 1 },
        { label: "yes", size: 2, correct: false, offset: 3 },
        { label: "yes", size: 1, correct: true, offset: 5 },
      ],
      splits: new Map([
        ['age', 1],
        ['job', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 4, correct: true, offset: 1 },
      ],
      size: 5,
      predictions: [
        { label: "no", size: 3, correct: false, offset: 0 },
        { label: "no", size: 1, correct: true, offset: 3 },
        { label: "yes", size: 1, correct: true, offset: 4 },
      ],
      splits: new Map([
        ['age', 2],
        ['job', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 3, correct: true, offset: 0 },
        { label: "yes", size: 1, correct: true, offset: 3 },
      ],
      size: 4,
      predictions: [
        { label: "no", size: 1, correct: true, offset: 0 },
        { label: "yes", size: 2, correct: false, offset: 1 },
        { label: "yes", size: 1, correct: true, offset: 3 },
      ],
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

  const features: Features = readJson('features-3.json');
  const data = getClassificationData(features, ['age', 'job'], dataset)
    .sort((a, b) => {
      return d3.ascending(
        `${a.splits.get('age')},${a.splits.get('job')}`,
        `${b.splits.get('age')},${b.splits.get('job')}`,
        )
    });

  assert.equal(data, expected);
});

test('get classification data with predictions, one selected feature, empty subset', () => {
  const expected: ClassificationNode[] = [
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 5, correct: true, offset: 0 },
        { label: "yes", size: 7, correct: true, offset: 5 },
      ],
      size: 12,
      predictions: [
        { label: "no", size: 5, correct: false, offset: 0 },
        { label: "no", size: 3, correct: true, offset: 5 },
        { label: "yes", size: 2, correct: false, offset: 8 },
        { label: "yes", size: 2, correct: true, offset: 10 },
      ],
      splits: new Map([
        ['height', 0],
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 7, correct: true, offset: 0 },
        { label: "yes", size: 6, correct: true, offset: 7 },
      ],
      size: 13,
      predictions: [
        { label: "no", size: 2, correct: false, offset: 0 },
        { label: "no", size: 3, correct: true, offset: 2 },
        { label: "yes", size: 4, correct: false, offset: 5 },
        { label: "yes", size: 4, correct: true, offset: 9 },
      ],
      splits: new Map([
        ['height', 2],
      ])
    }
  ];

  const dataset = readCsv('dataset-1.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const features: Features = readJson('features-4.json');
  const data = getClassificationData(features, ['height'], dataset)
    .sort((a, b) => d3.ascending(a.splits.get('height'), b.splits.get('height')));

  assert.equal(data, expected);
});

test.run();