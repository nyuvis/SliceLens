/*
 * Node link diagram. 
 *
 * References:
 * https://bost.ocks.org/mike/chart
 * https://observablehq.com/@d3/tidy-tree
 * https://observablehq.com/@d3/line-chart-with-tooltip
 * https://observablehq.com/@d3/hierarchical-edge-bundling
 */

function nodelink() {
  let margin = {
    top: 50,
    bottom: 100,
    left: 25,
    right: 0
  };
  
  let width = 800 - margin.left - margin.right;
  let height = 600 - margin.top - margin.bottom;
  
  function chart(selection) {
    selection.each(function({metadata, data}) {
      const maxNodeSize = 50;
      const root = prepareData();
      const {size, y, color} = getScales();

      const svg = d3.select(this)
        .selectAll('svg')
        .data([root])
        .join(enter => enter.append('svg')
              .call(svg => svg.append('g').attr('id', 'vis-group')
                  .call(g => g.append('g').attr('id', 'tree')
                    .call(tree => tree.append('g').attr('id', 'links'))
                    .call(tree => tree.append('g').attr('id', 'nodes')))
                  .call(g => g.append('g').attr('id', 'labels'))
                  .call(g => g.append(() => getCategoryColorLegend(color))
                      .attr('transform', `translate(0,${-margin.top})`))
                  .call(g => g.append('g')
                      .attr('id', 'tooltip')
                      .attr('pointer-events', 'none'))))
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

      const g = svg.select('#vis-group')
          .attr('transform', `translate(${margin.left},${margin.top})`);
      
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

        const color = d3.scaleOrdinal()
            .domain(metadata.labelValues)
            .range(d3.schemeCategory10);
     
        return {size, y, color};
      }

      function draw() {
        const link = d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y);
        
        const links = g.select('#links')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#d3d3d3')
            .attr('stroke-width', 1)
          .selectAll('path')
          .data(root.links())
          .join('path')
            .attr('d', link)
            .each(function(d) { d.target.edgeToParent = this; });

        const nodes = g.select('#nodes')
          .selectAll('g')
          .data(root.descendants())
          .join('g')
            .attr('transform', d => `translate(${d.x},${d.y})`)
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

        nodes.selectAll('.segment')
          .data(d => {
            const stack = d3.stack()
                .keys(metadata.labelValues)
                .value((d, key) => d.get(key));

            const stacked = stack([d.data.counts]);

            const mapped = stacked.map(b => {
              const sideLength = size(d.value);
              const pos = b[0];

              y.domain([0, d.value]).range([0, sideLength]);

              return {
                width: sideLength,
                height: y(pos[1]) - y(pos[0]),
                x: -sideLength / 2,
                y: y(pos[0]),
                color: color(b.key),
              }
            });

            return mapped;
          })
          .join('rect')
            .attr('class', 'segment')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('fill', d => d.color);

        const rowLabels = ['Root'].concat(metadata.selected);
        const labels = root.path(root.leaves()[0])
          .map((d, i) => ({y: d.y, text: rowLabels[i]}));

        g.select('#labels')
          .selectAll('text')
          .data(labels)
          .join('text')
            .attr('class', 'rowLabel')
            .attr('transform', d => `translate(-10,${d.y}) rotate(-90)`)
            .attr('text-anchor', 'end')
            .text(d => d.text);

        const tooltip = svg.select('#tooltip');

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
              .map(d => `${d.data.splitFeature} is ${metadata.verb[d.data.bin]}`);

          lines.push(`${node.value} data points`);

          const text = tooltip.selectAll('text')
            .data([null])
            .join('text')
              .attr('dominant-baseline', 'hanging');

          text.selectAll('tspan')
            .data(lines)
            .join('tspan')
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
        });
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
