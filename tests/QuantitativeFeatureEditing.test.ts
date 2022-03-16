import * as d3 from 'd3';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { increaseNumberOfBins, decreaseNumberOfBins, setBins, setBinLabels, areThresholdsValid, allowedBinNumbers } from '../src/lib/QuantitativeFeatureEditing';
import type { QuantitativeFeature } from '../src/types';

// increase number of bins

test('increase number of bins', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 3,
    thresholds: [40, 80],
    values: ['[0, 40)', '[40, 80)', '[80, 120]'],
    format: '.2~f'
  };

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 4,
    thresholds: [30, 60, 90],
    values: ['[0, 30)', '[30, 60)', '[60, 90)', '[90, 120]'],
    format: '.2~f'
  };

  increaseNumberOfBins(feature, []);

  assert.equal(feature, expected);
});

test('increase number of bins - at max', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 6,
    thresholds: [20, 40, 60, 80, 100],
    values: ['[0, 20)', '[20, 40)', '[40, 60)', '[60, 80)', '[80, 100)', '[100, 120]'],
    format: '.2~f'
  };

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 6,
    thresholds: [20, 40, 60, 80, 100],
    values: ['[0, 20)', '[20, 40)', '[40, 60)', '[60, 80)', '[80, 100)', '[100, 120]'],
    format: '.2~f'
  };

  increaseNumberOfBins(feature, []);

  assert.equal(feature, expected);
});

// decrease number of bins

test('decrease number of bins', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 4,
    thresholds: [30, 60, 90],
    values: ['[0, 30)', '[30, 60)', '[60, 90)', '[90, 120]'],
    format: '.2~f'
  };

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 3,
    thresholds: [40, 80],
    values: ['[0, 40)', '[40, 80)', '[80, 120]'],
    format: '.2~f'
  };

  decreaseNumberOfBins(feature, []);

  assert.equal(feature, expected);
});

test('decrease number of bins - at min', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 2,
    thresholds: [60],
    values: ['[0, 60)', '[60, 120]'],
    format: '.2~f'
  };

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 2,
    thresholds: [60],
    values: ['[0, 60)', '[60, 120]'],
    format: '.2~f'
  };

  decreaseNumberOfBins(feature, []);

  assert.equal(feature, expected);
});


// set bins

test('set bins - interval', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 4,
    thresholds: [],
    values: [],
    format: '.2~f'
  };

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'interval',
    numBins: 4,
    thresholds: [30, 60, 90],
    values: ['[0, 30)', '[30, 60)', '[60, 90)', '[90, 120]'],
    format: '.2~f'
  };

  assert.ok(setBins(feature, []));

  assert.equal(feature, expected);
});

test('set bins - quantile', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'quantile',
    numBins: 4,
    thresholds: [],
    values: [],
    format: '.2~f'
  };

  const values = [
    1, 2, 3, 4, 5,
    15, 25, 35, 45, 55,
    61, 62, 63, 64, 65,
    110, 112, 114, 116, 118
  ];

  const f = d3.format('.2~f');

  const q1 = d3.quantile(values, 1/4);
  const q2 = d3.quantile(values, 2/4);
  const q3 = d3.quantile(values, 3/4);

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'quantile',
    numBins: 4,
    thresholds: [q1, q2, q3],
    values: [`[0, ${f(q1)})`, `[${f(q1)}, ${f(q2)})`, `[${f(q2)}, ${f(q3)})`, `[${f(q3)}, 120]`],
    format: '.2~f'
  };

  assert.ok(setBins(feature, values));

  assert.equal(feature, expected);
});

test('set bins - custom increase bins', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'custom',
    numBins: 4,
    thresholds: [40, 80],
    values: ['[0, 40)', '[40, 80)', '[80, 120]'],
    format: '.2~f'
  };

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'custom',
    numBins: 4,
    thresholds: [40, 80, 0],
    values: ['[0, 40)', '[40, 80)', '[80, 120]'],
    format: '.2~f'
  };

  assert.not(setBins(feature, []));

  assert.equal(feature, expected);
});

test('set bins - custom decrease bins', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'custom',
    numBins: 2,
    thresholds: [40, 80],
    values: ['[0, 40)', '[40, 80)', '[80, 120]'],
    format: '.2~f'
  };

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'custom',
    numBins: 2,
    thresholds: [40],
    values: ['[0, 40)', '[40, 80)', '[80, 120]'],
    format: '.2~f'
  };

  assert.ok(setBins(feature, []));

  assert.equal(feature, expected);
});

test('set bins - custom same bins', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'custom',
    numBins: 4,
    thresholds: [30, 60, 90],
    values: ['[0, 30)', '[30, 60)', '[60, 90)', '[90, 120]'],
    format: '.2~f'
  };

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 120],
    splitType: 'custom',
    numBins: 4,
    thresholds: [30, 60, 90],
    values: ['[0, 30)', '[30, 60)', '[60, 90)', '[90, 120]'],
    format: '.2~f'
  };

  assert.ok(setBins(feature, []));

  assert.equal(feature, expected);
});

// are thresholds valid

test('are thresholds valid - true', () => {
  assert.ok(areThresholdsValid([0, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9]));
  assert.ok(areThresholdsValid([-10, 0], [-9, -8, -7, -6, -5, -4, -3, -2, -1]));
  assert.ok(areThresholdsValid([-5, 5], [-4, -3, -2, -1, 0, 1, 2, 3, 4]));
});

test('are thresholds valid - false, decreasing', () => {
  assert.not(areThresholdsValid([0, 10], [1, 2, 3, 4, 3, 5, 6, 7, 8, 9]));
  assert.not(areThresholdsValid([0, 10], [1, 2, 3, 4, 5, 0, 6, 7, 8, 9]));
  assert.not(areThresholdsValid([0, 10], [-1, 2, 2, 3, 4, 5, 6, 7, 8, 9]));
  assert.not(areThresholdsValid([0, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]));
});

test('are thresholds valid - false, not strictly increasing', () => {
  assert.not(areThresholdsValid([0, 10], [1, 2, 3, 4, 4, 5, 6, 7, 8, 9]));
  assert.not(areThresholdsValid([0, 10], [1, 2, 3, 4, 4, 4, 6, 7, 8, 9]));
  assert.not(areThresholdsValid([0, 10], [1, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  assert.not(areThresholdsValid([0, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 9]));
  assert.not(areThresholdsValid([0, 10], [0, 2, 3, 4, 5, 6, 7, 8, 9, 9]));
  assert.not(areThresholdsValid([0, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
});

// set bin labels

test('set bin labels', () => {
  const feature: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 100],
    splitType: 'interval',
    numBins: 5,
    thresholds: [20, 40, 60, 80],
    values: [],
    format: '.2~f'
  };

  const expected: QuantitativeFeature = {
    type: 'Q',
    name: '',
    extent: [0, 100],
    splitType: 'interval',
    numBins: 5,
    thresholds: [20, 40, 60, 80],
    values: ['[0, 20)', '[20, 40)', '[40, 60)', '[60, 80)', '[80, 100]'],
    format: '.2~f'
  };

  setBinLabels(feature, []);

  assert.equal(feature, expected);
});

test.run();