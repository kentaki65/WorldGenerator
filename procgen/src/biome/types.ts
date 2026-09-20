import { BlockMetadata, Seed } from "@/core/types.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";
import { OreGenerator } from "@/structures/ore/oreGenerator.js";

export interface BiomeOptions {
  chunkSize: number;
  blockMetadata: BlockMetadata;
  worldGenerator: WorldGenerator;
  seed: Seed;
  biomeOpts: {
    oreGenerator: OreGenerator
  }
}