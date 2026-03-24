import {
  executionContext,
  callStack,
  scopeChain,
  hoisting,
  closures,
  thisKeyword,
  eventLoop,
  promises,
  prototypes,
  objectsImmutability,
  curryingComposition,
  debounceThrottle,
  deepShallowCopy,
  typeCoercion,
  garbageCollection,
  polyfills,
  domLifecycle,
  eventDelegation,
  fetchCors,
  webStorage,
  criticalRenderPath,
  arrayUtilityMethods,
} from "./day1";

import { day2Topics } from "./day2";
import { day3Topics } from "./day3";
import { day4Topics } from "./day4";

// Map topic IDs to their full data
const day1Map = {
  "execution-context": executionContext,
  "call-stack": callStack,
  "scope-chain": scopeChain,
  hoisting: hoisting,
  closures: closures,
  "this-keyword": thisKeyword,
  "event-loop": eventLoop,
  promises: promises,
  prototypes: prototypes,
  "objects-immutability": objectsImmutability,
  "currying-composition": curryingComposition,
  "debounce-throttle": debounceThrottle,
  "deep-shallow-copy": deepShallowCopy,
  "type-coercion": typeCoercion,
  "garbage-collection": garbageCollection,
  polyfills: polyfills,
  "dom-lifecycle": domLifecycle,
  "event-delegation": eventDelegation,
  "fetch-cors": fetchCors,
  "web-storage": webStorage,
  "critical-render-path": criticalRenderPath,
  "array-utility-methods": arrayUtilityMethods,
};

export const allTopics = {
  ...day1Map,
  ...day2Topics,
  ...day3Topics,
  ...day4Topics,
};

export function getTopicData(topicId) {
  return allTopics[topicId] || null;
}

export function getDayTopics(dayNum) {
  const maps = { 1: day1Map, 2: day2Topics, 3: day3Topics, 4: day4Topics };
  return maps[dayNum] || {};
}
