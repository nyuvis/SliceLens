import { test } from 'uvu';
import * as assert from 'uvu/assert';
import sinon from "sinon";
import { getFeatureRatings, getFeatureRatingsForMetric, normalize } from '../src/FeatureRatings';
import { metrics } from '../src/RatingMetrics';
import type { Rating } from '../src/RatingMetrics'
import type { ClassificationDataset, ClassificationNode, Dataset, Features } from '../src/types'
import * as d3 from "d3";

function getExampleClassificationDataset(featureNames: string[] = [], size: number = 100): ClassificationDataset {
  return {
    type: 'classification',
    rows: [],
    name: '',
    featureNames: featureNames,
    labelValues: [],
    hasPredictions: false,
    size: size,
    groundTruthDistribution: new d3.InternMap()
  };
}

const metricFakes = {
  entropy: { type: 'classification' as const, metric: sinon.fake(metrics.entropy.metric) },
  errorCount: { type: 'classification' as const, metric: sinon.fake(metrics.errorCount.metric) },
  errorPercent: { type: 'classification' as const, metric: sinon.fake(metrics.errorPercent.metric) },
  errorDeviation: { type: 'classification' as const, metric: sinon.fake(metrics.errorDeviation.metric) },
  random: { type: 'regression' as const, metric: sinon.fake(metrics.random.metric) },
};

// get feature ratings: test that the correct meric is called

test('get feature ratings - none', () => {
  assert.equal(
    getFeatureRatings('none', metricFakes, [], {}, getExampleClassificationDataset()),
    new Map()
  );
});

test('get feature ratings - entropy', () => {
  getFeatureRatings(
    'entropy',
    metricFakes,
    ['height'],
    {},
    getExampleClassificationDataset(['age', 'height', 'weight']),
  );

  assert.is(metricFakes.entropy.metric.callCount, 2);
});

test('get feature ratings - errorCount', () => {
  getFeatureRatings(
    'errorCount',
    metricFakes,
    [],
    {},
    getExampleClassificationDataset(['age', 'height', 'weight']),
  );

  assert.is(metricFakes.errorCount.metric.callCount, 3);
});

test('get feature ratings - errorPercent', () => {
  getFeatureRatings(
    'errorPercent',
    metricFakes,
    ['age', 'weight'],
    {},
    getExampleClassificationDataset(['age', 'height', 'weight']),
  );

  assert.is(metricFakes.errorPercent.metric.callCount, 1);
});

test('get feature ratings - errorDeviation', () => {
  getFeatureRatings(
    'errorDeviation',
    metricFakes,
    [],
    {},
    getExampleClassificationDataset(['age', 'height', 'weight']),
  );

  assert.is(metricFakes.errorDeviation.metric.callCount, 3);
});

// normalize

test('normalize no ratings', () => {
  const ratings: Rating[] = [];
  assert.equal(normalize(ratings), new Map());
});

test('normalize ratings positive', () => {
  const ratings: Rating[] = [
    { feature: 'a', value: 0},
    { feature: 'b', value: 10},
    { feature: 'c', value: 20},
    { feature: 'd', value: 30},
    { feature: 'e', value: 40},
    { feature: 'f', value: 50},
    { feature: 'g', value: 60},
    { feature: 'h', value: 70},
    { feature: 'i', value: 80},
    { feature: 'j', value: 90},
    { feature: 'k', value: 100},
  ];

  const expected = new Map([
    ['a', 0],
    ['b', 0.1],
    ['c', 0.2],
    ['d', 0.3],
    ['e', 0.4],
    ['f', 0.5],
    ['g', 0.6],
    ['h', 0.7],
    ['i', 0.8],
    ['j', 0.9],
    ['k', 1.0],
  ]);

  assert.equal(normalize(ratings), expected);
});

test('normalize ratings negative', () => {
  const ratings: Rating[] = [
    { feature: 'a', value: -50},
    { feature: 'b', value: -55},
    { feature: 'c', value: -60},
    { feature: 'd', value: -65},
    { feature: 'e', value: -70},
    { feature: 'f', value: -75},
    { feature: 'g', value: -80},
    { feature: 'h', value: -85},
    { feature: 'i', value: -90},
    { feature: 'j', value: -95},
    { feature: 'k', value: -100},
  ];

  const expected = new Map([
    ['a', 1.0],
    ['b', 0.9],
    ['c', 0.8],
    ['d', 0.7],
    ['e', 0.6],
    ['f', 0.5],
    ['g', 0.4],
    ['h', 0.3],
    ['i', 0.2],
    ['j', 0.1],
    ['k', 0.0],
  ]);

  assert.equal(normalize(ratings), expected);
});

test('normalize ratings negative positive and zero', () => {
  const ratings: Rating[] = [
    { feature: 'a', value: -100},
    { feature: 'b', value: -50},
    { feature: 'c', value: 0},
    { feature: 'd', value: 20},
    { feature: 'e', value: 40},
    { feature: 'f', value: 60},
    { feature: 'g', value: 80},
    { feature: 'h', value: 100},
  ];

  const expected = new Map([
    ['a', 0],
    ['b', 0.25],
    ['c', 0.5],
    ['d', 0.6],
    ['e', 0.7],
    ['f', 0.8],
    ['g', 0.9],
    ['h', 1.0],
  ]);

  assert.equal(normalize(ratings), expected);
});

