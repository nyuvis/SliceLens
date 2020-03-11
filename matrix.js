/*
 * Nested matrix.
 *
 * References:
 */

function matrix() {
  let margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  };
  
  let width = 800 - margin.left - margin.right;
  let height = 600 - margin.top - margin.bottom;

  function chart(selection) {
    selection.each(function({metadata, data}) {
      const root = prepareData();
      const {color, size, y} = getScales();

      const svg = d3.select(this)
        .selectAll('svg')
        .data([root])
        .join(enter => enter.append('svg')
              .call(svg => svg.append('g').attr('id', 'vis-group')
                  .call(g => g.append('g').attr('id', 'vis'))
                  .call(g => g.append(() => getCategoryColorLegend(color))
                      .attr('transform', `translate(0,${-margin.top})`))
                  .call(g => g.append('g')
                      .attr('id', 'tooltip')
                      .attr('pointer-events', 'none'))))
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

      const g = svg.select('#vis-group')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      const stack = d3.stack()
          .keys(metadata.labelValues)
          .value((d, key) => d.get(key));

      // TODO: stop clearing before drawing
      g.selectAll('.cell').remove();
      g.selectAll('.node').remove();

      draw(g.select('#vis'), width, height);

      setupTooltips();


      function prepareData() {
        const root = d3.hierarchy(data)
            .sum(d => d.value);

        return root;
      }

     
      function getScales() {
        const color = d3.scaleOrdinal()
            .domain(metadata.labelValues)
            .range(d3.schemeCategory10);

        const size = d3.scaleSqrt()
            .domain([0, d3.max(root.leaves(), d => d.value)])

        const y = d3.scaleLinear();

        return {color, size, y};
      }


      function draw(cell, horizontalSpace, verticalSpace) {
        const node = cell.datum();

        const isEvenLevel = node.depth % 2 === 0;
        
        if (node.depth === root.height) {
          const maxCellSize = Math.min(verticalSpace, horizontalSpace);
          size.range([0, maxCellSize]);

          const stacked = stack([node.data.counts]);
          const sideLength = size(node.value);

          y.domain([0, node.value])
              .range([0, sideLength]);
          
          const mapped = stacked.map(b => {
            const pos = b[0];

            return {
              width: sideLength,
              height: y(pos[1]) - y(pos[0]),
              x: 0,
              y: y(pos[0]),
              color: color(b.key),
            }
          });

          cell.append('g')
              .attr('class', 'node')
            .selectAll('.segment')
            .data(mapped)
            .join('rect')
              .attr('class', 'segment')
              .attr('x', d => d.x)
              .attr('y', d => d.y)
              .attr('width', d => d.width)
              .attr('height', d => d.height)
              .attr('fill', d => d.color);

          return;
        }

        const splitLabels = node.children.map(d => d.data.splitLabel);
        const scale = d3.scaleBand()
            .domain(splitLabels)
            .range([0, isEvenLevel ? horizontalSpace : verticalSpace])
            .padding(0.05);

        let nextHorizontalSpace, nextVerticalSpace;

        if (isEvenLevel) {
          nextHorizontalSpace = scale.bandwidth();
          nextVerticalSpace = verticalSpace;
        } else {
          nextHorizontalSpace = horizontalSpace;
          nextVerticalSpace = scale.bandwidth();
        }

        cell.selectAll('.cell')
          .data(node.children)
          .join('g')
            .attr('class', 'cell')
            .attr('transform', d => {
              const offset = scale(d.data.splitLabel);
              if (isEvenLevel) {
                return `translate(${offset},0)`;
              } else {
                return `translate(0,${offset})`;
              }
            })
            .each(function(d, i, nodes) {
              draw(d3.select(this), nextHorizontalSpace, nextVerticalSpace);
            });
      }


      function setupTooltips() {
        const tooltip = svg.select('#tooltip');

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

          console.log(tooltip);

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
