import { getFeatureRatings } from './FeatureRatings';
import { metrics } from './RatingMetrics';
import type { MetricName } from './RatingMetrics';
import type { Dataset, Features } from './types';

self.onmessage = (e: MessageEvent) => {
  const criterion: MetricName = e.data.criterion;
  const selected: string[] = e.data.selected;
  const features: Features = e.data.features;
  const dataset: Dataset = e.data.dataset;
  const minSubsetSize: number = e.data.minSubsetSize;

  const ratings = getFeatureRatings(criterion, metrics, selected, features, dataset, minSubsetSize);

  postMessage(ratings);
}