import { getFeatureRatings } from './FeatureRatings';
import {
  entropy,
  errorDeviation,
  errorCount,
  errorPercent
} from './RatingMetrics';

const metrics = { entropy, errorDeviation, errorCount, errorPercent };

self.onmessage = (e: MessageEvent) => {
  const featureToRelevance = getFeatureRatings(e.data, metrics);
  postMessage(featureToRelevance);
}