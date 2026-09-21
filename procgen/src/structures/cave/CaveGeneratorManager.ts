import { ChunkSize } from "@/core/constants.js";
import { ChunkArray4D } from "@/data/array/ChunkArray4D.js";
import { Sparse4DArray } from "@/data/array/Sparse4DArray.js";
import { divideByChunkSize } from "@/utils/MathHelper.js";

export class CaveGeneratorManager {
  caveMetadataForChunkCache: any;
  heightmapVals: any;
  caveGeneratorsPerChunk: any[];

  constructor(caveMetadataForChunkCache: any, heightmapVals: any, chunkSize: number) {
    this.caveMetadataForChunkCache = caveMetadataForChunkCache;
    this.heightmapVals = heightmapVals;
    this.caveGeneratorsPerChunk = [];

    if (chunkSize !== ChunkSize) {
      throw new Error(`Cave generation is not supported for chunk sizes other than ${ChunkSize}`);
    }
  }

  generateAndSet(x: number, y: number, caveMetadata: ChunkArray4D | Sparse4DArray) {
    const chunkX = divideByChunkSize(x);
    const chunkZ = divideByChunkSize(y);

    this.getOrCreateCaveGeneratorForChunk(chunkX, chunkZ).generateAndSet(x, y, caveMetadata);
  }

  getOrCreateCaveGeneratorForChunk(chunkX: number, chunkZ: number) {
    if (this.caveGeneratorsPerChunk[chunkX] === undefined) {
      this.caveGeneratorsPerChunk[chunkX] = [];
    }

    if (this.caveGeneratorsPerChunk[chunkX][chunkZ] === undefined) {
      this.caveGeneratorsPerChunk[chunkX][chunkZ] =
        this.caveMetadataForChunkCache.getOrCreateCaveGeneratorForChunk(
          chunkX,
          chunkZ,
          this.heightmapVals
        );
    }

    return this.caveGeneratorsPerChunk[chunkX][chunkZ];
  }
}