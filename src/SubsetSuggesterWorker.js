import { getRecommendedSubsets } from './SubsetRecommender';

self.onmessage = e => {
  const recommendedSubsets = getRecommendedSubsets(e.data);
  postMessage(recommendedSubsets);
}