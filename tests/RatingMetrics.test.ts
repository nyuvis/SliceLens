import { test } from 'uvu';
import * as assert from 'uvu/assert';
import sinon from "sinon";
import * as d3 from "d3";
import { metrics, getErrorCountForSquare, getValidMetrics } from '../src/RatingMetrics';
import type { Rating, ClassificationRatingInput } from '../src/RatingMetrics'
import type { Features, Node, ClassificationNode, Dataset, ClassificationDataset } from '../src/types'

// data

const dataAB: ClassificationNode[] = [
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 200, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 200, correct: true, offset: 200, pctPtDiffFromWhole: 0 },
    ],
    size: 400,
    predictions: [
      { label: "no", size: 50, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 100, correct: true, offset: 50,pctPtDiffFromWhole: 0 },
      { label: "yes", size: 50, correct: false, offset: 150, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 200, correct: true, offset: 200, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 0],
      ['b', 0]
    ])
  },
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 50, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 50, correct: true, offset: 50, pctPtDiffFromWhole: 0 },
    ],
    size: 100,
    predictions: [
      { label: "no", size: 50, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 50, correct: true, offset: 50, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 0],
      ['b', 1]
    ])
  },
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 100, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 100, correct: true, offset: 100, pctPtDiffFromWhole: 0 },
    ],
    size: 200,
    predictions: [
      { label: "no", size: 75, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 25, correct: true, offset: 75, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 10, correct: false, offset: 100, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 90, correct: true, offset: 110, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 1],
      ['b', 0]
    ])
  },
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 5, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 5, correct: true, offset: 10, pctPtDiffFromWhole: 0 },
    ],
    size: 10,
    predictions: [
      { label: "no", size: 5, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 5, correct: false, offset: 5, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 1],
      ['b', 1]
    ])
  }
];

const dataAC: Node[] = [
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 100, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 300, correct: true, offset: 300, pctPtDiffFromWhole: 0 },
    ],
    size: 400,
    predictions: [
      { label: "no", size: 30, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 80, correct: true, offset: 30, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 45, correct: false, offset: 110, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 245, correct: true, offset: 155, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 0],
      ['c', 0]
    ])
  },
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 70, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 30, correct: true, offset: 70, pctPtDiffFromWhole: 0 },
    ],
    size: 100,
    predictions: [
      { label: "no", size: 30, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 20, correct: true, offset: 30, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 10, correct: false, offset: 50, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 40, correct: true, offset: 60, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 0],
      ['c', 1]
    ])
  },
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 20, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 180, correct: true, offset: 20, pctPtDiffFromWhole: 0 },
    ],
    size: 200,
    predictions: [
      { label: "no", size: 5, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 20, correct: true, offset: 5, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 25, correct: false, offset: 25, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 150, correct: true, offset: 50, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 1],
      ['c', 0]
    ])
  },
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 8, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 2, correct: true, offset: 8, pctPtDiffFromWhole: 0 },
    ],
    size: 10,
    predictions: [
      { label: "no", size: 1, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 7, correct: true, offset: 1, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 1, correct: false, offset: 8, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 1, correct: true, offset: 9, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 1],
      ['c', 1]
    ])
  }
];

const dataAD: Node[] = [
  {
    type: 'classification',
    groundTruth: [
      { label: "yes", size: 400, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
    ],
    size: 400,
    predictions: [
      { label: "yes", size: 400, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 0],
      ['b', 0]
    ])
  },
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 100, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
    ],
    size: 100,
    predictions: [
      { label: "no", size: 100, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 0],
      ['b', 1]
    ])
  },
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 200, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
    ],
    size: 200,
    predictions: [
      { label: "no", size: 200, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 1],
      ['b', 0]
    ])
  },
  {
    type: 'classification',
    groundTruth: [
      { label: "yes", size: 10, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
    ],
    size: 10,
    predictions: [
      { label: "yes", size: 10, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['a', 1],
      ['b', 1]
    ])
  }
];

