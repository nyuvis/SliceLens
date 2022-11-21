import { query } from "./Database";
import { kernelDensityEstimation } from "simple-statistics";
import * as d3 from "d3";

export {
  getScatterPlotData,
  getStripPlotData,
  getStripPlotMultiplesData,
  getBoxPlotsData,
  getViolinPlotsData,
  getScatterBinnedData,
  getScatterBinnedClassificationData,
  getGroupedBarChartData,
  getStackedHistogramData,
  getStackedBarChartData
};

function getScatterPlotData(xCol: string, yCol: string) {
  return query(`SELECT "${xCol}" as x, "${yCol}" as y, label FROM ds`);
}

function getStripPlotData(xCol: string) {
  return query(`SELECT "${xCol}" as x, label FROM ds`);
}

function getStripPlotMultiplesData(xCol: string, yCol: string) {
  return query(`SELECT "${xCol}" as x, "${yCol}" as y, label FROM ds`);
}

function getBoxPlotsData(xCol: string) {
  return query(`
  SELECT "${xCol}" as x, MIN(label) as min, MAX(label) as max, QUANTILE_CONT(label, 0.25) as q1, QUANTILE_CONT(label, 0.5) as q2, QUANTILE_CONT(label, 0.75) as q3
  FROM ds
  GROUP BY "${xCol}"
  `).then(result => {
    const data = [];

    const x = result.getChild('x');
    const min = result.getChild('min');
    const max = result.getChild('max');
    const q1 = result.getChild('q1');
    const q2 = result.getChild('q2');
    const q3 = result.getChild('q3');

    for (let i = 0; i < x.length; i++) {
      data.push({
        cat: x.get(i),
        min: min.get(i),
        max: max.get(i),
        q1: q1.get(i),
        q2: q2.get(i),
        q3: q3.get(i),
        iqr: q3.get(i) - q1.get(i)
      });
    }

    return data;
  });
}

function getViolinPlotsData(xCol: string) {
  return query(`
  SELECT "${xCol}" as x, MIN(label) as min, MAX(label) as max, QUANTILE_CONT(label, 0.25) as q1, QUANTILE_CONT(label, 0.5) as q2, QUANTILE_CONT(label, 0.75) as q3, LIST(label) as values
  FROM ds
  GROUP BY "${xCol}"
  `).then(result => {
    const data: {
      cat: string,
      min: number,
      max: number,
      q1: number,
      q2: number,
      q3: number,
      count: number,
      iqr: number,
      densities: {y: number, density: number}[]
    }[] = [];

    const x = result.getChild('x');
    const min = result.getChild('min');
    const max = result.getChild('max');
    const q1 = result.getChild('q1');
    const q2 = result.getChild('q2');
    const q3 = result.getChild('q3');
    const values = result.getChild('values');

    for (let i = 0; i < x.length; i++) {
      const scale = d3.scaleLinear().domain([min.get(i), max.get(i)]).nice();
      const thresholds = scale.ticks(50);

      const kde = kernelDensityEstimation(values.get(i).toArray());
      const densities = thresholds.map(y => ({y, density: kde(y)}));

      data.push({
        cat: x.get(i),
        min: min.get(i),
        max: max.get(i),
        q1: q1.get(i),
        q2: q2.get(i),
        q3: q3.get(i),
        count: values.get(i).length,
        iqr: q3.get(i) - q1.get(i),
        densities
      });
    }

    const maxDensity = d3.max(data, datum => d3.max(datum.densities, d => d.density));

    return {data, maxDensity};
  });
}

function getScatterBinnedData(
  xCol: string,
  yCol: string,
  xBinSize: number,
  yBinSize: number,
  xMin: number,
  yMin: number
) {
  // TODO: what if max value = domain?
  return query(`
  SELECT
    (FLOOR(("${xCol}" - ${xMin}) / ${xBinSize}) * ${xBinSize}) + ${xMin} as x_floor,
    (FLOOR(("${yCol}" - ${yMin}) / ${yBinSize}) * ${yBinSize}) + ${yMin} as y_floor,
    AVG(label) as label_average,
    COUNT(*)::INT as cnt
  FROM ds
  GROUP BY 1, 2
  `);
}

