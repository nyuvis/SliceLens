/*
 * Node link diagram. 
 *
 * References:
 * https://bost.ocks.org/mike/chart
 * https://observablehq.com/@d3/tidy-tree
 * https://observablehq.com/@d3/line-chart-with-tooltip
 */

function nodelink() {
  let margin = {
    top: 0,
    bottom: 50,
    left: 0,
    right: 0
  };
  
  let width = 800 - margin.left - margin.right;
  let height = 600 - margin.top - margin.bottom;
  
  function chart(selection) {
    selection.each(function({metadata, data}) {
      const nodeHeight = 50;
      const maxNodeWidth = 50;
      const hierarchy = prepareData();
      const {xScale, yScale, color} = getScales();

      const svg = d3.select(this)
        .selectAll('svg')
        .data([hierarchy])
        .join(enter => enter.append('svg')
              .call(s => s.append('g')
                  .attr('id', 'vis-group')
                  .call(g => g.append('g')
                      .attr('id', 'tree')
                    .call(t => t.append('g')
                        .attr('id', 'links'))
                    .call(t => t.append('g')
                        .attr('id', 'nodes'))
                  .call(g => g.append('g')
                      .attr('id', 'tooltip')
                      .attr('pointer-events', 'none')))))
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

      const g = svg.select('#vis-group')
          .attr('transform', `translate(${margin.left},${margin.top})`);
      
      draw();
      
      function prepareData() {
        const hierarchy = d3.hierarchy(data)
            .sum(d => d.value);

        const tree = d3.tree()
            .size([width, height])

        tree(hierarchy);

        return hierarchy;
      }
      
      function getScales() {
        const xScale = d3.scaleLinear()
            .domain([0, hierarchy.value])
            .range([0, maxNodeWidth]);
        
        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, nodeHeight]);

        const color = d3.scaleOrdinal()
            .domain(metadata.labelValues)
            .range(d3.schemeCategory10);
     
        return {xScale, yScale, color};
      }

      function draw() {
        const link = d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y);
        
        const links = g.select('#links')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
          .selectAll('path')
          .data(hierarchy.links())
          .join('path')
            .attr('d', link);

        const nodes = g.select('#nodes')
          .selectAll('g')
          .data(hierarchy.descendants())
          .join('g')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        nodes.selectAll('.segment')
          .data(d => {
            const stack = d3.stack()
                .keys(metadata.labelValues)
                .value((d, key) => d.get(key));
            const stacked = stack([d.data.counts]);
            const mapped = stacked.map(b => ({
              label: b.key,
              pos: [b[0][0] / d.value, b[0][1] / d.value],
              value: d.value,
            }));
            return mapped;
          })
          .join('rect')
            .attr('class', 'segment')
            .attr('x', d => -xScale(d.value) / 2)
            .attr('height', d => yScale(d.pos[1]) - yScale(d.pos[0]))
            .attr('y', d => yScale(d.pos[0]))
            .attr('width', d => xScale(d.value))
            .attr('fill', d => color(d.label));
      }
    });
  }
 
  chart.margin = function(m) {
    if (!arguments.length) return margin;
    margin = m;
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    return chart;
  }
 
  chart.width = function(w) {
    if (!arguments.length) return width;
    width = w - margin.left - margin.right;
    return chart;
  }

  chart.height = function(h) {
    if (!arguments.length) return height;
    height = h - margin.top - margin.bottom;
    return chart;
  }

  return chart;
}
