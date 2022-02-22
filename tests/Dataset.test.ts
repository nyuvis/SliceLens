import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as d3 from "d3";
import {
  parseDataset
} from '../src/lib/Dataset';
import * as fs from "fs";
import type {Filter, Features, Dataset} from '../src/types';

function readCsv(filename: string): Dataset {
  const data = d3.csvParse(
    fs.readFileSync(`./tests/data/${filename}`).toString(),
  );

  const ds = parseDataset(data, filename);

  return ds;
}

function readJson(filename: string) {
  return JSON.parse(
    fs.readFileSync(`./tests/data/${filename}`).toString()
  );
}

test('todo', () => {
  assert.ok(true);
});

test.run();