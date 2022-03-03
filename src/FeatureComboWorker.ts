import { metrics } from './RatingMetrics';
import type { MetricName } from './RatingMetrics';
import type { Dataset, Features } from './types';
import { getFeatureCombinations } from './FeatureCombos';

self.onmessage = (e: MessageEvent) => {
  const criterion: MetricName = e.data.criterion;
  const selected: string[] = e.data.selected;
  const features: Features = e.data.features;
  const dataset: Dataset = e.data.dataset;

  const suggestions: string[][] = getFeatureCombinations(criterion, metrics, selected, features, dataset);

  postMessage(suggestions);
}