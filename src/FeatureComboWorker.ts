import { getFeatureRatings } from './FeatureRatings';
import { metrics } from './RatingMetrics';

self.onmessage = (e: MessageEvent) => {
  postMessage(e.data.dataset.featureNames.map(d => [d]));
}