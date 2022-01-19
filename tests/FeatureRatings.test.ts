import { test } from 'uvu';
import * as assert from 'uvu/assert';
import sinon from "sinon";
import { getFeatureRatings, normalize } from '../src/FeatureRatings';
import * as metrics from '../src/RatingMetrics';
import type { Rating } from '../src/RatingMetrics'
import type { Metadata, Dataset } from '../src/types'

function getExampleMetadata(featureNames: string[] = []): Metadata {
  return {
    size: 0,
    features: {},
    featureNames: featureNames,
    labelValues: [],
    hasPredictions: true
  };
}

function getExampleDataset(): Dataset {
  return Object.assign([], {
    columns: [],
    name: ''
  });
}

const metricFakes = {
  entropy: sinon.fake(metrics.entropy),
  errorCount: sinon.fake(metrics.errorCount),
  errorPercent: sinon.fake(metrics.errorPercent),
  errorDeviation: sinon.fake(metrics.errorDeviation),
};

// get feature ratings
// test that the correct meric is called with the correct available features

test('get feature ratings - none', () => {
  assert.equal(getFeatureRatings({
    criterion: 'none',
    selected: [],
    metadata: getExampleMetadata(),
    dataset: getExampleDataset()
  }, metricFakes), new Map());
});

test('get feature ratings - entropy', () => {
  getFeatureRatings({
      criterion: 'entropy',
      selected: ['height'],
      metadata: getExampleMetadata(['age', 'height', 'weight']),
      dataset: getExampleDataset(),
  }, metricFakes);

  assert.is(metricFakes.entropy.callCount, 1);
  assert.equal(metricFakes.entropy.firstCall.firstArg.available, ['age', 'weight']);
});

test('get feature ratings - errorCount', () => {
  getFeatureRatings({
    criterion: 'errorCount',
    selected: [],
    metadata: getExampleMetadata(['age', 'height', 'weight']),
    dataset: getExampleDataset(),
  }, metricFakes);

  assert.is(metricFakes.errorCount.callCount, 1);
  assert.equal(metricFakes.errorCount.firstCall.firstArg.available, ['age', 'height', 'weight']);
});

test('get feature ratings - errorPercent', () => {
  getFeatureRatings({
    criterion: 'errorPercent',
    selected: ['age', 'weight'],
    metadata: getExampleMetadata(['age', 'height', 'weight']),
    dataset: getExampleDataset(),
  }, metricFakes);

  assert.is(metricFakes.errorPercent.callCount, 1);
  assert.equal(metricFakes.errorPercent.firstCall.firstArg.available, ['height']);
});

test('get feature ratings - errorDeviation', () => {
  getFeatureRatings({
    criterion: 'errorDeviation',
    selected: [],
    metadata: getExampleMetadata(),
    dataset: getExampleDataset(),
  }, metricFakes);

  assert.is(metricFakes.errorDeviation.callCount, 1);
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

test.run();