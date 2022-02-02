import { getFeatureRatings } from './FeatureRatings';
import { metrics } from './RatingMetrics';

self.onmessage = (e: MessageEvent) => {
  const featureToRelevance = getFeatureRatings(e.data, metrics);
  postMessage(featureToRelevance);
}