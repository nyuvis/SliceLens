/*
 * Node link diagram. 
 *
 * References:
 * https://bost.ocks.org/mike/chart
 * https://observablehq.com/@d3/tidy-tree
 * https://observablehq.com/@d3/line-chart-with-tooltip
 * https://observablehq.com/@d3/hierarchical-edge-bundling
 */

import * as d3_array from "d3-array";
import * as d3_all from "d3";

const d3 = {...d3_array, ...d3_all};

import { getCategoryColorLegend } from './util.js';

export {nodelink as default };

function nodelink() {
  let margin = {
    top: 50,
    bottom: 100,
    left: 25,
    right: 0
  };
  
  let width = 800 - margin.left - margin.right;
  let height = 600 - margin.top - margin.bottom;

  let showPredictions = false;
  
  function chart(selection) {
    const lightgray = '#d3d3d3';

    selection.each(function({metadata, data, selectedFeatures}) {
      const maxNodeSize = 50;
      const root = prepareData();
      const {size, y, color, incorrectScale} = getScales();

      const g = d3.select(this)
        .selectAll('#vis-group')
        .data([root])
        .join(enter => enter.append('g')
            .attr('id', 'vis-group')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .call(g => g.append('g').attr('id', 'tree')
              .call(tree => tree.append('g').attr('id', 'links'))
              .call(tree => tree.append('g').attr('id', 'nodes')))
            .call(g => g.append('g').attr('id', 'row-labels'))
            .call(g => g.append(() => getCategoryColorLegend(color))
                .attr('transform', `translate(0,${-margin.top + 10})`))
            .call(g => g.append('g')
                .attr('id', 'tooltip')
                .attr('font-size', '12px')
                .attr('pointer-events', 'none')));
      
      draw();
      
      function prepareData() {
        const root = d3.hierarchy(data)
            .sum(d => d.value);

        const tree = d3.tree()
            .size([width, height]);

        tree(root);

        return root;
      }
      
      function getScales() {
        const size = d3.scaleSqrt()
            .domain([0, root.value])
            .range([0, maxNodeSize]);

        const y = d3.scaleLinear();

        const incorrectScale = d3.scaleLinear();

        const color = d3.scaleOrdinal()
            .domain(metadata.labelValues)
            .range(d3.schemeCategory10);
     
        return {size, y, color, incorrectScale};
      }

      function draw() {
        const link = d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y);
        
        const links = g.select('#links')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', lightgray)
            .attr('stroke-width', 1)
          .selectAll('path')
          .data(root.links())
          .join('path')
            .attr('d', link)
            .each(function(d) {
              d.target.edgeToParent = this;
            });

        const nodes = g.select('#nodes')
          .selectAll('.node')
          .data(root.descendants())
          .join(enter => enter.append('g')
              .attr('class', 'node')
              .call(g => g.append('text')
                  .attr('font-size', 10)
                  .attr('text-anchor', 'end')
                  .attr('fill', 'black')
                  .attr('x', d => -size(d.value) / 2)
                  .attr('y', -1)
                  .text(d => d.depth === 0 ? '' : d.data.splitLabel)))
            .attr('transform', d => `translate(${d.x},${d.y})`);

        const segments = nodes.selectAll('.segment')
          .data(d => {
            const stack = d3.stack()
                .keys(metadata.labelValues)
                .value((d, key) => d.get(key));

            const counts = showPredictions ?
                d.data.predictionCounts :
                d.data.counts;
  
            const stacked = stack([counts]);

            const mapped = stacked.map(b => {
              const label = b.key;
              const sideLength = size(d.value);
              const pos = b[0];

              y.domain([0, d.value]).range([0, sideLength]);

              const rect = {
                width: sideLength,
                height: y(pos[1]) - y(pos[0]),
                x: -sideLength / 2,
                y: y(pos[0]),
                color: color(label),
                label: label,
                count: counts.get(label),
              };

              if (showPredictions) {
                const predictionResults = d.data.predictionResults.get(label);
                if (predictionResults !== undefined && predictionResults.has('incorrect')) {
                  rect.incorrect = predictionResults.get('incorrect');
                } else {
                  rect.incorrect = 0;
                }
              }

              return rect;
            });

            return mapped;
          })
          .join(enter => enter.append('g')
              .attr('class', 'segment')
              .call(g => g.append('rect')
                  .attr('class', 'class-rect')))
            .attr('transform', d => `translate(${d.x},${d.y})`);

        segments.select('.class-rect')
            .attr('height', d => d.height)
            .attr('width', d => d.width)
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

        const rowLabels = ['Root'].concat(selectedFeatures);
        const labels = root.path(root.leaves()[0])
          .map((d, i) => ({y: d.y, text: rowLabels[i]}));

        g.select('#row-labels')
          .selectAll('.row-label')
          .data(labels)
          .join('text')
            .attr('class', 'row-label')
            .attr('transform', d => `translate(-10,${d.y}) rotate(-90)`)
            .attr('text-anchor', 'end')
            .text(d => d.text);

        const tooltip = g.select('#tooltip');

        nodes.on('mousemove', function() {
          const [x, y] = d3.mouse(g.node());
          const square = d3.select(this);
          const padding = 5;

          tooltip.style('display', null)
              .attr('transform', `translate(${x},${y + padding * 3})`);

          const rect = tooltip.selectAll('rect')
            .data([null])
            .join('rect')
              .style('stroke', 'black')
              .style('fill', 'white');

          const node = square.datum();

          const lines = node.depth === 0 ? ['Root node'] : node.ancestors()
              .reverse()
              .slice(1)
              .map(d => `${d.data.splitFeature} is ${d.data.splitLabel}`);

          lines.push(`${node.value} data points`);

          const text = tooltip.selectAll('text')
            .data([null])
            .join('text');

          text.selectAll('tspan')
            .data(lines)
            .join('tspan')
              .attr('dominant-baseline', 'hanging')
              .attr('x', 0)
              .attr('y', (d, i) => `${i * 1.1}em`)
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
        })
        .on('mouseover', function() {
          const node = d3.select(this).datum();
          const ancestorLinks = node.ancestors().map(d => d.edgeToParent);
          d3.selectAll(ancestorLinks)
              .attr('stroke', 'black')
              .attr('stroke-width', 2);
        })
        .on('mouseout', function() {
          const node = d3.select(this).datum();
          const ancestorLinks = node.ancestors().map(d => d.edgeToParent);
          d3.selectAll(ancestorLinks)
              .attr('stroke', '#d3d3d3')
              .attr('stroke-width', 1);
        });
      }
    });
  }

  chart.size = function([w, h]) {
    if (!arguments.length) return [width, height];
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    return chart;
  }

  chart.showPredictions = function(p) {
    if (!arguments.length) return showPredictions;
    showPredictions = p;
    return chart;
  }

  chart.kind = 'nodelink';

  return chart;
}