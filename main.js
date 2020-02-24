d3.csv('census.csv', d3.autoType).then(data => {
  manager(data);
});


function manager(dataset) {
  const main = d3.select('#main');

  const featureNames = dataset.columns;
  const label = featureNames.pop();
  const labelValues = Array.from(new Set(dataset.map(d => d[label])));

  const numBins = 3;
  const verbs = ['low', 'medium', 'high'];

  const features = featureNames.reduce((acc, val) => {
    const values = dataset.map(d => d[val]);
    const feature = {
      name: val
    };

    if (!isNaN(values[0])) {
      feature.type = 'Q';
      feature.values = verbs;
      const extent = d3.extent(values);
      feature.split = d3.bin()
          .value(d => d[val])
          .domain(extent)
          .thresholds(thresholds(extent));
    } else if (values[0] instanceof Date) {
      feature.type = 'T';
    } else {
      feature.values = Array.from(new Set(values));
      feature.type = 'C';
      feature.split = data => {
        return d3.groups(data, d => d[val]).map(d => d[1]);
      }
    }

    acc[val] = feature;

    return acc;
  }, {});

  const metadata = {
    'features': features,
    'label': label,
    'labelValues': labelValues,
    'selected': [],
  }
 
  let selectedVis = 'icicle';

  setUpFeatureSelection();
  setUpVisSelector();
  updateVis();


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
      .data(Object.keys(metadata.features))
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
      updateVis();

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
    const select = d3.select('#vis-select')
        .on('change', function() {
          selectedVis = this.value;
          main.node().innerHTML = '';
          updateVis();
        });

    select.node().value = selectedVis;
  }


  function getSplitData() {
    return splitData(dataset, 0, '', '');
      
    function splitData(data, index, splitFeature, splitLabel) {
      const counts = d3.rollup(data, v => v.length, d => d.label);

      // const extent = [data.x0, data.x1];

      const node = {counts, splitFeature, splitLabel};

      if (index < metadata.selected.length) {
        const nextFeatureName = metadata.selected[index];
        const nextFeature = metadata.features[nextFeatureName];
        const splits = nextFeature.split(data);

        node.children = splits.map((d, i) => {
          return splitData(d, index + 1, nextFeatureName, nextFeature.values[i]);
        })
            .filter(d => d !== undefined);
      } else {
        node.value = data.length;
      }

      return node;
    }
  }


  function updateVis() {
    const data = {
      metadata: metadata,
      data: getSplitData(dataset),
    };

    let iciclePlot = icicle()
      .width(main.node().clientWidth)
      .height(main.node().clientHeight);

    let nodelinkPlot = nodelink()
      .width(main.node().clientWidth)
      .height(main.node().clientHeight);

    if (selectedVis === 'icicle') {
      main.datum(data)
          .call(iciclePlot);
    } else {
      main.datum(data)
          .call(nodelinkPlot);
    }
  }
}