// when the entire dataset is in one bin with a feature selected
const dataE: Node[] = [
  {
    type: 'classification',
    groundTruth: [
      { label: "no", size: 100, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 300, correct: true, offset: 8, pctPtDiffFromWhole: 0 },
    ],
    size: 400,
    predictions: [
      { label: "no", size: 50, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 100, correct: true, offset: 50, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 50, correct: false, offset: 150, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 200, correct: true, offset: 200, pctPtDiffFromWhole: 0 },
    ],
    splits: new Map([
      ['e', 0],
    ])
  }
];


function getExampleClassificationDataset(size: number = 100): ClassificationDataset {
  return {
    type: 'classification',
    rows: [],
    name: '',
    featureNames: [],
    labelValues: [],
    hasPredictions: false,
    size: size,
    groundTruthDistribution: new d3.InternMap()
  };
}


// set up

const fakeGetData = sinon.fake((features: Features, sel: string[], dataset: Dataset) => {
  const [first, second] = sel;

  // ignore hints about not using values
  features;
  dataset;

  if (first === 'a' && second === 'b') {
    return dataAB;
  } else if(first === 'a' && second === 'c') {
    return dataAC;
  } else if (first === 'a' && second === 'd') {
    return dataAD;
  } else if (first === 'e' && second === undefined) {
    return dataE;
  } else {
    throw new Error('getData passed wrong selected features');
  }
});

// tests

// entropy

test('entropy', () => {
  // dataAC entropy

  const firstSquareEntropy = -((100 / 400) * Math.log2(100 / 400)) - ((300 / 400) * Math.log2(300 / 400));
  const secondSquareEntropy = -((70 / 100) * Math.log2(70 / 100)) - ((30 / 100) * Math.log2(30 / 100));
  const thirdSquareEntropy = -((20 / 200) * Math.log2(20 / 200)) - ((180 / 200) * Math.log2(180 / 200));
  const fourthSquareEntropy = -((8 / 10) * Math.log2(8 / 10)) - ((2 / 10) * Math.log2(2 / 10));

  const weightedAverage = (400 / 710) * firstSquareEntropy + (100 / 710) * secondSquareEntropy + (200 / 710) * thirdSquareEntropy + (10 / 710) * fourthSquareEntropy;

  const expected = [
    { feature: 'b', value: -1 },
    { feature: 'c', value: -weightedAverage },
    { feature: 'd', value: -0 }
  ];

  const args: ClassificationRatingInput = {
    selected: ['a'],
    features: {},
    dataset: getExampleClassificationDataset(710),
    available: ['b', 'c', 'd']
  };

  const actual = metrics.entropy(args, fakeGetData);

  assert.is(actual[0].value, expected[0].value);
  assert.is(actual[0].feature, expected[0].feature);

  assert.is(actual[1].value, expected[1].value);
  assert.is(actual[1].feature, expected[1].feature);

  assert.is(actual[2].value, expected[2].value);
  assert.is(actual[2].feature, expected[2].feature);
});

test('entropy one bin', () => {
  const expectedValue = -((100 / 400) * Math.log2(100 / 400)) - ((300 / 400) * Math.log2(300 / 400));

  const args: ClassificationRatingInput = {
    selected: [],
    features: {},
    dataset: getExampleClassificationDataset(400),
    available: ['e']
  };

  const actual = metrics.entropy(args, fakeGetData);

  assert.equal(actual[0].value, -expectedValue);
  assert.equal(actual[0].feature, 'e');
});

// error deviation

test('error deviation', () => {
  const expected = [
    { feature: 'b', value: d3.deviation([0.25, .5, 85 / 200, 1]) },
    { feature: 'c', value: d3.deviation([75 / 400, .4, 30 / 200, .2]) },
    { feature: 'd', value: 0 }
  ];

  const args: ClassificationRatingInput = {
    selected: ['a'],
    features: {},
    dataset: getExampleClassificationDataset(),
    available: ['b', 'c', 'd']
  };

  const actual = metrics.errorDeviation(args, fakeGetData);

  assert.is(actual[0].value, expected[0].value);
  assert.is(actual[0].feature, expected[0].feature);

  assert.is(actual[1].value, expected[1].value);
  assert.is(actual[1].feature, expected[1].feature);

  assert.is(actual[2].value, expected[2].value);
  assert.is(actual[2].feature, expected[2].feature);
});

