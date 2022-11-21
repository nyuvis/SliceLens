<script lang="ts">
  import { dataset, selectedFeatures, showPredictions, showSize, visKind } from "../../../stores";
  import { onMount } from 'svelte';
  import * as d3 from "d3";
  import type { CategoricalFeature, QuantitativeFeature } from "../../../types";
  import ScatterPlot from "./ScatterPlot.svelte";
  import ScatterBinnedRectRegression from "./ScatterBinnedRectRegression.svelte";
  import ScatterBinnedRectClassification from "./ScatterBinnedRectClassification.svelte";
  import ScatterBinnedCircleRegression from "./ScatterBinnedCircleRegression.svelte";
  import ScatterBinnedCircleClassification from "./ScatterBinnedCircleClassification.svelte";
  import GroupedBarChart from "./GroupedBarChart.svelte";
  import StackedBarChart from "./StackedBarChart.svelte";
  import StripPlot from "./StripPlot.svelte";
  import StripPlotMultiplesHorizontal from "./StripPlotMultiplesHorizontal.svelte";
  import StripPlotMultiplesVertical from "./StripPlotMultiplesVertical.svelte";
  import BoxPlots from "./BoxPlots.svelte";
  import ViolinPlots from "./ViolinPlots.svelte";
  import StackedHistogram from "./StackedHistogram.svelte";

  let div: HTMLDivElement;

  $: console.log('visKind', $visKind);

  // size of the div that the matrix is in
  let width: number = 600;
  let height: number = 600;

  // bounding box of the div
  let divBoundingBox = { left: 0, right: 0, top: 0, bottom: 0 };

  // window resizing

  // without the delay, the div will occasionally not be at full height yet
  onMount(() => setTimeout(resize, 200));

  function resize() {
    const rect = div.getBoundingClientRect();
    divBoundingBox = { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left };
    console.log(`width = ${rect.width}, height = ${rect.height}`);
    ({ width, height } = rect);
  }

  $: quantitativeFeatures = $selectedFeatures
    .map(name => $dataset.features[name])
    .filter((feat): feat is QuantitativeFeature => feat.type === 'Q');

  $: categoricalFeatures = $selectedFeatures
    .map(name => $dataset.features[name])
    .filter((feat): feat is CategoricalFeature => feat.type === 'C');
</script>

<svelte:window on:resize={resize}/>

