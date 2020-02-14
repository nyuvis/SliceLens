function manager(dataset) {
  const features = dataset.columns;
  const label = features.pop();
  const labelValues = Array.from(new Set(dataset.map(d => d[label])));

  const numBins = 3;

  const bins = features.reduce((acc, val) => {
    const extent = d3.extent(dataset.map(d => d[val]));

    acc[val] = d3.bin()
        .value(d => d[val])
        .domain(extent)
        .thresholds(thresholds(extent))

    return acc;
  }, {});

  const metadata = {
    'features': features,
    'label': label,
    'labelValues': labelValues,
    'bins': bins,
    'numBins': numBins,
    'selected': []
  }
 
  let visType = 'icicle';

  setUpFeatureSelection();
  setUpVisSelector();
  createVis();


  function thresholds(extent) {
    const [min, max] = extent;
    const binSize = (max - min) / numBins;
    const thresholds = d3.range(1, numBins)
        .map(d => min + d * binSize);
    return thresholds;
  }


  function setUpFeatureSelection() {
    d3.select('#all')
      .selectAll('.feature')
      .data(metadata.features)
      .join('div')
        .attr('class', 'feature')
        .call(div => div.append('input')
              .datum(d => d)
              .attr('type', 'checkbox')
              .attr('id', d => `${d}-all`)
              .on('change', onFeatureSelectionChange))
        .call(div => div.append('label')
              .attr('for', d => `${d}-all`)
              .text(d => d));
    
    function onFeatureSelectionChange() {
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

      metadata.selected = selectedFeatures;

      updateSelectedFeaturesList();
      createVis();

      function updateSelectedFeaturesList() {
        d3.select('#selected')
          .selectAll('.feature')
          .data(metadata.selected, d => d)
          .join('div')
            .attr('class', 'feature')
            .text(d => d);
      }
    }
  }


  function setUpVisSelector() {
    d3.select('#vis-select')
        .on('change', function() {
          visType = this.value;
          createVis();
        });
  }


  function getSplitData() {
    return splitData(dataset, 0, "", 0);
      
    function splitData(data, index, splitFeature, bin) {
      const counts = d3.rollup(data, v => v.length, d => d.label);

      const extent = [data.x0, data.x1];

      const node = {counts, extent, splitFeature, bin};

      if (index < metadata.selected.length) {
        const nextFeature = metadata.selected[index];
        const bins = metadata.bins[nextFeature](data);

        node.children = bins.map((d, i) => splitData(d, index + 1, nextFeature, i))
          .filter(d => d !== undefined);
      } else {
        node.value = data.length;
      }

      return node;
    }
  }


  function createVis(visData) {
    const main = d3.select('#main');
    main.node().innerHTML = '';
   
    const config = {
      metadata: metadata,
      data: getSplitData(dataset),
      div: main
    };

    if (visType === 'icicle') {
      icicleVertical(config);
    } else {
      nodeLink(config);
    }
  }
}


d3.csv('census.csv', d3.autoType).then(data => {
  manager(data);
});

