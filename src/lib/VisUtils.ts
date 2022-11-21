import type { ClassificationDataset, Dataset } from "../types";
import type { Table } from "apache-arrow";
import * as d3 from "d3";
import type { PieArcDatum } from "d3";

export {
  scaleCanvas,
  drawScatterDots,
  drawStripDots,
  drawStripMultiplesHorizontal,
  drawStripMultiplesVertical,
  drawScatterBinnedRectRegression,
  drawScatterBinnedRectClassification,
  drawScatterBinnedCircleRegression,
  drawScatterBinnedCircleClassification,
};

// Adapted from https://www.html5rocks.com/en/tutorials/canvas/hidpi/
function scaleCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, width: number, height: number) {
  // assume the device pixel ratio is 1 if the browser doesn't specify it
  const devicePixelRatio = window.devicePixelRatio || 1;

  // set the 'real' canvas size to the higher width/height
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;

  // ...then scale it back down with CSS
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  // scale the drawing context so everything will work at the higher ratio
  context.scale(devicePixelRatio, devicePixelRatio);
}

function drawScatterDots(
  queryResult: Promise<Table<any>>,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  radius: number,
  dataset: Dataset
) {
  ctx.clearRect(0, 0, width, height);

  queryResult.then(table => {
    const xChild = table.getChild('x');
    const yChild = table.getChild('y');
    const labelChild = table.getChild('label');
    for (let i = 0; i < dataset.size; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x(xChild.get(i)), y(yChild.get(i)), radius, 0, 2 * Math.PI);
      ctx.fillStyle = dataset.color(labelChild.get(i));
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawStripDots(
  queryResult: Promise<Table<any>>,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  x: d3.ScaleLinear<number, number>,
  y: () => number,
  radius: number,
  dataset: Dataset
) {
  ctx.clearRect(0, 0, width, height);

  queryResult.then(table => {
    const xChild = table.getChild('x');
    const labelChild = table.getChild('label');
    for (let i = 0; i < dataset.size; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x(xChild.get(i)), y(), radius, 0, 2 * Math.PI);
      ctx.fillStyle = dataset.color(labelChild.get(i));
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawStripMultiplesHorizontal(
  queryResult: Promise<Table<any>>,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  x: d3.ScaleLinear<number, number>,
  fy: d3.ScaleBand<string>,
  yValueToGroup: Record<string,string>,
  y: () => number,
  radius: number,
  dataset: Dataset
) {
  ctx.clearRect(0, 0, width, height);

  queryResult.then(table => {
    // draw frames

    ctx.strokeStyle = '#d3d3d3';

    for (let category of fy.domain()) {
      ctx.strokeRect(
        x(x.domain()[0]),
        fy(category),
        x(x.domain()[1]) - x(x.domain()[0]),
        fy.bandwidth()
      );
    }

    // draw points

    const xChild = table.getChild('x');
    const yChild = table.getChild('y');
    const labelChild = table.getChild('label');

    for (let i = 0; i < dataset.size; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x(xChild.get(i)), fy(yValueToGroup[yChild.get(i)]) + y(), radius, 0, 2 * Math.PI);
      ctx.fillStyle = dataset.color(labelChild.get(i));
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawStripMultiplesVertical(
  queryResult: Promise<Table<any>>,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  y: d3.ScaleLinear<number, number>,
  fx: d3.ScaleBand<string>,
  xValueToGroup: Record<string,string>,
  x: () => number,
  radius: number,
  dataset: Dataset
) {
  ctx.clearRect(0, 0, width, height);

  queryResult.then(table => {
    // draw frames

    ctx.strokeStyle = '#d3d3d3';

    for (let category of fx.domain()) {
      ctx.strokeRect(
        fx(category),
        y(y.domain()[0]),
        fx.bandwidth(),
        y(y.domain()[1]) - y(y.domain()[0]),
      );
    }

    // draw points

    const yChild = table.getChild('x');
    const xChild = table.getChild('y');
    const labelChild = table.getChild('label');

    for (let i = 0; i < dataset.size; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(fx(xValueToGroup[xChild.get(i)]) + x(), y(yChild.get(i)), radius, 0, 2 * Math.PI);
      ctx.fillStyle = dataset.color(labelChild.get(i));
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawScatterBinnedRectRegression(
  queryResult: Promise<Table<any>>,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xBinSize: number,
  yBinSize: number,
  xNumBins: number,
  yNumBins: number,
  dataset: Dataset
) {
  ctx.clearRect(0, 0, width, height);

  queryResult.then(table => {
    const xFloor = table.getChild('x_floor');
    const yFloor = table.getChild('y_floor');
    const labelAverage = table.getChild('label_average');

    const xWidth = x(xFloor.get(0) + xBinSize) - x(xFloor.get(0)) - 1;
    const yWidth = y(yFloor.get(0)) - y(yFloor.get(0) + yBinSize) - 1;

    const xMin = x.domain()[0];
    const yMin = y.domain()[0];
    ctx.fillStyle = '#f9f9f9';

    for (let r = 0; r < yNumBins; r++) {
      for (let c = 0; c < xNumBins; c++) {
        ctx.fillRect(
          x(c * xBinSize + xMin) + 1,
          y(r * yBinSize + yMin) + 1,
          xWidth,
          -yWidth
        );
      }
    }

    for (let i = 0; i < xFloor.length; i++) {
      ctx.fillStyle = dataset.color(labelAverage.get(i));
      ctx.fillRect(
        x(xFloor.get(i)) + 1,
        y(yFloor.get(i)) + 1,
        xWidth,
        -yWidth
      );
    }
  });
}

function drawScatterBinnedRectClassification(
  queryResult: Promise<Table<any>>,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xBinSize: number,
  yBinSize: number,
  xNumBins: number,
  yNumBins: number,
  dataset: Dataset
) {
  ctx.clearRect(0, 0, width, height);

  queryResult.then(table => {
    const xFloor = table.getChild('x_floor');
    const yFloor = table.getChild('y_floor');
    const labelMode = table.getChild('label_mode');
    const labelHist = table.getChild('label_hist');

    const xWidth = x(xFloor.get(0) + xBinSize) - x(xFloor.get(0)) - 1;
    const yWidth = y(yFloor.get(0)) - y(yFloor.get(0) + yBinSize) - 1;

    console.log(labelHist.toJSON());
    console.log(labelHist.toString());

    const xMin = x.domain()[0];
    const yMin = y.domain()[0];
    ctx.fillStyle = '#f9f9f9';

    for (let r = 0; r < yNumBins; r++) {
      for (let c = 0; c < xNumBins; c++) {
        ctx.fillRect(
          x(c * xBinSize + xMin) + 1,
          y(r * yBinSize + yMin) + 1,
          xWidth,
          -yWidth
        );
      }
    }

    for (let i = 0; i < xFloor.length; i++) {
      ctx.fillStyle = dataset.color(labelMode.get(i));
      ctx.fillRect(
        x(xFloor.get(i)) + 1,
        y(yFloor.get(i)) + 1,
        xWidth,
        -yWidth
      );
    }
  });
}

function drawScatterBinnedCircleRegression(
  queryResult: Promise<Table<any>>,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xBinSize: number,
  yBinSize: number,
  xNumBins: number,
  yNumBins: number,
  dataset: Dataset
) {
  ctx.clearRect(0, 0, width, height);

  queryResult.then(table => {
    const xFloor = table.getChild('x_floor');
    const yFloor = table.getChild('y_floor');
    const labelAverage = table.getChild('label_average');
    const count = table.getChild('cnt');

    const xWidth = x(xFloor.get(0) + xBinSize) - x(xFloor.get(0)) - 1;
    const yWidth = y(yFloor.get(0)) - y(yFloor.get(0) + yBinSize) - 1;

    const maxRadius = Math.min(xWidth, yWidth) / 2;

    let maxCount = -Infinity;
    let minCount = Infinity;

    for (let c of count) {
      if (c > maxCount) {
        maxCount = c;
      }

      if (c < minCount) {
        minCount = c;
      }
    }

    const radius = d3.scaleSqrt()
        .domain([minCount, maxCount])
        .range([1, maxRadius]);

    // const xMin = x.domain()[0];
    // const yMin = y.domain()[0];
    // ctx.fillStyle = '#f9f9f9';

    // for (let r = 0; r < yNumBins; r++) {
    //   for (let c = 0; c < xNumBins; c++) {
    //     ctx.fillRect(
    //       x(c * xBinSize + xMin) + 1,
    //       y(r * yBinSize + yMin) + 1,
    //       xWidth,
    //       -yWidth
    //     );
    //   }
    // }

    for (let i = 0; i < xFloor.length; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x(xFloor.get(i)), y(yFloor.get(i)), radius(count.get(i)), 0, 2 * Math.PI);
      ctx.fillStyle = dataset.color(labelAverage.get(i));
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawScatterBinnedCircleClassification(
  queryResult: Promise<{xFloor: number, yFloor: number, total: number, dist: {label: string, count: number}[]}[]>,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xBinSize: number,
  yBinSize: number,
  xNumBins: number,
  yNumBins: number,
  color: d3.ScaleOrdinal<string, string, string>
) {
  ctx.clearRect(0, 0, width, height);

  queryResult.then(data => {
    const xWidth = x(data[0].xFloor + xBinSize) - x(data[0].xFloor) - 1;
    const yWidth = y(data[0].yFloor) - y(data[0].yFloor + yBinSize) - 1;

    const maxRadius = Math.min(xWidth, yWidth) / 2;

    const [minCount, maxCount] = d3.extent(data, d => d.total);

    const radius = d3.scaleSqrt()
        .domain([minCount, maxCount])
        .range([1, maxRadius]);

    const pie = d3.pie<{label: string, count: number}>()
        .value(d => d.count)
        .sort((a, b) => d3.ascending(a.label, b.label));

    const arc = d3.arc<PieArcDatum<{label: string, count: number}>>()
        .innerRadius(0)
        .context(ctx);

    for (let {xFloor, yFloor, total, dist} of data) {
      arc.outerRadius(radius(total));
      ctx.save();
      ctx.translate(x(xFloor), y(yFloor));
      for (let slice of pie(dist)) {
        ctx.beginPath();
        arc(slice);
        ctx.fillStyle = color(slice.data.label);
        ctx.fill();
      }
      ctx.restore();
    }
  });
}