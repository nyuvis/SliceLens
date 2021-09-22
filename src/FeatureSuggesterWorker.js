import { getFeatureRatings } from './FeatureRatings';

self.onmessage = e => {
  const featureToRelevance = getFeatureRatings(e.data);
  postMessage(featureToRelevance);
}