import { virtualDom } from "./virtual-dom";
import { fiberArchitecture } from "./fiber-architecture";
import { useStateTopic } from "./use-state";
import { useEffectTopic } from "./use-effect";
import { useMemoCallback } from "./use-memo-callback";
import { useRefTopic } from "./use-ref";
import { customHooks } from "./custom-hooks";
import { rerenders } from "./rerenders";
import { contextApi } from "./context-api";
import { reactPatterns } from "./react-patterns";
import { reactPerformance } from "./react-performance";
import { errorBoundaries } from "./error-boundaries";
import { concurrentFeatures } from "./concurrent-features";

export const day2Topics = {
  "virtual-dom": virtualDom,
  "fiber-architecture": fiberArchitecture,
  usestate: useStateTopic,
  useeffect: useEffectTopic,
  "usememo-usecallback": useMemoCallback,
  useref: useRefTopic,
  "custom-hooks": customHooks,
  rerenders: rerenders,
  "context-api": contextApi,
  "react-patterns": reactPatterns,
  "react-performance": reactPerformance,
  "error-boundaries": errorBoundaries,
  "concurrent-features": concurrentFeatures,
};
