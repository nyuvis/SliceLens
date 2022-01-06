import { getFeatureRatings } from './FeatureRatings';

self.onmessage = (e: MessageEvent) => {
  const featureToRelevance = getFeatureRatings(e.data);
  postMessage(featureToRelevance);
}