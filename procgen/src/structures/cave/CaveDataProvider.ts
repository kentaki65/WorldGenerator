import { CoordinateGeneratorCache } from "@/data/cache/CoordinateGeneratorCache.js";
import { CaveIntervalGenerator } from "./CaveIntervalGenerator.js";
import { SurfaceLimitedCaveIntervalGenerator } from "./SurfaceLimitedCaveIntervalGenerator.js";
import { HeightField } from "@/core/constants.js";

export class CaveDataProvider {
  heightmapVals: any;
  allCavesCache: any;
  decoratableCavesCache: any;

  constructor(
    heightmapVals: any,
    caveHeightmapVals: any,
    surfaceMargin: number,
    minCaveHeight: number
  ) {
    this.heightmapVals = heightmapVals;
    this.allCavesCache = new CoordinateGeneratorCache(new CaveIntervalGenerator(caveHeightmapVals));
    this.decoratableCavesCache = new CoordinateGeneratorCache(new SurfaceLimitedCaveIntervalGenerator(caveHeightmapVals, heightmapVals, surfaceMargin, minCaveHeight));
  }

  getAllCaves(x: number, z: number) {
    return this.allCavesCache.getOrGenerate(x, z);
  }

  getGroundHeight(x: number, z: number) {
    return this.heightmapVals.getOrGenerate(x, z, HeightField.GroundHeight);
  }

  getDecoratableCaves(x: number, z: number) {
    return this.decoratableCavesCache.getOrGenerate(x, z);
  }
}