test('normalize one rating', () => {
  const ratings: Rating[] = [
    { feature: 'a', value: 5},
  ];

  const expected = new Map([
    ['a', 1],
  ]);

  assert.equal(normalize(ratings), expected);
});

test('normalize all identical ratings', () => {
  const ratings: Rating[] = [
    { feature: 'a', value: 5},
    { feature: 'b', value: 5},
    { feature: 'c', value: 5},
    { feature: 'd', value: 5},
    { feature: 'e', value: 5},
  ];

  const expected = new Map([
    ['a', 1],
    ['b', 1],
    ['c', 1],
    ['d', 1],
    ['e', 1],
  ]);

  assert.equal(normalize(ratings), expected);
});

test('normalize all zero ratings', () => {
  const ratings: Rating[] = [
    { feature: 'a', value: 0},
    { feature: 'b', value: 0},
    { feature: 'c', value: 0},
    { feature: 'd', value: 0},
    { feature: 'e', value: 0},
  ];

  const expected = new Map([
    ['a', 1],
    ['b', 1],
    ['c', 1],
    ['d', 1],
    ['e', 1],
  ]);

  assert.equal(normalize(ratings), expected);
});

test('normalize one rating', () => {
  const ratings: Rating[] = [
    { feature: 'a', value: 1.2345},
  ];

  const expected = new Map([
    ['a', 1],
  ]);

  assert.equal(normalize(ratings), expected);
});

// get feature ratings for metric

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

const dataAC: ClassificationNode[] = [
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

const dataAD: ClassificationNode[] = [
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
const dataE: ClassificationNode[] = [
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

  const actual = getFeatureRatingsForMetric(getExampleClassificationDataset(['a', 'b', 'c', 'd']), metrics.entropy.metric, ['a'], {}, fakeGetData)

  assert.is(actual[0].value, expected[0].value);
  assert.is(actual[0].feature, expected[0].feature);

  assert.is(actual[1].value, expected[1].value);
  assert.is(actual[1].feature, expected[1].feature);

  assert.is(actual[2].value, expected[2].value);
  assert.is(actual[2].feature, expected[2].feature);
});

test('entropy one bin', () => {
  const expectedValue = -((100 / 400) * Math.log2(100 / 400)) - ((300 / 400) * Math.log2(300 / 400));

  const actual = getFeatureRatingsForMetric(getExampleClassificationDataset(['e']), metrics.entropy.metric, [], {}, fakeGetData);

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

  const actual = getFeatureRatingsForMetric(getExampleClassificationDataset(['a', 'b', 'c', 'd']), metrics.errorDeviation.metric, ['a'], {}, fakeGetData);

  assert.is(actual[0].value, expected[0].value);
  assert.is(actual[0].feature, expected[0].feature);

  assert.is(actual[1].value, expected[1].value);
  assert.is(actual[1].feature, expected[1].feature);

  assert.is(actual[2].value, expected[2].value);
  assert.is(actual[2].feature, expected[2].feature);
});

test('error deviation one bin', () => {
  const expected = [ {feature: 'e', value: 0} ];

  const actual = getFeatureRatingsForMetric(getExampleClassificationDataset(['e']), metrics.errorDeviation.metric, [], {}, fakeGetData);

  assert.equal(actual, expected);
});

// error count

test('error count', () => {
  const expected = [
    { feature: 'b', value: 100 },
    { feature: 'c', value: 75 },
    { feature: 'd', value: 0 }
  ];

  const actual = getFeatureRatingsForMetric(getExampleClassificationDataset(['a', 'b', 'c', 'd']), metrics.errorCount.metric, ['a'], {}, fakeGetData);

  assert.equal(actual, expected);
});

test('error count one bin', () => {
  const expected = [ {feature: 'e', value: 100} ];

  const actual = getFeatureRatingsForMetric(getExampleClassificationDataset(['e']), metrics.errorCount.metric, [], {}, fakeGetData);

  assert.equal(actual, expected);
});

// error percent

test('error percent', () => {
  const expected = [
    { feature: 'b', value: 1 },
    { feature: 'c', value: .4 },
    { feature: 'd', value: 0 }
  ];

  const actual = getFeatureRatingsForMetric(getExampleClassificationDataset(['a', 'b', 'c', 'd']), metrics.errorPercent.metric, ['a'], {}, fakeGetData);

  assert.equal(actual, expected);
});

test('error percent one bin', () => {
  const expected: Rating[] = [ {feature: 'e', value: 0.25} ];

  const actual = getFeatureRatingsForMetric(getExampleClassificationDataset(['e']), metrics.errorPercent.metric, [], {}, fakeGetData);

  assert.equal(actual, expected);
});

test.run();
