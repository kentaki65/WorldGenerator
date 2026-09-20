import { SimpleOctavesNoise } from "@/noise/SimpleOctaveNoise.js";
import { Biome } from "../Biome.js";
import { BiomeConstructorOptions, Seed } from "@/core/types.js";

export class RollingHills extends Biome {
  constructor(
    chunkSize: number, 
    blockMetadata: any, 
    worldGenerator: any, 
    seed: Seed, 
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}RollingHills`, options);
    this.riceChance = 30;
    this.topsoilBlockType = blockMetadata["Grass Block"].id;
    this.treeMinDist = 25;
    this.offsettedHeight = 20;
    this._heightmapSimplex = new SimpleOctavesNoise([{
      amplitude: 20,
      frequency: 0.005
    }, {
      amplitude: 4,
      frequency: 1 / 70
    }], `${seed}RollingHillsBiomeHeightMap`);
  }
}