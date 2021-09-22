import { test } from 'uvu';
import * as assert from 'uvu/assert';
import sinon from "sinon/pkg/sinon-esm.js";
import * as d3 from "d3";
import { entropy, errorCount, errorPercent, errorDeviation, getErrorCountForSquare } from '../src/RatingMetrics.js';
import * as dt from '../src/DataTransformer.js'

// data

const dataAB = [
  {
    groundTruth: new d3.InternMap([["no", 200], ["yes", 200]]),
    size: 400,
    predictionCounts: new d3.InternMap([["no", 150], ["yes", 250]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 50], ["correct", 100]])],
      ["yes", new d3.InternMap([["incorrect", 50], ["correct", 200]])],
    ]),
    splits: new Map([
      ['a', 0],
      ['b', 0]
    ])
  },
  {
    groundTruth: new d3.InternMap([["no", 50], ["yes", 50]]),
    size: 100,
    predictionCounts: new d3.InternMap([["no", 100]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 50], ["correct", 50]])],
    ]),
    splits: new Map([
      ['a', 0],
      ['b', 1]
    ])
  },
  {
    groundTruth: new d3.InternMap([["no", 100], ["yes", 100]]),
    size: 200,
    predictionCounts: new d3.InternMap([["no", 100], ["yes", 100]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 75], ["correct", 25]])],
      ["yes", new d3.InternMap([["incorrect", 10], ["correct", 90]])],
    ]),
    splits: new Map([
      ['a', 1],
      ['b', 0]
    ])
  },
  {
    groundTruth: new d3.InternMap([["no", 5], ["yes", 5]]),
    size: 10,
    predictionCounts: new d3.InternMap([["no", 5], ["yes", 5]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 5]])],
      ["yes", new d3.InternMap([["incorrect", 5]])],
    ]),
    splits: new Map([
      ['a', 1],
      ['b', 1]
    ])
  }
];

const dataAC = [
  {
    groundTruth: new d3.InternMap([["no", 100], ["yes", 300]]),
    size: 400,
    predictionCounts: new d3.InternMap([["no", 110], ["yes", 290]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 30], ["correct", 80]])],
      ["yes", new d3.InternMap([["incorrect", 45], ["correct", 245]])],
    ]),
    splits: new Map([
      ['a', 0],
      ['c', 0]
    ])
  },
  {
    groundTruth: new d3.InternMap([["no", 70], ["yes", 30]]),
    size: 100,
    predictionCounts: new d3.InternMap([["no", 50], ["yes", 50]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 30], ["correct", 20]])],
      ["yes", new d3.InternMap([["incorrect", 10], ["correct", 40]])],
    ]),
    splits: new Map([
      ['a', 0],
      ['c', 1]
    ])
  },
  {
    groundTruth: new d3.InternMap([["no", 20], ["yes", 180]]),
    size: 200,
    predictionCounts: new d3.InternMap([["no", 25], ["yes", 175]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 5], ["correct", 20]])],
      ["yes", new d3.InternMap([["incorrect", 25], ["correct", 150]])],
    ]),
    splits: new Map([
      ['a', 1],
      ['c', 0]
    ])
  },
  {
    groundTruth: new d3.InternMap([["no", 8], ["yes", 2]]),
    size: 10,
    predictionCounts: new d3.InternMap([["no", 8], ["yes", 2]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 1], ["correct", 7]])],
      ["yes", new d3.InternMap([["incorrect", 1], ["correct", 1]])],
    ]),
    splits: new Map([
      ['a', 1],
      ['c', 1]
    ])
  }
];

const dataAD = [
  {
    groundTruth: new d3.InternMap([["yes", 400]]),
    size: 400,
    predictionCounts: new d3.InternMap([["yes", 400]]),
    predictionResults: new d3.InternMap([
      ["yes", new d3.InternMap([["correct", 400]])],
    ]),
    splits: new Map([
      ['a', 0],
      ['b', 0]
    ])
  },
  {
    groundTruth: new d3.InternMap([["no", 100]]),
    size: 100,
    predictionCounts: new d3.InternMap([["no", 100]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["correct", 100]])],
    ]),
    splits: new Map([
      ['a', 0],
      ['b', 1]
    ])
  },
  {
    groundTruth: new d3.InternMap([["no", 200]]),
    size: 200,
    predictionCounts: new d3.InternMap([["no", 200]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["correct", 200]])],
    ]),
    splits: new Map([
      ['a', 1],
      ['b', 0]
    ])
  },
  {
    groundTruth: new d3.InternMap([["yes", 10]]),
    size: 10,
    predictionCounts: new d3.InternMap([["yes", 10]]),
    predictionResults: new d3.InternMap([
      ["yes", new d3.InternMap([["correct", 10]])],
    ]),
    splits: new Map([
      ['a', 1],
      ['b', 1]
    ])
  }
];

