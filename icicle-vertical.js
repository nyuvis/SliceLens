function icicleVertical({metadata, data, div}) {
  const config = getConfiguration(div);
  const hierarchy = prepareData(data, config);
  const scales = getScales(metadata, hierarchy, config);

  console.log('metadata', metadata);
  console.log('hierarchy', hierarchy);

  addChart(metadata, hierarchy, config, scales);

  
  function getConfiguration(div) {
    const margin = {
      top: 20,
      bottom: 20,
      left: 100,
      right: 100
    };

    const width = div.node().clientWidth - margin.left - margin.right;
    const height = div.node().clientHeight - margin.top - margin.bottom;

    const svg = div.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('class', 'visContainer')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    return {svg, width, height, margin};
  }


  function prepareData(data, config) {
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value);

    const partition = d3.partition()
        .size([config.width, config.height])
        .padding(2);

    partition(hierarchy);

    return hierarchy;
  }

 
  function getScales(metadata, hierarchy, config) {
    const {svg, width, height, margin} = config;

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, hierarchy.y1 - hierarchy.y0]);

    const color = d3.scaleOrdinal()
        .domain(metadata.labelValues)
        .range(d3.schemeCategory10);
 
    return {yScale, color};
  }


  function addChart(metadata, hierarchy, config, scales) {
    const {color, yScale} = scales;
    const {svg, width, height, margin} = config;

    const partitions = svg.selectAll('.partition')
      .data(hierarchy.descendants())
      .join('g')
        .attr('class', 'partition')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

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
    const rowLabels = ['Root'].concat(metadata.selected);

    svg.selectAll('.rowLabel')
      .data(rowLabels)
      .join('text')
        .attr('class', 'rowLabel')
        .attr('transform', (d, i) => `translate(-10,${i * (rowHeight + 4)}) rotate(-90)`)
        .attr('text-anchor', 'end')
        .text(d => d);

    // https://observablehq.com/@d3/line-chart-with-tooltip

    const tooltip = svg.append("g")
        .attr('pointer-events', 'none');
    
    partitions.on('mousemove', function() {
      const [x, y] = d3.mouse(svg.node());
      const cell = d3.select(this);
      const padding = 10;
      
      tooltip.style('display', null)
          .attr('transform', `translate(${x},${y + padding * 3})`);

      const rect = tooltip.selectAll('rect')
        .data([null])
        .join('rect')
          .style('stroke', 'black')
          .style('fill', 'white');

      const english = ['low', 'medium', 'high'];
      
      const node = cell.datum();

      const lines = node.depth === 0 ? ["Root Node"] : node.ancestors()
          .reverse()
          .slice(1)
          .map(d => `${d.data.splitFeature} is ${english[d.data.bin]}`);

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

      const {x: boxX, y: boxY, width: boxWidth, height: boxHeight} = text.node().getBBox();
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
}
