// import {
//   entropy,
//   errorDeviation,
//   errorCount,
//   errorPercent
// } from './RatingMetrics.js';
import { getData } from './DataTransformer.js';


import * as d3 from "d3";

export { getRecommendedSubsets, timeSubsets, topSubsets, randomSubsets };

const criteria = {
  'entropy': entropy,
  'antiEntropy': antiEntropy,
}

function entropy({set, metadata, dataset}) {
  const data = getData(metadata, set, dataset);

  // give higher rating to lower entropy, so negate it
  const value = 1 - d3.sum(data, square => {
    const weight = square.size / metadata.size;
    return weight * H(square);
  });

  return value;

  function H(square) {
    return -d3.sum(square.groundTruth.values(), v => {
      const p = v / square.size;
      return p * Math.log2(p);
    });
  }
}

function antiEntropy({set, metadata, dataset}) {
  return 1 - entropy({set, metadata, dataset});
}

function timeSubsets({criterion, selected, metadata, dataset}) {
  const data = [];

  d3.range(0.5, 1, 0.01).reverse().forEach(threshold => {
    const t0 = performance.now();
    const subsets = getRecommendedSubsets({criterion, selected, metadata, dataset}, threshold);
    const t1 = performance.now();

    data.push({
      threshold,
      percentBetter: 1 - threshold,
      numSubsets: subsets.length,
      ms: t1 - t0
    });
  });

  console.log(JSON.stringify(data));
}

function topSubsets({criterion, selected, metadata, dataset}) {
  const data = {};

  [2, 3, 4].forEach(n => {
    console.log(n);
    const sets = getPermutations(metadata.featureNames, n)
      .map(cand => ({
        set: cand,
        score: entropy({set: cand, metadata, dataset}),
      }))
      .sort((a, b) => d3.descending(a.score, b.score));

    data[n] = sets;
  });

  console.log(JSON.stringify(data));
}

function randomSubsets({criterion, selected, metadata, dataset}) {
  return d3.shuffle(getPermutations(metadata.featureNames, 2)).slice(0, 10);
}

function getRecommendedSubsets({criterion, selected, metadata, dataset}, percent=1.0) {
  const L = [getLarge1ItemSets({criterion, metadata, dataset})];

  for (let k = 1; k < 4; k++) {
    const min = d3.min(L[k - 1], d => d.score);

    const threshold = min * percent;

    const candidates = getCandidates(L[k - 1]);

    const candScores = candidates.map(cand => ({
      set: cand,
      score: criteria[criterion]({set: cand, metadata, dataset})
    }));

    const valid = candScores.filter(({score}) => {
      return score > threshold;
    });

    L.push(valid);
  }

  const sorted = L.flat().sort((a, b) => d3.descending(a.score, b.score));

  return sorted.map(d => d.set);
}

function getLarge1ItemSets({criterion, metadata, dataset}) {
  const numStart = Math.min(Math.floor(metadata.featureNames.length / 2), 10);
  const scores = metadata.featureNames.map(feature => {
    return {
      score: criteria[criterion]({set: [feature], metadata, dataset}),
      set: [feature]
    }
  }).sort((a, b) => d3.descending(a.score, b.score))
    .slice(0, numStart);

  return scores;
}

// https://github.com/tommyod/Efficient-Apriori/blob/master/efficient_apriori/itemsets.py

function getCandidates(previous) {
  const itemsets = previous.map(d => d.set).sort(comp);

  const possible = joinStep(itemsets);

  return pruneStep(itemsets, possible);
}

function joinStep(itemsets) {
  const result = [];

  let i = 0;

  while (i < itemsets.length) {
    let skip = 1;

    let itemset_first = itemsets[i].slice(0, -1);
    let itemset_last = itemsets[i][itemsets[i].length - 1];

    let tail_items = [itemset_last];

    for (let j = i + 1; j < itemsets.length; j++) {
      let itemset_n_first = itemsets[j].slice(0, -1);
      let itemset_n_last = itemsets[j][itemsets[j].length - 1];

      if (comp(itemset_first, itemset_n_first) === 0) {
        tail_items.push(itemset_n_last);
        skip++;
      } else {
        break;
      }
    }

    for (let [a, b] of getPermutations(tail_items, 2).sort(comp)) {
      result.push([...itemset_first, a, b]);
    }

    i += skip;
  }

  return result;
}

function pruneStep(itemsets, possibles) {
  const is = new Set(itemsets.map(i => i.join(',')));
  const result = [];

  for (let poss of possibles) {
    let good = true;

    for (let i = 0; i < poss.length; i++) {
      const removed = [...poss.slice(0, i), ...poss.slice(i + 1)].join(',');

      if (!is.has(removed)) {
        good = false;
        break;
      }
    }

    if (good) {
      result.push(poss);
    }
  }

  return result;
}


function comp(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return a[i] - b[i];
    }
  }

  return 0;
}

function getPermutations(array, size) {
  function p(t, i) {
      if (t.length === size) {
          result.push(t);
          return;
      }
      if (i + 1 > array.length) {
          return;
      }
      p(t.concat(array[i]), i + 1);
      p(t, i + 1);
  }

  var result = [];
  p([], 0);
  return result;
}