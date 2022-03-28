import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as d3 from "d3";
import { metrics, getErrorCountForSquare, getValidMetrics } from '../src/RatingMetrics';
import type { ClassificationNode, RegressionNode } from '../src/types'

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

// tests

// classification

const regressionData: RegressionNode[] = [
  {
    type: 'regression',
    size: 5,
    splits: new Map(),
    groundTruthQuantiles: [],
    groundTruth: [],
    predictionsQuantiles: [],
    predictions: [],
    groundTruthLabels: [5, 6, 5, 6, 5],
    predictedLabels: [7, 4, 3, 8, 7],
  },
  {
    type: 'regression',
    size: 7,
    splits: new Map(),
    groundTruthQuantiles: [],
    groundTruth: [],
    predictionsQuantiles: [],
    predictions: [],
    groundTruthLabels: [1, 2, 3, 4, 5, 6, 7],
    predictedLabels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    type: 'regression',
    size: 9,
    splits: new Map(),
    groundTruthQuantiles: [],
    groundTruth: [],
    predictionsQuantiles: [],
    predictions: [],
    groundTruthLabels: [2, 4, 8, 16, 32, 64, 128, 256, 512],
    predictedLabels: [1, 2, 4, 8, 16, 32, 64, 128, 256],
  }
];

// entropy

test('entropy', () => {
  // dataAC entropy

  const firstSquareEntropy = -((100 / 400) * Math.log2(100 / 400)) - ((300 / 400) * Math.log2(300 / 400));
  const secondSquareEntropy = -((70 / 100) * Math.log2(70 / 100)) - ((30 / 100) * Math.log2(30 / 100));
  const thirdSquareEntropy = -((20 / 200) * Math.log2(20 / 200)) - ((180 / 200) * Math.log2(180 / 200));
  const fourthSquareEntropy = -((8 / 10) * Math.log2(8 / 10)) - ((2 / 10) * Math.log2(2 / 10));

  const expected = -((400 / 710) * firstSquareEntropy + (100 / 710) * secondSquareEntropy + (200 / 710) * thirdSquareEntropy + (10 / 710) * fourthSquareEntropy);
  const actual = metrics.entropy.metric(dataAC);
  assert.equal(actual, expected);
});

test('entropy one bin', () => {
  const expected = -(-((100 / 400) * Math.log2(100 / 400)) - ((300 / 400) * Math.log2(300 / 400)));
  const actual = metrics.entropy.metric(dataE);
  assert.equal(actual, expected);
});

// error deviation

test('error deviation', () => {
  const expected = d3.deviation([0.25, .5, 85 / 200, 1]);
  const actual = metrics.errorDeviation.metric(dataAB);
  assert.equal(actual, expected);
});

test('error deviation one bin', () => {
  const expected = 0;
  const actual = metrics.errorDeviation.metric(dataE);
  assert.equal(actual, expected);
});

// error count

test('error count', () => {
  const expected =  75;
  const actual = metrics.errorCount.metric(dataAC);
  assert.equal(actual, expected);
});

test('error count one bin', () => {
  const expected =  100;
  const actual = metrics.errorCount.metric(dataE);
  assert.equal(actual, expected);
});

// error percent

test('error percent', () => {
  const expected =  0.4;
  const actual = metrics.errorPercent.metric(dataAC);
  assert.equal(actual, expected);
});

test('error percent one bin', () => {
  const expected =  0.25;
  const actual = metrics.errorPercent.metric(dataE);
  assert.equal(actual, expected);
});

// regression

// similarity

test('similarity', () => {
  const expected = ((5/21) * d3.deviation([5, 6, 5, 6, 5])) +
                   ((7/21) * d3.deviation([1, 2, 3, 4, 5, 6, 7])) +
                   ((9/21) * d3.deviation([2, 4, 8, 16, 32, 64, 128, 256, 512]));
  assert.ok(metrics.similarity.metric(regressionData) - expected < 0.00001);
});

// MSE deviation

test('MSE deviation', () => {
  const expected = d3.deviation([
    4,
    0,
    d3.mean([1**2, 2**2, 4**2, 8**2, 16**2, 32**2, 64**2, 128**2, 256**2])
  ]);
  assert.ok(metrics.mseDeviation.metric(regressionData) - expected < 0.00001);
});

test('MSE deviation - one subset', () => {
  assert.equal(metrics.mseDeviation.metric(regressionData.slice(0, 1)), 0);
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

// get valid metrics

test('get valid metrics - classification - predictions', () => {
  const actual = getValidMetrics('classification', true, false);

  const expectedCriteria = [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'entropy', display: 'Purity', type: 'classification', requiresPredictions: false },
      ]
    },
    {
      title: 'Prediction Metrics',
      requiresPredictions: true,
      options: [
        { value: 'errorDeviation', display: 'Error deviation', type: 'classification', requiresPredictions: true },
        { value: 'errorCount', display: 'Error count', type: 'classification', requiresPredictions: true },
        { value: 'errorPercent', display: 'Error percent', type: 'classification', requiresPredictions: true },
      ]
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'classification', requiresPredictions: false },
      ]
    }
  ];

  assert.equal(actual.criteria, expectedCriteria);
  assert.equal(
    actual.defaultCriterion,
    { value: 'entropy', display: 'Purity', type: 'classification', requiresPredictions: false }
  );
});

