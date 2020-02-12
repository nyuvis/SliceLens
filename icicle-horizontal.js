function icicleHorizontal({featureData, data, div}) {
  const config = getConfiguration(div);
  const hierarchy = prepareData(data, config);
  const scales = getScales(featureData, hierarchy, config);

  console.log('featureData', featureData);
  console.log('hierarchy', hierarchy);

  addChart(featureData, hierarchy, config, scales);

  
  function getConfiguration(div) {
    const margin = {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
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
        .size([config.height, config.width])
        .padding(2);

    partition(hierarchy);

    return hierarchy;
  }

 
  function getScales(featureData, hierarchy, config) {
    const {svg, width, height, margin} = config;

    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, hierarchy.y1 - hierarchy.y0]);

    const color = d3.scaleOrdinal()
        .domain(featureData.labelValues)
        .range(d3.schemeCategory10);
 
    return {xScale, color};
  }


  function addChart(featureData, hierarchy, config, scales) {
    const {color, xScale} = scales;
    const {svg, width, height, margin} = config;

    const partitions = svg.selectAll('.partition')
      .data(hierarchy.descendants())
      .join('g')
        .attr('class', 'partition')
        .attr('transform', d => `translate(${d.y0},${d.x0})`);

    partitions.selectAll('.segment')
      .data(d => {
        const stack = d3.stack()
            .keys(featureData.labelValues)
            .value((d, key) => d.get(key));
        const stacked = stack([d.data.counts]);
        const mapped = stacked.map(b => ({
          label: b.key,
          pos: [b[0][0] / d.value, b[0][1] / d.value],
          width: d.y1 - d.y0,
          height: d.x1 - d.x0
        }));
        return mapped;
      })
      .join('rect')
        .attr('class', 'segment')
        .attr('width', d => xScale(d.pos[1]) - xScale(d.pos[0]))
        .attr('x', d => xScale(d.pos[0]))
        .attr('height', d => d.height)
        .attr('y', d => 0)
        .attr('fill', d => color(d.label));
  }
}
