import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { getGroups, updateFeature, addGroup, deleteGroup, mergeGroups, splitGroups, sortGroupsByName, sortGroupsByCount, moveValue, moveGroup, resetUid } from '../src/lib/CategoricalFeatureEditing';
import type { CategoricalFeature } from '../src/types';

test.before.each(() => {
  resetUid();
});

// get groups

test('get groups', () => {
  const feature: CategoricalFeature = {
    type: 'C',
    name: '',
    values: ['a', 'b', 'c', 'd'],
    categories: ['a', 'b', 'c', 'd'],
    valueToGroup: {
      'a': 'a',
      'b': 'b',
      'c': 'c',
      'd': 'd'
    }
  };

  const expected = [
    { name: 'a', values: new Set(['a']), id: 0 },
    { name: 'b', values: new Set(['b']), id: 1 },
    { name: 'c', values: new Set(['c']), id: 2 },
    { name: 'd', values: new Set(['d']), id: 3 },
  ];

  const actual = getGroups(feature);

  assert.equal(actual, expected);
});

test('get groups - grouped', () => {
  const feature: CategoricalFeature = {
    type: 'C',
    name: '',
    values: ['good', 'okay', 'bad'],
    categories: ['a', 'b', 'c', 'd', 'f'],
    valueToGroup: {
      'a': 'good',
      'b': 'good',
      'c': 'okay',
      'd': 'bad',
      'f': 'bad'
    }
  };

  const expected = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 1 },
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
  ];

  const actual = getGroups(feature);

  assert.equal(actual, expected);
});

// update features

test('update feature', () => {
  const feature: CategoricalFeature = {
    type: 'C',
    name: '',
    values: ['a', 'b', 'c', 'd', 'f'],
    categories: ['a', 'b', 'c', 'd', 'f'],
    valueToGroup: {
      'a': 'a',
      'b': 'b',
      'c': 'c',
      'd': 'd',
      'f': 'f',
    }
  };

  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'empty', values: new Set([]), id: 1 },
    { name: 'okay', values: new Set(['c']), id: 2 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  const expected: CategoricalFeature = {
    type: 'C',
    name: '',
    values: ['good', 'okay', 'bad'],
    categories: ['a', 'b', 'c', 'd', 'f'],
    valueToGroup: {
      'a': 'good',
      'b': 'good',
      'c': 'okay',
      'd': 'bad',
      'f': 'bad'
    }
  };

  const actual = updateFeature(feature, groups);

  assert.equal(actual, expected);
});

// add group

test('add group', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'empty', values: new Set([]), id: 1 },
    { name: 'okay', values: new Set(['c']), id: 2 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  const actual = addGroup(groups);

  const expected = [
    { name: 'New', values: new Set([]), id: 0 },
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'empty', values: new Set([]), id: 1 },
    { name: 'okay', values: new Set(['c']), id: 2 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  assert.equal(actual, expected);
});

// delete group


test('delete group - first', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 2 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  const actual = deleteGroup(groups, 0);

  const expected = [
    { name: 'okay', values: new Set(['c']), id: 2 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  assert.equal(actual, expected);
});

test('delete group - middle', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 2 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  const actual = deleteGroup(groups, 1);

  const expected = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  assert.equal(actual, expected);
});


test('delete group - end', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 2 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  const actual = deleteGroup(groups, 2);

  const expected = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 2 },
  ];

  assert.equal(actual, expected);
});

test('delete group - out of range', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 2 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  const actual = deleteGroup(groups, 4);

  const expected = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 2 },
    { name: 'bad', values: new Set(['d', 'f']), id: 3 },
  ];

  assert.equal(actual, expected);
});

// merge groups

test('merge groups', () => {
  const feature: CategoricalFeature = {
    type: 'C',
    name: '',
    values: ['a', 'b', 'c', 'd'],
    categories: ['a', 'b', 'c', 'd'],
    valueToGroup: {
      'a': 'a',
      'b': 'b',
      'c': 'c',
      'd': 'd'
    }
  };

  const expected = [
    { name: 'All values', values: new Set(['a', 'b', 'c', 'd']), id: 0 },
  ];

  const actual = mergeGroups(feature);

  assert.equal(actual, expected);
});

// split groups

test('split groups', () => {
  const feature: CategoricalFeature = {
    type: 'C',
    name: '',
    values: ['good', 'okay', 'bad'],
    categories: ['a', 'b', 'c', 'd', 'f'],
    valueToGroup: {
      'a': 'good',
      'b': 'good',
      'c': 'okay',
      'd': 'bad',
      'f': 'bad'
    }
  };

  const expected = [
    { name: 'a', values: new Set(['a']), id: 0 },
    { name: 'b', values: new Set(['b']), id: 1 },
    { name: 'c', values: new Set(['c']), id: 2 },
    { name: 'd', values: new Set(['d']), id: 3 },
    { name: 'f', values: new Set(['f']), id: 4 },
  ];

  const actual = splitGroups(feature);

  assert.equal(actual, expected);
});

// sort groups by name

test('move value - remove empty', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 1 },
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
  ];

  const expected = [
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 1 },
  ];

  const actual = sortGroupsByName(groups);

  assert.equal(actual, expected);
});

// move value

test('move value', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 1 },
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
  ];

  const expected = [
    { name: 'good', values: new Set(['a']), id: 0 },
    { name: 'okay', values: new Set(['c', 'b']), id: 1 },
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
  ];

  const actual = moveValue('b', 0, 1, groups);

  assert.equal(actual, expected);
});

test('move value - remove empty', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 1 },
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
  ];

  const expected = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'bad', values: new Set(['d', 'f', 'c']), id: 2 },
  ];

  const actual = moveValue('c', 1, 2, groups);

  assert.equal(actual, expected);
});

// move group

test('move groups - first to last', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 1 },
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
  ];

  const expected = [
    { name: 'okay', values: new Set(['c']), id: 1 },
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
  ];

  const actual = moveGroup(0, 2, groups);

  assert.equal(actual, expected);
});

test('move groups - second to first', () => {
  const groups = [
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'okay', values: new Set(['c']), id: 1 },
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
  ];

  const expected = [
    { name: 'okay', values: new Set(['c']), id: 1 },
    { name: 'good', values: new Set(['a', 'b']), id: 0 },
    { name: 'bad', values: new Set(['d', 'f']), id: 2 },
  ];

  const actual = moveGroup(1, 0, groups);

  assert.equal(actual, expected);
});

test.run();