import { CaveField, OUT_OF_RUNGE_NUMBER } from "@/core/constants.js";
import { CaveInterval } from "@/core/types.js";

//xI
export function mergeCaveIntervals(
  intervals: CaveInterval[],
  floorY: number,
  ceilingY: number
): void {
  let index = 0;

  while (index < intervals.length) {
    const interval = intervals[index]!;

    if (floorY > interval.ceilingY) {
      break;
    }

    if (ceilingY < interval.floorY) {
      index++;
    } else {
      floorY = Math.min(interval.floorY, floorY);
      ceilingY = Math.max(interval.ceilingY, ceilingY);
      intervals.splice(index, 1);
    }
  }

  intervals.splice(index, 0, {
    floorY,
    ceilingY,
  });
}

//bI
export function collectCaveIntervals(
  x: number,
  z: number,
  caveHeightmapVals: any,
  skipSolidCaveTypes: boolean,
  intervals: CaveInterval[]
): void {
  for (let caveType = 0; caveType < caveHeightmapVals.numCaveTypes; caveType++) {
    if (
      skipSolidCaveTypes &&
      caveHeightmapVals.caveTypeToBlockIds[caveType] !== 0
    ) {
      continue;
    }

    const floorY = caveHeightmapVals.getOrGenerate(x, z, caveType, CaveField.FloorY);

    if (floorY === OUT_OF_RUNGE_NUMBER.NO_CAVE_NUMBER) {
      continue;
    }

    mergeCaveIntervals(
      intervals,
      floorY,
      caveHeightmapVals.getOrGenerate(x, z, caveType, CaveField.CeilingY)
    );
  }
}

//SI
export function getCaveIntervals(
  x: number,
  z: number,
  caveHeightmapVals: any,
  skipSolidCaveTypes: boolean
): CaveInterval[] {
  const intervals: CaveInterval[] = [];

  collectCaveIntervals(
    x,
    z,
    caveHeightmapVals,
    skipSolidCaveTypes,
    intervals
  );

  return intervals;
}