test('error deviation one bin', () => {
  const expected = [ {feature: 'e', value: 0} ];

  const args: ClassificationRatingInput = {
    selected: [],
    features: {},
    dataset: getExampleClassificationDataset(400),
    available: ['e']
  };

  const actual = metrics.errorDeviation(args, fakeGetData);

  assert.equal(actual, expected);
});

// error count

test('error count', () => {
  const expected = [
    { feature: 'b', value: 100 },
    { feature: 'c', value: 75 },
    { feature: 'd', value: 0 }
  ];

  const args = {
    selected: ['a'],
    features: {},
    dataset: getExampleClassificationDataset(),
    available: ['b', 'c', 'd']
  };

  assert.equal(metrics.errorCount(args, fakeGetData), expected);
});

test('error count one bin', () => {
  const expected = [ {feature: 'e', value: 100} ];

  const args = {
    selected: [],
    features: {},
    dataset: getExampleClassificationDataset(400),
    available: ['e']
  };

  const actual = metrics.errorCount(args, fakeGetData);

  assert.equal(actual, expected);
});

// error percent

test('error percent', () => {
  const expected = [
    { feature: 'b', value: 1 },
    { feature: 'c', value: .4 },
    { feature: 'd', value: 0 }
  ];

  const args = {
    selected: ['a'],
    features: {},
    dataset: getExampleClassificationDataset(),
    available: ['b', 'c', 'd']
  };

  assert.equal(metrics.errorPercent(args, fakeGetData), expected);
});

test('error percent one bin', () => {
  const expected: Rating[] = [ {feature: 'e', value: 0.25} ];

  const args: ClassificationRatingInput = {
    selected: [],
    features: {},
    dataset: getExampleClassificationDataset(400),
    available: ['e']
  };

  const actual = metrics.errorPercent(args, fakeGetData);

  assert.equal(actual, expected);
});

// get error count for square

test('get error count for no predictionResults', () => {
  const square: ClassificationNode = { type: 'classification', size: 1, splits: new Map(), groundTruth: [] };

  assert.is(getErrorCountForSquare(square), 0);
});

test('get error count for no classes', () => {
  const square: ClassificationNode = {
    type: 'classification',
    size: 1,
    splits: new Map(),
    groundTruth: [],
    predictions: []
  };

  assert.is(getErrorCountForSquare(square), 0);
});

test('get error count for one class', () => {
  const square: ClassificationNode = {
    type: 'classification',
    size: 1,
    splits: new Map(),
    groundTruth: [],
    predictions: [
      { label: "no", size: 7, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 10, correct: true, offset: 7, pctPtDiffFromWhole: 0 },
    ],
  };

  assert.is(getErrorCountForSquare(square), 7);
});

test('get error count for two classes', () => {
  const square: ClassificationNode = {
    type: 'classification',
    size: 1,
    splits: new Map(),
    groundTruth: [],
    predictions: [
      { label: "no", size: 7, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 10, correct: true, offset: 7, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 9, correct: false, offset: 17, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 20, correct: true, offset: 26, pctPtDiffFromWhole: 0 },
    ],
  };

  assert.is(getErrorCountForSquare(square), 16);
});

test('get error count for three classes', () => {
  const square: ClassificationNode = {
    type: 'classification',
    size: 1,
    splits: new Map(),
    groundTruth: [],
    predictions: [
      { label: "no", size: 7, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "no", size: 10, correct: true, offset: 7, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 9, correct: false, offset: 17, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 20, correct: true, offset: 26, pctPtDiffFromWhole: 0 },
      { label: "I don't know", size: 0, correct: false, offset: 46, pctPtDiffFromWhole: 0 },
      { label: "I don't know", size: 20, correct: true, offset: 46, pctPtDiffFromWhole: 0 },
      { label: "maybe", size: 10, correct: false, offset: 66, pctPtDiffFromWhole: 0 },
      { label: "maybe", size: 20, correct: true, offset: 76, pctPtDiffFromWhole: 0 },
    ],
  };

  assert.is(getErrorCountForSquare(square), 26);
});

test.run();