// when the entire dataset is in one bin with a feature selected
const dataE = [
  {
    groundTruth: new d3.InternMap([["no", 100], ["yes", 300]]),
    size: 400,
    predictionCounts: new d3.InternMap([["no", 150], ["yes", 250]]),
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["incorrect", 50], ["correct", 100]])],
      ["yes", new d3.InternMap([["incorrect", 50], ["correct", 200]])],
    ]),
    splits: new Map([
      ['e', 0],
    ])
  }
];

test.before.each(() => {
  sinon.stub(dt, 'getData').callsFake((metadata, sel, dataset) => {
    const [first, second] = sel;

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
});

test.after.each(() => sinon.restore());

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

  const args = {
    selected: ['a'],
    metadata: { size: 710 },
    dataset: [],
    available: ['b', 'c', 'd']
  };

  const actual = entropy(args);

  assert.is(actual[0].value, expected[0].value);
  assert.is(actual[0].feature, expected[0].feature);

  assert.is(actual[1].value, expected[1].value);
  assert.is(actual[1].feature, expected[1].feature);

  assert.is(actual[2].value, expected[2].value);
  assert.is(actual[2].feature, expected[2].feature);
});

test('entropy one bin', () => {
  const expectedValue = -((100 / 400) * Math.log2(100 / 400)) - ((300 / 400) * Math.log2(300 / 400));

  const args = {
    selected: [],
    metadata: { size: 400 },
    dataset: [],
    available: ['e']
  };

  const actual = entropy(args);

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

  const args = {
    selected: ['a'],
    metadata: {},
    dataset: [],
    available: ['b', 'c', 'd']
  };

  const actual = errorDeviation(args);

  assert.is(actual[0].value, expected[0].value);
  assert.is(actual[0].feature, expected[0].feature);

  assert.is(actual[1].value, expected[1].value);
  assert.is(actual[1].feature, expected[1].feature);

  assert.is(actual[2].value, expected[2].value);
  assert.is(actual[2].feature, expected[2].feature);
});

test('error deviation one bin', () => {
  const expected = [ {feature: 'e', value: 0} ];

  const args = {
    selected: [],
    metadata: { size: 400 },
    dataset: [],
    available: ['e']
  };

  const actual = errorDeviation(args);

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
    metadata: {},
    dataset: [],
    available: ['b', 'c', 'd']
  };

  assert.equal(errorCount(args), expected);
});

test('error count one bin', () => {
  const expected = [ {feature: 'e', value: 100} ];

  const args = {
    selected: [],
    metadata: { size: 400 },
    dataset: [],
    available: ['e']
  };

  const actual = errorCount(args);

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
    metadata: {},
    dataset: [],
    available: ['b', 'c', 'd']
  };

  assert.equal(errorPercent(args), expected);
});

test('error percent one bin', () => {
  const expected = [ {feature: 'e', value: 0.25} ];

  const args = {
    selected: [],
    metadata: { size: 400 },
    dataset: [],
    available: ['e']
  };

  const actual = errorPercent(args);

  assert.equal(actual, expected);
});

// get error count for square

test('get error count for no predictionResults', () => {
  const square = {};

  assert.is(getErrorCountForSquare(square), 0);
});

test('get error count for no classes', () => {
  const square = {
    predictionResults: new d3.InternMap()
  };

  assert.is(getErrorCountForSquare(square), 0);
});

test('get error count for one class', () => {
  const square = {
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["correct", 10], ["incorrect", 7]])],
    ])
  };

  assert.is(getErrorCountForSquare(square), 7);
});

test('get error count for two classes', () => {
  const square = {
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["correct", 10], ["incorrect", 7]])],
      ["yes", new d3.InternMap([["correct", 20], ["incorrect", 9]])],
    ])
  };

  assert.is(getErrorCountForSquare(square), 16);
});

test('get error count for three classes', () => {
  const square = {
    predictionResults: new d3.InternMap([
      ["no", new d3.InternMap([["correct", 10], ["incorrect", 7]])],
      ["yes", new d3.InternMap([["correct", 20], ["incorrect", 9]])],
      ["I don't know", new d3.InternMap([["correct", 20], ["incorrect", 0]])],
      ["maybe", new d3.InternMap([["correct", 20], ["incorrect", 10]])],
    ])
  };

  assert.is(getErrorCountForSquare(square), 26);
});

test.run();