import * as d3 from "d3";

export { getCategoryColorLegend };

function getCategoryColorLegend(colorScale) {
  const size = 14;

  const legend = d3.create('svg:g');

  const rows = legend
    .selectAll('g')
    .data(colorScale.domain())
    .join('g')
      .attr('transform', (d, i) => `translate(0, ${i * size * 1.2})`);

  rows.append('rect')
      .attr('height', size)
      .attr('width', size)
      .attr('fill', d => colorScale(d));

  rows.append('text')
      .attr('font-size', `${size}px`)
      .attr('dominant-baseline', 'middle')
      .attr('x', size * 1.2)
      .attr('y', size / 2 + 2)
      .text(d => d);

  return legend.node();
}
