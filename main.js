d3.csv('census.csv', d3.autoType).then(data => {
  const features = data.columns;
  const label = features.pop();
  const labelValues = Array.from(new Set(data.map(d => d[label])));

  const numBins = 3;

  const bins = features.reduce((acc, val) => {
    const extent = d3.extent(data.map(d => d[val]));

    acc[val] = d3.bin()
        .value(d => d[val])
        .domain(extent)
        .thresholds(thresholds(extent, numBins))

    return acc;
  }, {});

  const featureData = {
    'features': features,
    'label': label,
    'labelValues': labelValues,
    'bins': bins,
    'numBins': numBins,
    'selected': []
  }

  setUp(featureData, data);
  createVis(featureData, getData(featureData, data));
});


function thresholds(extent, numBins) {
  const [min, max] = extent;
  const binSize = (max - min) / numBins;
  const thresholds = d3.range(1, numBins)
      .map(d => min + d * binSize);
  return thresholds;
}


function setUp(featureData, data) {
  d3.select('#all')
    .selectAll('.feature')
    .data(featureData.features)
    .join('div')
      .attr('class', 'feature')
      .call(div => div.append('input')
            .datum(d => d)
            .attr('type', 'checkbox')
            .attr('id', d => `${d}-all`)
            .on('change', onSelectionChange(featureData, data)))
      .call(div => div.append('label')
            .attr('for', d => `${d}-all`)
            .text(d => d));
}


function onSelectionChange(featureData, data) {
  return function() {
    const isChecked = this.checked;
    const feature = d3.select(this).datum();

    const selectedFeatures = d3.select('#selected')
      .selectAll('.feature')
      .data();

    if (isChecked) {
      selectedFeatures.push(feature);
    } else {
      const index = selectedFeatures.indexOf(feature);

      if (index !== -1) {
        selectedFeatures.splice(index, 1);
      }
    }

    featureData.selected = selectedFeatures;

    updateSelectedFeatures(featureData, data);
  }
}


function updateSelectedFeatures(featureData, data) {
  d3.select('#selected')
    .selectAll('.feature')
    .data(featureData.selected, d => d)
    .join('div')
      .attr('class', 'feature')
      .text(d => d);

  const visData = getData(featureData, data);
  createVis(featureData, visData);
}


function getData(featureData, data) {
  const visData = splitData(featureData, 0, data, "", 0);
  return visData;
}


function splitData(featureData, index, data, splitFeature, bin) {
  const counts = d3.rollup(data, v => v.length, d => d.label);
 
  const extent = [data.x0, data.x1];

  const node = {counts, extent, splitFeature, bin};
  
  if (index < featureData.selected.length) {
    const nextFeature = featureData.selected[index];
    const bins = featureData.bins[nextFeature](data);

    node.children = bins.map((d, i) => splitData(featureData, index + 1, d, nextFeature, i))
      .filter(d => d !== undefined);
  } else {
    node.value = data.length;
  }
 
  return node;
}


function createVis(featureData, visData) {
  const main = d3.select('#main');
  main.node().innerHTML = '';
 
  icicleVertical({featureData: featureData, data: visData, div: main});
  //nodeLink({featureData: featureData, data: visData, div: main});
}