<div id="chart" bind:this={div}>
  {#if $selectedFeatures.length > 0}
    {#if $visKind === 'c01-grouped' && $dataset.type === 'classification'}
      <GroupedBarChart
        width={width}
        height={height}
        xDomain={categoricalFeatures[0].categories}
        xCol={categoricalFeatures[0].name}
        color={$dataset.color}
        labelValues={$dataset.labelValues}
      />
    {:else if $visKind === 'c01-stacked' && $dataset.type === 'classification'}
      <StackedBarChart
        width={width}
        height={height}
        xDomain={categoricalFeatures[0].categories}
        xCol={categoricalFeatures[0].name}
        color={$dataset.color}
        labelValues={$dataset.labelValues}
      />
    {:else if $visKind === 'c01-square'}
      <div>Not implemented</div>
    {:else if $visKind === 'c10-strip'}
      <StripPlot
        width={width}
        height={height}
        xDomain={quantitativeFeatures[0].extent}
        xCol={quantitativeFeatures[0].name}
      />
    {:else if $visKind === 'c10-histogram' && $dataset.type === 'classification'}
      <StackedHistogram
        width={width}
        height={height}
        xDomain={quantitativeFeatures[0].extent}
        xCol={quantitativeFeatures[0].name}
        color={$dataset.color}
        labelValues={$dataset.labelValues}
      />
    {:else if $visKind === 'c11-strip-horizontal'}
      <StripPlotMultiplesHorizontal
        width={width}
        height={height}
        xDomain={quantitativeFeatures[0].extent}
        yDomain={categoricalFeatures[0].values}
        yValueToGroup={categoricalFeatures[0].valueToGroup}
        xCol={quantitativeFeatures[0].name}
        yCol={categoricalFeatures[0].name}
      />
    {:else if $visKind === 'c11-strip-vertical'}
      <StripPlotMultiplesVertical
        width={width}
        height={height}
        yDomain={quantitativeFeatures[0].extent}
        xDomain={categoricalFeatures[0].values}
        xValueToGroup={categoricalFeatures[0].valueToGroup}
        yCol={quantitativeFeatures[0].name}
        xCol={categoricalFeatures[0].name}
      />
    {:else if $visKind === 'c02-square'}
      <div>Not implemented</div>
    {:else if $visKind === 'c02-grouped-stacked'}
      <div>Not implemented</div>
    {:else if $visKind === 'c20-scatter'}
      <ScatterPlot
        width={width}
        height={height}
        xDomain={quantitativeFeatures[0].extent}
        yDomain={quantitativeFeatures[1].extent}
        xCol={quantitativeFeatures[0].name}
        yCol={quantitativeFeatures[1].name}
      />
    {:else if $visKind === 'c20-scatter-binned-rect'}
      <ScatterBinnedRectClassification
        width={width}
        height={height}
        xDomain={quantitativeFeatures[0].extent}
        yDomain={quantitativeFeatures[1].extent}
        xCol={quantitativeFeatures[0].name}
        yCol={quantitativeFeatures[1].name}
      />
    {:else if $visKind === 'c20-scatter-binned-circle' && $dataset.type === 'classification'}
      <ScatterBinnedCircleClassification
        width={Math.min(width, height)}
        height={Math.min(width, height)}
        xDomain={quantitativeFeatures[0].extent}
        yDomain={quantitativeFeatures[1].extent}
        xCol={quantitativeFeatures[0].name}
        yCol={quantitativeFeatures[1].name}
        color={$dataset.color}
      />
    {:else if $visKind === 'c12-strip-mult'}
      <div>Not implemented</div>
    {:else if $visKind === 'c12-scatter-mult'}
      <div>Not implemented</div>
    {:else if $visKind === 'c30-scatter-size'}
      <div>Not implemented</div>
    {:else if $visKind === 'c30-scatter-opacity'}
      <div>Not implemented</div>
    {:else if $visKind === 'c03-square'}
      <div>Not implemented</div>
    {:else if $visKind === 'r01-histograms'}
      <div>Not implemented</div>
    {:else if $visKind === 'r01-strip-horizontal' && $dataset.type === 'regression'}
      <StripPlotMultiplesHorizontal
        width={width}
        height={height}
        xDomain={$dataset.labelExtent}
        yDomain={categoricalFeatures[0].values}
        yValueToGroup={categoricalFeatures[0].valueToGroup}
        xCol="label"
        yCol={categoricalFeatures[0].name}
      />
    {:else if $visKind === 'r01-strip-vertical' && $dataset.type === 'regression'}
      <StripPlotMultiplesVertical
        width={width}
        height={height}
        yDomain={$dataset.labelExtent}
        xDomain={categoricalFeatures[0].values}
        xValueToGroup={categoricalFeatures[0].valueToGroup}
        yCol="label"
        xCol={categoricalFeatures[0].name}
      />
    {:else if $visKind === 'r01-stacked'}
      <div>Not implemented</div>
    {:else if $visKind === 'r01-box' && $dataset.type === 'regression'}
      <BoxPlots
        width={width}
        height={height}
        xDomain={categoricalFeatures[0].values}
        yDomain={$dataset.labelExtent}
        xCol={categoricalFeatures[0].name}
      />
    {:else if $visKind === 'r01-violin' && $dataset.type === 'regression'}
      <ViolinPlots
        width={width}
        height={height}
        xDomain={categoricalFeatures[0].values}
        yDomain={$dataset.labelExtent}
        xCol={categoricalFeatures[0].name}
        color={$dataset.color}
      />
    {:else if $visKind === 'r10-strip'}
      <StripPlot
        width={width}
        height={height}
        xDomain={quantitativeFeatures[0].extent}
        xCol={quantitativeFeatures[0].name}
      />
    {:else if $visKind === 'r10-scatter' && $dataset.type === 'regression'}
      <ScatterPlot
        width={width}
        height={height}
        xDomain={quantitativeFeatures[0].extent}
        yDomain={$dataset.labelExtent}
        xCol={quantitativeFeatures[0].name}
        yCol='label'
      />
    {:else if $visKind === 'r11-strip'}
      <div>Not implemented</div>
    {:else if $visKind === 'r02-square'}
      <div>Not implemented</div>
    {:else if $visKind === 'r02-grouped-stacked'}
      <div>Not implemented</div>
    {:else if $visKind === 'r02-hist-mult'}
      <div>Not implemented</div>
    {:else if $visKind === 'r02-strip-mult'}
      <div>Not implemented</div>
    {:else if $visKind === 'r20-scatter'}
      <ScatterPlot
        {width}
        {height}
        xDomain={quantitativeFeatures[0].extent}
        yDomain={quantitativeFeatures[1].extent}
        xCol={quantitativeFeatures[0].name}
        yCol={quantitativeFeatures[1].name}
      />
    {:else if $visKind === 'r20-scatter-binned-rect'}
      <ScatterBinnedRectRegression
        {width}
        {height}
        xDomain={quantitativeFeatures[0].extent}
        yDomain={quantitativeFeatures[1].extent}
        xCol={quantitativeFeatures[0].name}
        yCol={quantitativeFeatures[1].name}
      />
    {:else if $visKind === 'r20-scatter-binned-circle'}
      <ScatterBinnedCircleRegression
        width={Math.min(width, height)}
        height={Math.min(width, height)}
        xDomain={quantitativeFeatures[0].extent}
        yDomain={quantitativeFeatures[1].extent}
        xCol={quantitativeFeatures[0].name}
        yCol={quantitativeFeatures[1].name}
      />
    {:else if $visKind === 'r12-strip-mult'}
      <div>Not implemented</div>
    {:else if $visKind === 'r12-scatter-mult'}
      <div>Not implemented</div>
    {:else if $visKind === 'r30-scatter-size'}
      <div>Not implemented</div>
    {:else if $visKind === 'r03-square'}
      <div>Not implemented</div>
    {:else if $visKind === 'r03-hist-mult'}
      <div>Not implemented</div>
    {:else if $visKind === 'r03-strip-mult'}
      <div>Not implemented</div>
    {:else}
      <div>Not implemented</div>
    {/if}
  {:else}
    <div>No features selected</div>
  {/if}
</div>

<style>
  #chart {
    flex: 1;
  }
</style>
