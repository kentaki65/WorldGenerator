//いつかCI専用の関数に移行しよう

import { CaveHeightThreshold, Range } from "@/core/types.js";

export function getRangeProperties(range: Range): CaveHeightThreshold {
  const width = range.high - range.low;

  return {
    low: range.low,
    high: range.high,
    midpoint: (range.low + range.high) / 2,
    width,
    halfWidth: width / 2
  };
}