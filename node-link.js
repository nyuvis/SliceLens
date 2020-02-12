function nodeLink({featureData, data, div}) {
  const config = getConfiguration(div);
  const hierarchy = prepareData(data, config);
  const scales = getScales(featureData, hierarchy, config);

  console.log('featureData', featureData);
  console.log('hierarchy', hierarchy);

  addChart(featureData, hierarchy, config, scales);

  
  function getConfiguration(div) {
    const margin = {
      top: 0,
      bottom: 50,
      left: 0,
      right: 0
    };

    const width = div.node().clientWidth - margin.left - margin.right;
    const height = div.node().clientHeight - margin.top - margin.bottom;

    const svg = div.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('class', 'visContainer')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const nodeHeight = 50;
    const maxNodeWidth = 50;

    return {svg, width, height, margin, nodeHeight, maxNodeWidth};
  }


  function prepareData(data, config) {
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value);

    const tree = d3.tree()
        .size([config.width, config.height])

    tree(hierarchy);

    return hierarchy;
  }

 
  function getScales(featureData, hierarchy, config) {
    const {nodeHeight, maxNodeWidth} = config;

    const xScale = d3.scaleLinear()
        .domain([0, hierarchy.value])
        .range([0, maxNodeWidth]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, nodeHeight]);

    const color = d3.scaleOrdinal()
        .domain(featureData.labelValues)
        .range(d3.schemeCategory10);
 
    return {xScale, yScale, color};
  }


  function addChart(featureData, hierarchy, config, scales) {
    // https://observablehq.com/@d3/tidy-tree
    const {color, xScale, yScale} = scales;
    const {svg, width, height, margin, nodeHeight, maxNodeWidth} = config;

    const g = svg.append('g');

    const link = d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y);
    
    const links = g.append('g')
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
      .selectAll('path')
      .data(hierarchy.links())
      .join('path')
        .attr('d', link);

    const nodes = g.append('g')
      .selectAll('g')
      .data(hierarchy.descendants())
      .join('g')
        .attr('transform', d => `translate(${d.x},${d.y})`);

    nodes.selectAll('.segment')
      .data(d => {
        const stack = d3.stack()
            .keys(featureData.labelValues)
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
}
