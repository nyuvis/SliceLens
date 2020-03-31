import * as d3 from "d3";

export { getCategoryColorLegend };

function getCategoryColorLegend(colorScale) {
  const size = 10;
 
  const legend = d3.create('svg:g');

  const rows = legend
    .selectAll('g')
    .data(colorScale.domain())
    .join('g')
      .attr('transform', (d, i) => `translate(0, ${i * size * 1.5})`);

  rows.append('rect')
      .attr('height', size)
      .attr('width', size)
      .attr('fill', d => colorScale(d));

  rows.append('text')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('dominant-baseline', 'hanging')
      .attr('x', size * 1.5)
      .text(d => d);

  return legend.node();
}
