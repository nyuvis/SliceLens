import { test } from 'uvu';
import * as assert from 'uvu/assert';
import {
  isNumeric,
  areArraysEqual
} from '../src/lib/Utils';

test('is numeric', () => {
  assert.ok(isNumeric('0'));
  assert.ok(isNumeric('1'));
  assert.ok(isNumeric('0.00'));
  assert.ok(isNumeric('-1'));
  assert.ok(isNumeric('-0'));
  assert.ok(isNumeric('-.5'));
  assert.ok(isNumeric('-123.123'));
  assert.ok(isNumeric(0));
  assert.ok(isNumeric(1));
  assert.ok(isNumeric(0.00));
  assert.ok(isNumeric(-1));
  assert.ok(isNumeric(-0));
  assert.ok(isNumeric(-.5));
  assert.ok(isNumeric(-123.123));

  assert.not(isNumeric('abc'));
  assert.not(isNumeric('.'));
  assert.not(isNumeric(' '));
  assert.not(isNumeric('.0.'));
  assert.not(isNumeric('10..'));
  assert.not(isNumeric('1.0a'));
  assert.not(isNumeric('NaN'));
  assert.not(isNumeric(''));
  assert.not(isNumeric(null));
  assert.not(isNumeric(undefined));
  assert.not(isNumeric(NaN));
});

test('are arrays equal', () => {
  // true

  // default equality function
  assert.ok(areArraysEqual([], []));
  assert.ok(areArraysEqual([1], [1]));
  assert.ok(areArraysEqual(['hello'], ['hello']));
  assert.ok(areArraysEqual([1, 2, 3, 4], [1, 2, 3, 4]));

  // custom equality function
  assert.ok(areArraysEqual<{k: string, v: number}>(
    [{ k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'c', v: 3 }],
    [{ k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'c', v: 3 }],
    (a, b) => a.k === b.k && a.v === b.v
  ));
  assert.ok(areArraysEqual(
    [[1, 2, 3], [4, 5, 6]],
    [[1, 2, 3], [4, 5, 6]],
    areArraysEqual
  ));

  // false

  // default equality function
  assert.not(areArraysEqual([], [1]));
  assert.not(areArraysEqual([1], [2]));
  assert.not(areArraysEqual(['hello'], ['good bye']));
  assert.not.ok(areArraysEqual([1, 2, 3], [1, 2, 3, 4]));
  assert.not.ok(areArraysEqual([1, 2, 3, 4], [1, 2, 3]));

  // custom equality function
  assert.not.ok(areArraysEqual<{k: string, v: number}>(
    [{ k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'c', v: 3 }],
    [{ k: 'a', v: 1 }, { k: 'b', v: 9 }, { k: 'c', v: 3 }],
    (a, b) => a.k === b.k && a.v === b.v
  ));
  assert.not.ok(areArraysEqual(
    [[1, 2, 3], [4, 5, 7]],
    [[1, 2, 3], [4, 5, 6]],
    areArraysEqual
  ));
});


test.run();