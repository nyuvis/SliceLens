import { getRecommendedSubsets, timeSubsets, topSubsets, randomSubsets, bestTwos, worstTwos } from './SubsetRecommender';

self.onmessage = e => {
  const recommendedSubsets = getRecommendedSubsets(e.data);
  // const recommendedSubsets = randomSubsets(e.data);
  // const recommendedSubsets = timeSubsets(e.data);
  // topSubsets(e.data);
  postMessage(recommendedSubsets);
}