import { BiomeConstructorOptions, Seed } from "@/core/types.js";
import { Desert } from "./Desert.js";

export class RedDesert extends Desert {
  constructor(
    chunkSize: number,
    blockMetadata: any,
    worldGenerator: any,
    seed: Seed,
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}RedDesert`, options);
    this.chiliPepperChance = 30;
    this.lavaChiliPepperChance = 30;
    this.topsoilBlockType = blockMetadata["Red Sand"].id;
    this.lowsoilBlockType = blockMetadata["Red Sand"].id;
  }
}