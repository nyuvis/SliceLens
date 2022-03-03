import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as d3 from "d3";
import {
  getScales,
  getPositionOfSquare,
  getClassificationTooltipAmounts,
} from '../src/lib/Squares';
import * as fs from "fs";
import type {Features, ClassificationNode, ClassificationTooltipData} from '../src/types';

function readJson(filename: string) {
  return JSON.parse(
    fs.readFileSync(`./tests/data/${filename}`).toString()
  );
}

// getScales

test('getScales no features should return an empty array', () => {
  assert.equal(getScales([], 100, false), []);
});

test('getScales one feature', () => {
  const features: Features = readJson('features-1.json');
  const selectedFeatures = [features['age']];
  const actual = getScales(selectedFeatures, 300, false);
  const expected = [
    d3.scaleBand<number>().domain([0, 1, 2]).range([0, 300]),
  ];

  assert.equal(actual[0].domain(), expected[0].domain());
  assert.equal(actual[0].range(), expected[0].range());
  assert.equal(actual[0].bandwidth(), expected[0].bandwidth());
});

test('getScales two features', () => {
  const features: Features = readJson('features-1.json');
  const selectedFeatures = [features['age'], features['job']];
  const actual = getScales(selectedFeatures, 300, false);
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
  const features: Features = readJson('features-1.json');
  const selectedFeatures = [features['age'], features['job']];
  const actual = getScales(selectedFeatures, 300, true);
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
  assert.is(getPositionOfSquare(new Map(), [], []), 0);
});

test('get position of square one feature', () => {
  const features: Features = readJson('features-1.json');

  const xFeatures = [features['age']];

  const scales = [
    d3.scaleBand<number>().domain([0, 1, 2]).range([0, 300]),
  ];

  const splits0 = new Map([['age', 0]]);
  assert.is(getPositionOfSquare(splits0, xFeatures, scales), 0);

  const splits1 = new Map([['age', 1]]);
  assert.is(getPositionOfSquare(splits1, xFeatures, scales), 100);

  const splits2 = new Map([['age', 2]]);
  assert.is(getPositionOfSquare(splits2, xFeatures, scales), 200);
});

test('get position of square two features', () => {
  const features: Features = readJson('features-1.json');

  const xFeatures = [features['age'], features['job']];

  const scales = [
    d3.scaleBand<number>().domain([0, 1, 2]).range([0, 300]),
    d3.scaleBand<number>().domain([0, 1, 2, 3, 4]).range([0, 100]),
  ];

  const splits = new Map();

  for (let age = 0; age < 3; age++) {
    for (let job = 0; job < 5; job++) {
      splits.set('age', age);
      splits.set('job', job);
      assert.is(getPositionOfSquare(splits, xFeatures, scales), age * 100 + job * 20);
    }
  }
});

// tooltips

test('get tooltip amounts with predictions', () => {
  const d: ClassificationNode = {
    type: 'classification',
    size: 300,
    splits: new Map([
      ['age', 0],
      ['favoriteNumber', 2]
    ]),
    groundTruth: [
      { label: "no", size: 100, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 200, correct: true, offset: 100, pctPtDiffFromWhole: 0 },
    ],
    predictions: [
      { label: "no", size: 150, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 50, correct: false, offset: 150, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 100, correct: true, offset: 200, pctPtDiffFromWhole: 0 },
    ]
  };

  const expected: ClassificationTooltipData = [
    {
      display: 'no (incorrect)',
      size: 150,
      percent: '50.0%',
      correct: false,
      label: 'no'
    },
    {
      display: 'yes (incorrect)',
      size: 50,
      percent: '16.7%',
      correct: false,
      label: 'yes'
    },
    {
      display: 'yes (correct)',
      size: 100,
      percent: '33.3%',
      correct: true,
      label: 'yes'
    }
  ];

  const actual = getClassificationTooltipAmounts(true, d, d3.format('.1%'));

  assert.equal(actual, expected);
});

test('get tooltip amounts no predictions', () => {
  const d: ClassificationNode = {
    type: 'classification',
    size: 300,
    splits: new Map([
      ['age', 0],
      ['favoriteNumber', 2]
    ]),
    groundTruth: [
      { label: "no", size: 100, correct: true, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 200, correct: true, offset: 100, pctPtDiffFromWhole: 0 },
    ],
    predictions: [
      { label: "no", size: 150, correct: false, offset: 0, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 50, correct: false, offset: 150, pctPtDiffFromWhole: 0 },
      { label: "yes", size: 100, correct: true, offset: 200, pctPtDiffFromWhole: 0 },
    ]
  };

  const expected: ClassificationTooltipData = [
    {
      display: 'no',
      size: 100,
      percent: '33.3%',
      correct: true,
      label: 'no'
    },
    {
      display: 'yes',
      size: 200,
      percent: '66.7%',
      correct: true,
      label: 'yes'
    }
  ];

  const actual = getClassificationTooltipAmounts(false, d, d3.format('.1%'));

  assert.equal(actual, expected);
});

test.run();