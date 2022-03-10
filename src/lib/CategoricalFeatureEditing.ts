import type { CategoricalFeature, Dataset, Features, Node } from "../types";
import { rollup, ascending, descending } from 'd3-array';
import { getClassificationData, getRegressionData } from "./Data";

export { getGroups, updateFeature, addGroup, deleteGroup, mergeGroups, splitGroups, sortGroupsByName, sortGroupsByCount, moveValue, moveGroup, resetUid };

type Group = { name: string, values: Set<string>, id: number };

let uid = 0;

function resetUid(): void {
  uid = 0;
}

function getGroups(feature: CategoricalFeature): Group[] {
  // map from the group name to the feature values in that group
  const groupToValues: Map<string, Set<string>> = rollup(
    Object.entries(feature.valueToGroup)
      .map(([value, group]) => ({value, group})),
    v => new Set(v.map(d => d.value)),
    d => d.group
  );

  type Group = { name: string, values: Set<string>, id: number };

  const groups: Group[] = feature.values.map(d => ({
    name: d,
    values: groupToValues.get(d),
    id: uid++
  }));

  return groups;
}

function updateFeature(feature: CategoricalFeature, groups: Group[]) {
  const noEmptyGroups = groups.filter(d => d.values.size !== 0);

  feature.valueToGroup = Object.fromEntries(
    noEmptyGroups.map(({name, values}) =>
      [...values].map(v => [v, name])
    ).flat()
  );

  feature.values = noEmptyGroups.map(d => d.name);

  return feature;
}

function addGroup(groups: Group[]): Group[] {
  const group: Group = {
    name: "New",
    id: uid++,
    values: new Set([])
  };

  return [group, ...groups];
}

function deleteGroup(groups: Group[], index: number): Group[] {
  if (index < groups.length) {
    // remove 1 element at index
    groups.splice(index, 1);
  }

  return groups;
}

function mergeGroups(feature: CategoricalFeature): Group[] {
  return [{
    name: "All values",
    id: uid++,
    values: new Set(Object.keys(feature.valueToGroup))
  }];
}

function splitGroups(feature: CategoricalFeature): Group[] {
  return Object.keys(feature.valueToGroup)
    .map(d => ({ name: d, id: uid++, values: new Set([d])}));
}

function sortGroupsByCount(feature: CategoricalFeature, groups: Group[], dataset: Dataset, features: Features) {
  feature = updateFeature(feature, groups);

  // get the subsets according to the feature's bins
  const data: Node[] = (dataset.type === 'classification') ?
      getClassificationData(features, [feature.name], dataset) :
      getRegressionData(features, [feature.name], dataset);

  // map from the group name to the number of instances in that group
  const valueToCount: Map<string, number> = new Map(data.map(d => {
    const valueIndex = d.splits.get(feature.name);
    const value = feature.values[valueIndex];
    return [value, d.size];
  }));

  return groups.sort((a, b) => descending(
    valueToCount.get(a.name) ?? 0,
    valueToCount.get(b.name) ?? 0
  ));
}

function sortGroupsByName(groups: Group[]): Group[] {
  return groups.sort((a, b) => ascending(a.name, b.name));
}

function moveValue(value: string, startGroupIndex: number, endGroupIndex: number, groups: Group[]): Group[] {
  groups[startGroupIndex].values.delete(value);
  groups[endGroupIndex].values.add(value);

  // remove the start group if it is now empty
  if (groups[startGroupIndex].values.size === 0) {
    groups.splice(startGroupIndex, 1);
  }

  return groups;
}

function moveGroup(startGroupIndex: number, endGroupIndex: number, groups: Group[]): Group[] {
  const group = groups[startGroupIndex];
  groups.splice(startGroupIndex, 1);
  groups.splice(endGroupIndex, 0, group);
  return groups;
}