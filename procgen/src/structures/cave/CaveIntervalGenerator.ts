import { getCaveIntervals } from "./CaveUtils.js";

export class CaveIntervalGenerator {
  caveHeightmapVals: any;

  constructor(caveHeightmapVals: any) {
    this.caveHeightmapVals = caveHeightmapVals;
  }

  generate(x: number, z: number) {
    return getCaveIntervals(x, z, this.caveHeightmapVals, false);
  }
}