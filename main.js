d3.csv('census.csv', d3.autoType).then(data => {
  manager(data);
});


function manager(dataset) {
  const main = d3.select('#main');

  const visualizations = {
    icicle: icicle(),
    nodelink: nodelink(),
    matrix: matrix()
  };
  
  let selectedVis = visualizations.icicle;
  let selectedSplit = 'interval';

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
      
      const equalInterval = d3.bin()
          .value(d => d[val])
          .domain(extent)
          .thresholds(equalIntervalThresholds(extent));
      
      const quantiles = d3.bin()
          .value(d => d[val])
          .domain(extent)
          .thresholds(quantileThresholds(values));

      feature.split = data => {
        if (selectedSplit === 'interval') {
          return equalInterval(data);
        } else {
          return quantiles(data);
        }
      }
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
 

  setUpFeatureSelection();
  setUpVisSelector();
  setUpSplitSelector();
  setUpResizeListener();
  updateDataAndVis();


  function equalIntervalThresholds([min, max]) {
    const binSize = (max - min) / numBins;
    const thresholds = d3.range(1, numBins)
        .map(d => min + d * binSize);
    return thresholds;
  }


  function quantileThresholds(values) {
    return d3.range(1, numBins)
        .map(d => d3.quantile(values, d / numBins));
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
      updateDataAndVis();

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
          selectedVis = visualizations[this.value];
          main.node().innerHTML = '';
          updateVisOnly();
        });

    select.node().value = 'icicle';
  }


  function setUpSplitSelector() {
    const select = d3.select('#split-select')
        .on('change', function() {
          selectedSplit = this.value;
          updateDataAndVis();
        });

    select.node().value = selectedSplit;
  }


  function setUpResizeListener() {
    window.addEventListener('resize', updateVisOnly);
  }


  function getSplitData() {
    return splitData(dataset, 0, '', '');
      
    function splitData(data, index, splitFeature, splitLabel) {
      const counts = d3.rollup(data, v => v.length, d => d.label);

      const node = {counts, splitFeature, splitLabel};

      if (index < metadata.selected.length) {
        const nextFeatureName = metadata.selected[index];
        const nextFeature = metadata.features[nextFeatureName];
        const splits = nextFeature.split(data);

        node.children = splits
            .map((d, i) => splitData(d, index + 1, nextFeatureName, nextFeature.values[i]))
            .filter(d => d !== undefined);
      } else {
        node.value = data.length;
      }

      return node;
    }
  }


  function updateDataAndVis() {
    const data = {
      metadata: metadata,
      data: getSplitData(dataset),
    };

    const divWidth = main.node().clientWidth;
    const divHeight = main.node().clientHeight;

    selectedVis.size([divWidth, divHeight]);
 
    main.datum(data).call(selectedVis);
  }


  function updateVisOnly() {
    const divWidth = main.node().clientWidth;
    const divHeight = main.node().clientHeight;

    selectedVis.size([divWidth, divHeight]);

    main.call(selectedVis);
  }
}