function getScatterBinnedClassificationData(
  xCol: string,
  yCol: string,
  xBinSize: number,
  yBinSize: number,
  xMin: number,
  yMin: number
) {
  // TODO: what if max value = domain?
  return query(`
  SELECT
    (FLOOR(("${xCol}" - ${xMin}) / ${xBinSize}) * ${xBinSize}) + ${xMin} as x_floor,
    (FLOOR(("${yCol}" - ${yMin}) / ${yBinSize}) * ${yBinSize}) + ${yMin} as y_floor,
    label,
    COUNT(*)::INT as cnt
  FROM ds
  GROUP BY 1, 2, 3
  `).then(table => {
    const xFloor = table.getChild('x_floor');
    const yFloor = table.getChild('y_floor');
    const label = table.getChild('label');
    const count = table.getChild('cnt');

    const grouped: Map<number, Map<number, {xFloor: number, yFloor: number, total: number, dist: { label: string, count: number}[]}>> = new Map();

    for (let i = 0; i < xFloor.length; i++) {
      const xF = xFloor.get(i);
      const yF = yFloor.get(i);
      const lbl = label.get(i);
      const cnt = count.get(i);

      if (!grouped.has(xF)) {
        grouped.set(xF, new Map());
      }

      if (!grouped.get(xF).has(yF)) {
        grouped.get(xF).set(yF, {xFloor: xF, yFloor: yF, total: 0, dist: []});
      }

      grouped.get(xF).get(yF).dist.push({ label: lbl, count: cnt });
      grouped.get(xF).get(yF).total += cnt;
    }

    const data = Array.from(
      grouped,
      ([_, innerMap]) => Array.from(innerMap, ([_, v]) => v)
    ).flat();

    return data;
  });
}

function getGroupedBarChartData(
  category: string,
) {
  return query(`
  SELECT
    "${category}" as category,
    label,
    COUNT(*)::INT as cnt
  FROM ds
  GROUP BY "${category}", label
  `).then(table => {
    const category = table.getChild('category');
    const label = table.getChild('label');
    const count = table.getChild('cnt');

    const data: {
      category: string,
      label: string,
      count: number,
      pct: number
    }[] = [];

    for (let i = 0; i < category.length; i++) {
      data.push({
        category: category.get(i),
        label: label.get(i),
        count: count.get(i),
        pct: 0
      });
    }

    const categoryToSum = d3.rollup(
      data,
      group => d3.sum(group, d => d.count),
      d => d.category
    );

    for (let i = 0; i < data.length; i++) {
      data[i].pct = data[i].count / categoryToSum.get(data[i].category);
    }

    const maxCount = d3.max(data, d => d.count);
    const maxPct = d3.max(data, d => d.pct);

    return {data, maxCount, maxPct};
  });
}

function getStackedHistogramData(
  col: string,
  binSize: number,
  min: number,
) {
  // TODO: what if max value = domain?
  return query(`
  SELECT
    (FLOOR(("${col}" - ${min}) / ${binSize}) * ${binSize}) + ${min} as fl,
    label,
    COUNT(*)::INT as cnt
  FROM ds
  GROUP BY 1, 2
  `).then(table => {
    const grouped = new Map();

    const floor = table.getChild('fl');
    const label = table.getChild('label');
    const count = table.getChild('cnt');

    for (let i = 0; i < count.length; i++) {
      const fl = floor.get(i);
      const lb = label.get(i);
      const ct = count.get(i);

      if (!grouped.has(fl)) {
        grouped.set(fl, { min: fl, total: 0 });
      }

      grouped.get(fl)[lb] = ct;
      grouped.get(fl).total += ct;
    }

    const data = Array.from(grouped, ([k, v]) => v);

    const maxCount = d3.max(data, d => d.total);

    return {data, maxCount};
  });
}

function getStackedBarChartData(col: string,) {
  return query(`
  SELECT
    "${col}" as category,
    label,
    COUNT(*)::INT as cnt
  FROM ds
  GROUP BY 1, 2
  `).then(table => {
    const grouped = new Map();

    const category = table.getChild('category');
    const label = table.getChild('label');
    const count = table.getChild('cnt');

    for (let i = 0; i < count.length; i++) {
      const cat = category.get(i);
      const lab = label.get(i);
      const cnt = count.get(i);

      if (!grouped.has(cat)) {
        grouped.set(cat, { category: cat, total: 0 });
      }

      grouped.get(cat)[lab] = cnt;
      grouped.get(cat).total += cnt;
    }

    const data = Array.from(grouped, ([_, v]) => v);

    const maxCount = d3.max(data, d => d.total);

    return {data, maxCount};
  });
}