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

// dataset-1.csv ground truth percent yes and no
const d1PctYes = 13 / 25;
const d1PctNo = 12 / 25;

// dataset-1.csv predicted percent yes and no
const d1PctYesTrue = 6 / 25;
const d1PctYesFalse = 6 / 25;
const d1PctNoTrue = 6 / 25;
const d1PctNoFalse = 7 / 25;

// dataset-2.csv ground truth percent yes and no
const d2PctYes = 13 / 25;
const d2PctNo = 12 / 25;

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
        { label: "no", size: 12, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
        { label: "yes", size: 13, correct: true, offset: 12, pctPtDiffFromWhole: 0 },
      ],
      size: 25,
      splits: new Map()
    }
  ];

  const dataset = readCsv('dataset-2.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const features: Features = readJson('features-5.json');

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
        { label: "no", size: 12, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
        { label: "yes", size: 13, correct: true, offset: 12, pctPtDiffFromWhole: 0 },
      ],
      predictions: [
        { label: "no", size: 7, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
        { label: "no", size: 6, correct: true, offset: 7, pctPtDiffFromWhole: 0 },
        { label: "yes", size: 6, correct: false, offset: 13, pctPtDiffFromWhole: 0 },
        { label: "yes", size: 6, correct: true, offset: 19, pctPtDiffFromWhole: 0 },
      ],
      size: 25,
      splits: new Map()
    }
  ];

  const dataset = readCsv('dataset-1.csv');
  if (dataset.type === 'regression') {
    throw new Error('wrong dataset type');
  }

  const features: Features = readJson('features-5.json');

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
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 3) - d2PctNo },
        { label: "yes", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 3) - d2PctYes },
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
        { label: "no", size: 2, correct: true, offset: 0, pctPtDiffFromWhole: (2 / 2) - d2PctNo },
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
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 3) - d2PctNo },
        { label: "yes", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 3) - d2PctYes },
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
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 2) - d2PctNo },
        { label: "yes", size: 1, correct: true, offset: 1, pctPtDiffFromWhole: (1 / 2) - d2PctYes },
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
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 4) - d2PctNo },
        { label: "yes", size: 3, correct: true, offset: 1, pctPtDiffFromWhole: (3 / 4) - d2PctYes },
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
        { label: "no", size: 2, correct: true, offset: 0, pctPtDiffFromWhole: (2 / 2) - d2PctNo },
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
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 3) - d2PctNo },
        { label: "yes", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 3) - d2PctYes },
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
        { label: "no", size: 2, correct: true, offset: 0, pctPtDiffFromWhole: (2 / 3) - d2PctNo },
        { label: "yes", size: 1, correct: true, offset: 2, pctPtDiffFromWhole: (1 / 3) - d2PctYes },
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
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 3) - d2PctNo },
        { label: "yes", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 3) - d2PctYes },
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

  const features: Features = readJson('features-5.json');
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
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNo },
        { label: "yes", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 3) - d1PctYes },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNoFalse },
        { label: "yes", size: 1, correct: false, offset: 1, pctPtDiffFromWhole: (1 / 3) - d1PctYesFalse },
        { label: "yes", size: 1, correct: true, offset: 2, pctPtDiffFromWhole: (1 / 3) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 2, correct: true, offset: 0, pctPtDiffFromWhole: (2 / 2) - d1PctNo },
      ],
      size: 2,
      predictions: [
        { label: "no", size: 2, correct: true, offset: 0, pctPtDiffFromWhole: (2 / 2) - d1PctNoTrue },
      ],
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNo },
        { label: "yes", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 3) - d1PctYes },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNoFalse },
        { label: "yes", size: 1, correct: false, offset: 1, pctPtDiffFromWhole: (1 / 3) - d1PctYesFalse },
        { label: "yes", size: 1, correct: true, offset: 2, pctPtDiffFromWhole: (1 / 3) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 0],
        ['favoriteNumber', 2]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 2) - d1PctNo },
        { label: "yes", size: 1, correct: true, offset: 1, pctPtDiffFromWhole: (1 / 2) - d1PctYes },
      ],
      size: 2,
      predictions: [
        { label: "yes", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 2) - d1PctYesFalse },
        { label: "yes", size: 1, correct: true, offset: 1, pctPtDiffFromWhole: (1 / 2) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 4) - d1PctNo },
        { label: "yes", size: 3, correct: true, offset: 1, pctPtDiffFromWhole: (3 / 4) - d1PctYes },
      ],
      size: 4,
      predictions: [
        { label: "no", size: 2, correct: false, offset: 0, pctPtDiffFromWhole: (2 / 4) - d1PctNoFalse },
        { label: "yes", size: 1, correct: false, offset: 2, pctPtDiffFromWhole: (1 / 4) - d1PctYesFalse },
        { label: "yes", size: 1, correct: true, offset: 3, pctPtDiffFromWhole: (1 / 4) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 2, correct: true, offset: 0, pctPtDiffFromWhole: (2 / 2) - d1PctNo },
      ],
      size: 2,
      predictions: [
        { label: "no", size: 2, correct: true, offset: 0, pctPtDiffFromWhole: (2 / 2) - d1PctNoTrue },
      ],
      splits: new Map([
        ['age', 1],
        ['favoriteNumber', 2]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNo },
        { label: "yes", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 3) - d1PctYes },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNoFalse },
        { label: "no", size: 1, correct: true, offset: 1, pctPtDiffFromWhole: (1 / 3) - d1PctNoTrue },
        { label: "yes", size: 1, correct: true, offset: 2, pctPtDiffFromWhole: (1 / 3) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 2, correct: true, offset: 0, pctPtDiffFromWhole: (2 / 3) - d1PctNo },
        { label: "yes", size: 1, correct: true, offset: 2, pctPtDiffFromWhole: (1 / 3) - d1PctYes },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNoFalse },
        { label: "yes", size: 2, correct: false, offset: 1, pctPtDiffFromWhole: (2 / 3) - d1PctYesFalse },
      ],
      splits: new Map([
        ['age', 2],
        ['favoriteNumber', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNo },
        { label: "yes", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 3) - d1PctYes },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNoFalse },
        { label: "no", size: 1, correct: true, offset: 1, pctPtDiffFromWhole: (1 / 3) - d1PctNoTrue },
        { label: "yes", size: 1, correct: true, offset: 2, pctPtDiffFromWhole: (1 / 3) - d1PctYesTrue },
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

  const features: Features = readJson('features-5.json');

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
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNo },
        { label: "yes", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 3) - d1PctYes },
      ],
      size: 3,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 3) - d1PctNoFalse },
        { label: "yes", size: 1, correct: false, offset: 1, pctPtDiffFromWhole: (1 / 3) - d1PctYesFalse },
        { label: "yes", size: 1, correct: true, offset: 2, pctPtDiffFromWhole: (1 / 3) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 0],
        ['job', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 3, correct: true, offset: 0, pctPtDiffFromWhole: (3 / 5) - d1PctNo },
        { label: "yes", size: 2, correct: true, offset: 3, pctPtDiffFromWhole: (2 / 5) - d1PctYes },
      ],
      size: 5,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 5) - d1PctNoFalse },
        { label: "no", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 5) - d1PctNoTrue },
        { label: "yes", size: 1, correct: false, offset: 3, pctPtDiffFromWhole: (1 / 5) - d1PctYesFalse },
        { label: "yes", size: 1, correct: true, offset: 4, pctPtDiffFromWhole: (1 / 5) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 0],
        ['job', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "yes", size: 2, correct: true, offset: 0, pctPtDiffFromWhole: (2 / 2) - d1PctYes },
      ],
      size: 2,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 2) - d1PctNoFalse },
        { label: "yes", size: 1, correct: true, offset: 1, pctPtDiffFromWhole: (1 / 2) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 1],
        ['job', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 4, correct: true, offset: 0, pctPtDiffFromWhole: (4 / 6) - d1PctNo },
        { label: "yes", size: 2, correct: true, offset: 4, pctPtDiffFromWhole: (2 / 6) - d1PctYes },
      ],
      size: 6,
      predictions: [
        { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: (1 / 6) - d1PctNoFalse },
        { label: "no", size: 2, correct: true, offset: 1, pctPtDiffFromWhole: (2 / 6) - d1PctNoTrue },
        { label: "yes", size: 2, correct: false, offset: 3, pctPtDiffFromWhole: (2 / 6) - d1PctYesFalse },
        { label: "yes", size: 1, correct: true, offset: 5, pctPtDiffFromWhole: (1 / 6) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 1],
        ['job', 1]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 5) - d1PctNo },
        { label: "yes", size: 4, correct: true, offset: 1, pctPtDiffFromWhole: (4 / 5) - d1PctYes },
      ],
      size: 5,
      predictions: [
        { label: "no", size: 3, correct: false, offset: 0, pctPtDiffFromWhole: (3 / 5) - d1PctNoFalse },
        { label: "no", size: 1, correct: true, offset: 3, pctPtDiffFromWhole: (1 / 5) - d1PctNoTrue },
        { label: "yes", size: 1, correct: true, offset: 4, pctPtDiffFromWhole: (1 / 5) - d1PctYesTrue },
      ],
      splits: new Map([
        ['age', 2],
        ['job', 0]
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 3, correct: true, offset: 0, pctPtDiffFromWhole: (3 / 4) - d1PctNo },
        { label: "yes", size: 1, correct: true, offset: 3, pctPtDiffFromWhole: (1 / 4) - d1PctYes },
      ],
      size: 4,
      predictions: [
        { label: "no", size: 1, correct: true, offset: 0, pctPtDiffFromWhole: (1 / 4) - d1PctNoTrue },
        { label: "yes", size: 2, correct: false, offset: 1, pctPtDiffFromWhole: (2 / 4) - d1PctYesFalse },
        { label: "yes", size: 1, correct: true, offset: 3, pctPtDiffFromWhole: (1 / 4) - d1PctYesTrue },
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
        { label: "no", size: 5, correct: true, offset: 0, pctPtDiffFromWhole: (5 / 12) - d1PctNo },
        { label: "yes", size: 7, correct: true, offset: 5, pctPtDiffFromWhole: (7 / 12) - d1PctYes },
      ],
      size: 12,
      predictions: [
        { label: "no", size: 5, correct: false, offset: 0, pctPtDiffFromWhole: (5 / 12) - d1PctNoFalse },
        { label: "no", size: 3, correct: true, offset: 5, pctPtDiffFromWhole: (3 / 12) - d1PctNoTrue },
        { label: "yes", size: 2, correct: false, offset: 8, pctPtDiffFromWhole: (2 / 12) - d1PctYesFalse },
        { label: "yes", size: 2, correct: true, offset: 10, pctPtDiffFromWhole: (2 / 12) - d1PctYesTrue },
      ],
      splits: new Map([
        ['height', 0],
      ])
    },
    {
      type: 'classification',
      groundTruth: [
        { label: "no", size: 7, correct: true, offset: 0, pctPtDiffFromWhole: (7 / 13) - d1PctNo },
        { label: "yes", size: 6, correct: true, offset: 7, pctPtDiffFromWhole: (6 / 13) - d1PctYes },
      ],
      size: 13,
      predictions: [
        { label: "no", size: 2, correct: false, offset: 0, pctPtDiffFromWhole: (2 / 13) - d1PctNoFalse },
        { label: "no", size: 3, correct: true, offset: 2, pctPtDiffFromWhole: (3 / 13) - d1PctNoTrue },
        { label: "yes", size: 4, correct: false, offset: 5, pctPtDiffFromWhole: (4 / 13) - d1PctYesFalse },
        { label: "yes", size: 4, correct: true, offset: 9, pctPtDiffFromWhole: (4 / 13) - d1PctYesTrue },
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