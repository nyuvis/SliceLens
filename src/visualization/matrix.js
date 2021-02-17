/*
 * Nested matrix.
 *
 * References:
 */

import * as d3 from "d3";

export { matrix as default };

function matrix() {
  let margin = {
    top: 100,
    bottom: 10,
    left: 100,
    right: 10
  };

  let width = 600 - margin.left - margin.right;
  let height = 600 - margin.top - margin.bottom;

  let showPredictions = false;
  let showSize = true;
  let color = d3.scaleOrdinal()
      .range(d3.schemeCategory10);

  function chart(selection) {
    selection.each(function({metadata, data, selectedFeatures}) {
      const root = prepareData();
      const {size, y, incorrectScale, xAxisMargin, yAxisMargin} = getScales();

      const g = d3.select(this)
        .selectAll('#vis-group')
        .data([root])
        .join(enter => enter.append('g')
            .attr('id', 'vis-group')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .call(g => g.append('g').attr('id', 'vis'))
            .call(g => g.append('g')
                .attr('id', 'tooltip')
                .attr('font-size', '14px')
                .attr('pointer-events', 'none')));

      const stack = d3.stack()
          .keys(metadata.labelValues)
          .value((d, key) => d.get(key));

      // TODO: stop clearing before drawing
      g.selectAll('.cell').remove();
      g.selectAll('.node').remove();
      g.selectAll('.axis').remove();
      g.selectAll('.divider').remove();

      draw({
        cell: g.select('#vis'),
        xSpace: width,
        ySpace: height,
        showXAxis: true,
        showYAxis: true,
        showDividers: selectedFeatures.length > 2,
      });

      setupTooltips();


      function prepareData() {
        const root = d3.hierarchy(data)
            .sum(d => d.value);

        return root;
      }


      function getScales() {
        const size = d3.scaleSqrt()
            .domain([0, d3.max(root.leaves(), d => d.value)]);

        const incorrectScale = d3.scaleLinear();

        const y = d3.scaleLinear();

        const xAxisMargin = d3.scalePoint()
            .domain(selectedFeatures.filter((d, i) => i % 2 === 0))
            .range([-margin.top, 0])
            .padding(1);

        const yAxisMargin = d3.scalePoint()
            .domain(selectedFeatures.filter((d, i) => i % 2 !== 0))
            .range([-margin.left, 0])
            .padding(1);

        return {size, y, incorrectScale, xAxisMargin, yAxisMargin};
      }


      function draw({ cell, xSpace, ySpace, showXAxis, showYAxis, showDividers }) {
        const node = cell.datum();

        // if leaf node
        if (node.depth === root.height) {
          const maxCellSize = Math.min(xSpace, ySpace);
          size.range([0, maxCellSize]);

          const counts = showPredictions ?
              node.data.predictionCounts :
              node.data.counts;

          const stacked = stack([counts]);
          const sideLength = showSize ? size(node.value) : maxCellSize;

          y.domain([0, node.value])
              .range([0, sideLength]);

          const mapped = stacked.map(b => {
            const label = b.key;
            const pos = b[0];

            const rect = {
              width: sideLength,
              height: y(pos[1]) - y(pos[0]),
              x: 0,
              y: y(pos[0]),
              label: label,
              color: color(label),
              count: counts.get(label),
            };

            if (showPredictions) {
              const predictionResults = node.data.predictionResults.get(label);
              if (predictionResults !== undefined && predictionResults.has('incorrect')) {
                rect.incorrect = predictionResults.get('incorrect');
              } else {
                rect.incorrect = 0;
              }
            }

            return rect;
          });

          const segments = cell.append('g')
              .attr('class', 'node')
              .attr('transform', `translate(${(xSpace - sideLength) / 2},${(ySpace - sideLength) / 2})`)
            .selectAll('.segment')
            .data(mapped)
            .join(enter => enter.append('g')
                .attr('class', 'segment')
                .call(g => g.append('rect')
                  .attr('class', 'class-rect')))
              .attr('transform', d => `translate(${d.x},${d.y})`);

          segments.select('.class-rect')
              .attr('width', d => d.width)
              .attr('height', d => d.height)
              .attr('fill', d => d.color);

          segments.selectAll('.incorrect')
            .data(d => {
              if (!showPredictions) {
                return [];
              }

              incorrectScale.domain([0, d.count])
                  .range([0, d.height]);

              return [{
                width: d.width,
                height: incorrectScale(d.incorrect),
              }];
            })
            .join('rect')
              .attr('class', 'incorrect')
              .attr('width', d => d.width)
              .attr('height', d => d.height)
              .attr('fill', 'url(#stripes)');

          return;
        }

        // don't recurse if the node doesn't have any children
        // this can happen when a node has no datapoints
        if (!node.children) {
          return;
        }

        const isXSplit = node.depth % 2 === 0;

        const splitFeature = node.children[0].data.splitFeature;
        const splitLabels = metadata.features[splitFeature].values;
        const scale = d3.scaleBand()
            .domain(isXSplit ?
              splitLabels :
              splitLabels.slice().reverse())
            .range([0, isXSplit ? xSpace : ySpace])
            .padding(0.05);

        const nextXSpace = isXSplit ? scale.bandwidth() : xSpace;
        const nextYSpace = isXSplit ? ySpace : scale.bandwidth();

        cell.selectAll('.cell')
          .data(node.children)
          .join('g')
            .attr('class', 'cell')
            .attr('transform', d => {
              const xOffset = isXSplit ? scale(d.data.splitLabel) : 0;
              const yOffset = isXSplit ? 0 : scale(d.data.splitLabel);
              return `translate(${xOffset},${yOffset})`;
            })
            .each(function(d) {
              const showXAxisNext = isXSplit ?
                showXAxis :
                showXAxis && d.data.splitLabel === scale.domain()[0];

              const showYAxisNext = isXSplit ?
                showYAxis && d.data.splitLabel === scale.domain()[0]:
                showYAxis;

              draw({
                cell: d3.select(this),
                xSpace: nextXSpace,
                ySpace: nextYSpace,
                showXAxis: showXAxisNext,
                showYAxis: showYAxisNext,
                showDividers: node.depth === 0 && selectedFeatures.length > 3
              });
            });

        // add axes

        if (isXSplit && showXAxis) {
          const axis = d3.axisTop(scale).tickSize(0);

          cell.append('g')
              .attr('class', 'axis')
              .call(axis)
              .call(g => g.selectAll('.domain').remove())
              .call(g => g.selectAll('text').attr('font-family', 'Fira Sans'))
              .attr('transform', `translate(0, ${xAxisMargin(splitFeature)})`)
            .append('text')
              .attr('x', xSpace / 2)
              .attr('y', -15)
              .attr('font-family', 'Fira Sans')
              .attr('font-weight', '500')
              .attr('fill', 'black')
              .text(splitFeature)

        } else if (!isXSplit && showYAxis) {
          const axis = d3.axisLeft(scale).tickSize(0);

          const axisGroup = cell.append('g')
              .attr('class', 'axis')
              .call(axis)
              .call(g => g.selectAll('.domain').remove())
              .call(g => g.selectAll('text').attr('font-family', 'Fira Sans'))
              .attr('transform', `translate(${yAxisMargin(splitFeature)},0)`)

          axisGroup.append('text')
              .attr('y', ySpace / 2)
              .attr('x', -15)
              .attr('font-family', 'Fira Sans')
              .attr('font-weight', '500')
              .attr('fill', 'black')
              .attr('text-anchor', 'middle')
              .attr('transform', `rotate(-90,-15,${ySpace / 2})`)
              .text(splitFeature)

          axisGroup.selectAll('.tick text')
              .attr('transform', 'rotate(-90,-3,0)')
              .attr('text-anchor', 'middle');
        }

        // add dividers
        if (showDividers) {
          const midPoints = d3.pairs(splitLabels,
            (a, b) => (scale(a) + scale(b) + scale.bandwidth()) / 2);

          const lines = cell.selectAll(`.divider.${isXSplit ? 'x' : 'y'}`)
            .data(midPoints)
            .join('line')
              .attr('stroke', '#dcdcdc')
              .attr('stroke-width', 1)
              .attr('class', 'divider');

          if (isXSplit) {
            lines
                .attr('x1', d => d)
                .attr('x2', d => d)
                .attr('y1', 0)
                .attr('y2', ySpace);
          } else {
            lines
                .attr('x1', 0)
                .attr('x2', xSpace)
                .attr('y1', d => d)
                .attr('y2', d => d);
          }
        }
      }

      function setupTooltips() {
        const tooltip = g.select('#tooltip');

        d3.selectAll('.node').on('mousemove', function() {
          const [x, y] = d3.mouse(g.node());
          const cell = d3.select(this);
          const padding = 5;

          tooltip.style('display', null)
              .attr('transform', `translate(${x},${y + padding * 3})`);

          const rect = tooltip.selectAll('rect')
            .data([null])
            .join('rect')
              .style('stroke', 'black')
              .style('fill', 'white');

          const node = cell.datum();

          const splitLines = node.depth === 0 ? ["Entire dataset"] : node.ancestors()
              .reverse()
              .slice(1)
              .map(d => `${d.data.splitFeature}: ${d.data.splitLabel}`);

          let countLines = [];
          if (showPredictions) {
            countLines = Array.from(node.data.predictionResults, ([label, counts]) => {
              return Array.from(counts, ([correct, count]) => {
                const prefix = correct === 'correct' ? 'true' : 'false';
                return `${prefix} ${label}: ${count}`;
              }).sort();
            }).flat();
          } else {
            countLines = Array.from(node.data.counts, ([key, val]) => `${key}: ${val}`);
          }

          countLines.push(`total: ${node.value}`);

          const text = tooltip.selectAll('text')
            .data([null])
            .join('text');

          text.selectAll('.split')
            .data([null])
            .join('tspan')
              .attr('class', 'split')
              .attr('dominant-baseline', 'hanging')
              .attr('font-weight', 'bold')
              .attr('x', 0)
              .attr('y', 0)
              .text('Split');

          text.selectAll('.split-line')
            .data(splitLines)
            .join('tspan')
              .attr('class', 'split-line')
              .attr('dominant-baseline', 'hanging')
              .attr('x', 0)
              .attr('y', (d, i) => `${(i + 1) * 1.1}em`)
              .text(d => d);

          text.selectAll('.count')
            .data([null])
            .join('tspan')
              .attr('class', 'split')
              .attr('dominant-baseline', 'hanging')
              .attr('font-weight', 'bold')
              .attr('x', 0)
              .attr('y', `${(splitLines.length + 1) * 1.1}em`)
              .text('Counts');

          text.selectAll('.count-line')
            .data(countLines)
            .join('tspan')
              .attr('class', 'count-line')
              .attr('dominant-baseline', 'hanging')
              .attr('x', 0)
              .attr('y', (d, i) => `${(i + 2 + splitLines.length) * 1.1}em`)
              .text(d => d);

          const {width: boxWidth, height: boxHeight} = text.node().getBBox();
          rect.attr('x', (-boxWidth / 2) - padding)
              .attr('y', -padding)
              .attr('width', boxWidth + 2 * padding)
              .attr('height', boxHeight + 2 * padding);

          text.attr('transform', `translate(${-boxWidth / 2},0)`);

        })
        .on('mouseleave', function() {
          tooltip.style('display', 'none');
        });
      }
    });
  }

  chart.size = function(dims) {
    if (!arguments.length) return [width, height];
    const [w, h] = dims;
    const minDim = Math.min(w, h);
    width = minDim - margin.left - margin.right;
    height = minDim - margin.top - margin.bottom;
    return chart;
  }

  chart.showPredictions = function(p) {
    if (!arguments.length) return showPredictions;
    showPredictions = p;
    return chart;
  }

  chart.showSize = function(s) {
    if (!arguments.length) return showSize;
    showSize = s;
    return chart;
  }

  chart.color = function(c) {
    if (!arguments.length) return color;
    color = c;
    return chart;
  }

  chart.kind = 'matrix';

  return chart;
}
