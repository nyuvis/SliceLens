import * as d3 from "d3";
import { init, query } from '../lib/Database';
import type {
  Dataset,
  ClassificationDataset,
  RegressionDataset,
  Features,
} from "../types";

export {
  parseDataset,
};


function parseDataset(content: string, name: string): Promise<Dataset> {
  return init('ds', content).then(db => {
    const countQ: Promise<number> = query(`SELECT count()::INT as cnt FROM ds`).then(result => result.get(0).cnt);

    const distinctQ = query(`DESCRIBE ds`).then((describeResult) => {
      const columnNames: string[] = describeResult.getChild('column_name').toArray();
      const columnTypes: string[] = describeResult.getChild('column_type').toArray();

      const numericTypes = new Set([
        'TINYINT', 'SMALLINT', 'INTEGER', 'BIGINT', 'HUGEINT',
        'UTINYINT', 'USMALLINT', 'UINTEGER', 'UBIGINT',
        'REAL', 'DOUBLE',
      ]);

      let originalNumericCols: string[] = columnNames.filter((_: string, i: number) => numericTypes.has(columnTypes[i]));

      const selectPart = originalNumericCols.map(col => `approx_count_distinct("${col}") as "${col}"`).join(',');
      return Promise.all([
        Promise.resolve(columnNames),
        Promise.resolve(originalNumericCols),
        query(`SELECT ${selectPart} from ds`)
      ]);
    });

    const alterQ = distinctQ.then(([columnNames, originalNumericCols, distinctResult]) => {
      const counts = distinctResult.get(0);
      const threshold = 12;

      const numericColumns = [];
      const columnsToConvert = [];

      originalNumericCols.forEach((col, i) => {
        if (counts[col] > threshold) {
          numericColumns.push(col);
        } else {
          columnsToConvert.push(col);
        }
      });

      const alterQuery = columnsToConvert.map(col => `ALTER TABLE ds ALTER COLUMN "${col}" TYPE VARCHAR;`).join('\n');
      return Promise.all([Promise.resolve(columnNames), Promise.resolve(numericColumns), query(alterQuery)]);
    });

    const featuresPromise: Promise<Features> = alterQ.then(([columnNames, numericColumns]) => {
      const selectPart = numericColumns.map(feat => `MIN("${feat}") as "min${feat}", MAX("${feat}") as "max${feat}"`).join(', ');
      const extentQuery = query(`SELECT ${selectPart} from ds`).then(res => {
        return Object.fromEntries(numericColumns.map(feat => {
          const extent: [number, number] = [res.getChild(`min${feat}`).get(0), res.getChild(`max${feat}`).get(0)];
          return [feat, { type: 'Q', name: feat, extent }];
        }));
      });

      const categoricalColumns = columnNames.filter(d => !numericColumns.includes(d));
      const distinctQuery = Promise.all(categoricalColumns.map(feat => {
        return query(`SELECT DISTINCT("${feat}") from ds ORDER BY "${feat}"`).then(res => {
          const values: string[] = res.getChild(`${feat}`).toArray();
          return [
            feat,
            {
              type: 'C',
              name: feat,
              values: values,
              categories: values,
              valueToGroup: Object.fromEntries(d3.zip(values, values))
            }
          ];
        });
      })).then(d => Object.fromEntries(d));

      return Promise.all([extentQuery, distinctQuery]).then(([quant, cat]) => Object.assign(quant, cat));
    });

    const datasetPromise: Promise<Dataset> = Promise.all([countQ, featuresPromise]).then(([size, features]) => {
      const hasPredictions = features.hasOwnProperty('prediction');
      const featureNames = Object.keys(features).filter(d => d !== 'label' && d !== 'prediction');

      const label = features.label;

      delete features.label;
      delete features.prediction;

      if (label.type === 'C') {
        const color = d3.scaleOrdinal<string, string, string>()
            .domain(label.values)
            .range(d3.schemeCategory10);

        const ds: ClassificationDataset = {
          type: 'classification',
          name,
          featureNames,
          features,
          size,
          hasPredictions,
          labelValues: label.values,
          color
        };

        return ds;
      } else {
        const color = d3.scaleSequential<string, string>()
            .domain(label.extent)
            // .interpolator((t) => d3.interpolateCividis(1 - t))
            .interpolator(d3.interpolateBlues)
            .unknown("black");

        const ds: RegressionDataset = {
          type: 'regression',
          name,
          featureNames,
          features,
          size,
          hasPredictions,
          labelExtent: label.extent,
          color
        };

        return ds;
      }
    });

    return datasetPromise;
  });
}
