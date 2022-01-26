import { getFeatureRatings } from './FeatureRatings';
import {
  entropy,
  errorDeviation,
  errorCount,
  errorPercent,
  random,
} from './RatingMetrics';

const metrics = { entropy, errorDeviation, errorCount, errorPercent, random };

self.onmessage = (e: MessageEvent) => {
  const featureToRelevance = getFeatureRatings(e.data, metrics);
  postMessage(featureToRelevance);
}