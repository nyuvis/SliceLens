import {
  getFeatureRatings,
  normalize,
} from '../src/FeatureSuggesterWorker.js';

import * as metrics from '../src/RatingMetrics.js';

// get feature ratings
// test that the correct meric is called with the correct available features

test('get feature ratings - none', () => {
  expect(getFeatureRatings({ criterion: 'none' })).toStrictEqual(new Map());
});

test('get feature ratings - entropy', () => {
  const entropy = spyOn(metrics, 'entropy');

  getFeatureRatings({
    criterion: 'entropy',
    selected: ['height'],
    metadata: {featureNames: ['age', 'height', 'weight']},
    dataset: [],
  });

  expect(entropy).toBeCalledTimes(1);

  const { available } = entropy.calls.allArgs()[0][0];
  expect(available).toStrictEqual(['age', 'weight']);
});

test('get feature ratings - errorCount', () => {
  const errorCount = spyOn(metrics, 'errorCount');

  getFeatureRatings({
    criterion: 'errorCount',
    selected: [],
    metadata: {featureNames: ['age', 'height', 'weight']},
    dataset: [],
  });

  expect(errorCount).toBeCalledTimes(1);

  const { available } = errorCount.calls.allArgs()[0][0];
  expect(available).toStrictEqual(['age', 'height', 'weight']);
});

test('get feature ratings - errorPercent', () => {
  const errorPercent = spyOn(metrics, 'errorPercent');

  getFeatureRatings({
    criterion: 'errorPercent',
    selected: ['age', 'weight'],
    metadata: {featureNames: ['age', 'height', 'weight']},
    dataset: [],
  });

  expect(errorPercent).toBeCalledTimes(1);

  const { available } = errorPercent.calls.allArgs()[0][0];
  expect(available).toStrictEqual(['height']);
});

test('get feature ratings - errorDeviation', () => {
  const errorDeviation = spyOn(metrics, 'errorDeviation');

  getFeatureRatings({
    criterion: 'errorDeviation',
    selected: [],
    metadata: {featureNames: []},
    dataset: [],
  });

  expect(errorDeviation).toBeCalledTimes(1);
});

// normalize

test('normalize no ratings', () => {
  const ratings = [];
  expect(normalize(ratings)).toStrictEqual(new Map());
});

test('normalize ratings positive', () => {
  const ratings = [
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

  expect(normalize(ratings)).toStrictEqual(expected);
});

test('normalize ratings negative', () => {
  const ratings = [
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

  expect(normalize(ratings)).toStrictEqual(expected);
});

test('normalize ratings negative positive and zero', () => {
  const ratings = [
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

  expect(normalize(ratings)).toStrictEqual(expected);
});

test('normalize one rating', () => {
  const ratings = [
    { feature: 'a', value: 5},
  ];

  const expected = new Map([
    ['a', 1],
  ]);

  expect(normalize(ratings)).toStrictEqual(expected);
});

test('normalize all identical ratings', () => {
  const ratings = [
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

  expect(normalize(ratings)).toStrictEqual(expected);
});

test('normalize all zero ratings', () => {
  const ratings = [
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

  expect(normalize(ratings)).toStrictEqual(expected);
});

test('normalize one rating', () => {
  const ratings = [
    { feature: 'a', value: 1.2345},
  ];

  const expected = new Map([
    ['a', 1],
  ]);

  expect(normalize(ratings)).toStrictEqual(expected);
});