test('get valid metrics - classification - no predictions', () => {
  const actual = getValidMetrics('classification', false, false);

  const expectedCriteria = [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'entropy', display: 'Purity', type: 'classification', requiresPredictions: false },
      ]
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'classification', requiresPredictions: false },
      ]
    }
  ];

  assert.equal(actual.criteria, expectedCriteria);
  assert.equal(
    actual.defaultCriterion,
    { value: 'entropy', display: 'Purity', type: 'classification', requiresPredictions: false }
  );
});

test('get valid metrics - classification - predictions - choose none', () => {
  const actual = getValidMetrics('classification', true, true);

  const expectedCriteria = [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'entropy', display: 'Purity', type: 'classification', requiresPredictions: false },
      ]
    },
    {
      title: 'Prediction Metrics',
      requiresPredictions: true,
      options: [
        { value: 'errorDeviation', display: 'Error deviation', type: 'classification', requiresPredictions: true },
        { value: 'errorCount', display: 'Error count', type: 'classification', requiresPredictions: true },
        { value: 'errorPercent', display: 'Error percent', type: 'classification', requiresPredictions: true },
      ]
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'classification', requiresPredictions: false },
      ]
    }
  ];

  assert.equal(actual.criteria, expectedCriteria);
  assert.equal(
    actual.defaultCriterion,
    { value: 'none', display: 'Disable', type: 'classification', requiresPredictions: false }
  );
});

test('get valid metrics - classification - no predictions - choose none', () => {
  const actual = getValidMetrics('classification', false, true);

  const expectedCriteria = [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'entropy', display: 'Purity', type: 'classification', requiresPredictions: false },
      ]
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'classification', requiresPredictions: false },
      ]
    }
  ];

  assert.equal(actual.criteria, expectedCriteria);
  assert.equal(
    actual.defaultCriterion,
    { value: 'none', display: 'Disable', type: 'classification', requiresPredictions: false }
  );
});

test('get valid metrics - regression - predictions', () => {
  const actual = getValidMetrics('regression', true, false);

  const expectedCriteria = [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'similarity', display: 'Similarity', type: 'regression', requiresPredictions: false },
      ]
    },
    {
      title: 'Prediction Metrics',
      requiresPredictions: true,
      options: [
        { value: 'mseDeviation', display: 'MSE Deviation', type: 'regression', requiresPredictions: true },
      ]
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'regression', requiresPredictions: false },
      ]
    }
  ];

  assert.equal(actual.criteria, expectedCriteria);
  assert.equal(
    actual.defaultCriterion,
    { value: 'similarity', display: 'Similarity', type: 'regression', requiresPredictions: false },
  );
});

test('get valid metrics - regression - no predictions', () => {
  const actual = getValidMetrics('regression', false, false);

  const expectedCriteria = [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'similarity', display: 'Similarity', type: 'regression', requiresPredictions: false },
      ]
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'regression', requiresPredictions: false },
      ]
    }
  ];

  assert.equal(actual.criteria, expectedCriteria);
  assert.equal(
    actual.defaultCriterion,
    { value: 'similarity', display: 'Similarity', type: 'regression', requiresPredictions: false },
  );
});

test('get valid metrics - regression - predictions - choose none', () => {
  const actual = getValidMetrics('regression', true, true);

  const expectedCriteria = [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'similarity', display: 'Similarity', type: 'regression', requiresPredictions: false },
      ]
    },
    {
      title: 'Prediction Metrics',
      requiresPredictions: true,
      options: [
        { value: 'mseDeviation', display: 'MSE Deviation', type: 'regression', requiresPredictions: true },
      ]
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'regression', requiresPredictions: false },
      ]
    }
  ];

  assert.equal(actual.criteria, expectedCriteria);
  assert.equal(
    actual.defaultCriterion,
    { value: 'none', display: 'Disable', type: 'regression', requiresPredictions: false }
  );
});

test('get valid metrics - regression - no predictions - choose none', () => {
  const actual = getValidMetrics('regression', false, true);

  const expectedCriteria = [
    {
      title: 'Ground Truth Metrics',
      requiresPredictions: false,
      options: [
        { value: 'similarity', display: 'Similarity', type: 'regression', requiresPredictions: false },
      ]
    },
    {
      title: 'Disable Metrics',
      requiresPredictions: false,
      options: [
        { value: 'none', display: 'Disable', type: 'regression', requiresPredictions: false },
      ]
    }
  ];

  assert.equal(actual.criteria, expectedCriteria);
  assert.equal(
    actual.defaultCriterion,
    { value: 'none', display: 'Disable', type: 'regression', requiresPredictions: false }
  );
});

test.run();