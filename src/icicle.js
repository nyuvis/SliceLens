/*
 * Icicle plot.
 *
 * References:
 * https://bost.ocks.org/mike/chart
 * https://observablehq.com/@d3/icicle
 * https://observablehq.com/@d3/zoomable-icicle
 * https://observablehq.com/@d3/line-chart-with-tooltip
 */

import * as d3_array from "d3-array";
import * as d3_all from "d3";

const d3 = {...d3_array, ...d3_all};

import { getCategoryColorLegend } from './util.js';

export { icicle as default };

function icicle() {
  let margin = {
    top: 50,
    bottom: 20,
    left: 100,
    right: 100
  };
  
  let width = 800 - margin.left - margin.right;
  let height = 600 - margin.top - margin.bottom;

  function chart(selection) {
    selection.each(function({metadata, data, selectedFeatures}) {
      const root = prepareData();
      const {yScale, color} = getScales();

      const g = d3.select(this)
        .selectAll('#vis-group')
        .data([root])
        .join(enter => enter.append('g')
            .attr('id', 'vis-group')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .call(g => g.append('g').attr('id', 'tree'))
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

        const partition = d3.partition()
            .size([width, height])
            .padding(2);

        partition(root);

        return root;
      }

     
      function getScales() {
        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, root.y1 - root.y0]);

        const color = d3.scaleOrdinal()
            .domain(metadata.labelValues)
            .range(d3.schemeCategory10);
     
        return {yScale, color};
      }


      function draw() {
        const partitions = g.select('#tree')
          .selectAll('.partition')
          .data(root.descendants())
          .join(enter => enter.append('g')
              .call(g => g.append('rect')
                    .attr('class', 'border-rect')
                    .attr('fill', 'none')
                    .attr('stroke', 'none')))
            .attr('class', 'partition')
            .attr('transform', d => `translate(${d.x0},${d.y0})`)
            .each(function(d) {
              d.border = d3.select(this)
                .select('.border-rect')
                .node();
            });

        partitions.selectAll('.border-rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0);

        partitions.selectAll('.segment')
          .data(d => {
            const stack = d3.stack()
                .keys(metadata.labelValues)
                .value((d, key) => d.get(key));
            const stacked = stack([d.data.counts]);
            const mapped = stacked.map(b => ({
              label: b.key,
              pos: [b[0][0] / d.value, b[0][1] / d.value],
              width: d.x1 - d.x0,
              height: d.y1 - d.y0
            }));
            return mapped;
          })
          .join('rect')
            .attr('class', 'segment')
            .attr('height', d => yScale(d.pos[1]) - yScale(d.pos[0]))
            .attr('y', d => yScale(d.pos[0]))
            .attr('width', d => d.width)
            .attr('fill', d => color(d.label));

        const rowHeight = partitions.datum().y1 - partitions.datum().y0;
        const rowLabels = ['Root'].concat(selectedFeatures);

        g.select('#row-labels')
          .selectAll('.row-label')
          .data(rowLabels)
          .join('text')
            .attr('class', 'row-label')
            .attr('transform', (d, i) => `translate(-10,${i * (rowHeight + 4)}) rotate(-90)`)
            .attr('text-anchor', 'end')
            .text(d => d);

        const tooltip = g.select('#tooltip');

        partitions.on('mousemove', function() {
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

          const lines = node.depth === 0 ? ["Root node"] : node.ancestors()
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
          const borders = node.ancestors().map(d => d.border);
          d3.selectAll(borders)
              .attr('stroke', 'black')
              .attr('stroke-width', 4);
        })
        .on('mouseout', function() {
          const node = d3.select(this).datum();
          const borders = node.ancestors().map(d => d.border);
          d3.selectAll(borders)
              .attr('stroke', 'none');
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

  chart.kind = 'icicle';

  return chart;
}
