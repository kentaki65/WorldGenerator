import { CaveField, HeightField, OUT_OF_RUNGE_NUMBER } from "@/core/constants.js";
import { BlockId, BlockMetadata, ChunkArray, Vec2 } from "@/core/types.js";
import { CaveDataView, InnerChunkCaveDataView } from "./CaveDataViewer.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { ChunkDataCache4D } from "@/data/cache/ChunkDataCache4D.js";
import { CaveGeneratorManager } from "./CaveGeneratorManager.js";
import { CaveMetadataManager } from "./CaveMetadataManager.js";

type CaveData = CaveDataView | InnerChunkCaveDataView;

export class CaveManager {
  chunkSize: number;
  caveMetadataForChunkCache;

  constructor(
    caveGeneratorConfig: any,
    chunkSize: number,
    blockMetadata: BlockMetadata,
    BlockName: any | "Lava",
  ) {
    this.chunkSize = chunkSize;
    //洞窟の本体クラス
    this.caveMetadataForChunkCache = new CaveMetadataManager(
      caveGeneratorConfig,
      chunkSize,
      blockMetadata,
      BlockName
    );
  }

  static isInCave(x: number, y: number, z: number, caveData: CaveData) {
    for (let caveType = 0; caveType < caveData.numCaveTypes; caveType++) {
      const floorY = caveData.getOrGenerate(x, z, caveType, CaveField.FloorY);
      const ceilingY = caveData.getOrGenerate(x, z, caveType, CaveField.CeilingY);
      if (floorY <= y && y <= ceilingY) {
        return true;
      }
    }
    return false;
  }

  //chunkArray, chunkX, minY, chunkZ, groundHeightmap, caveData
  static addCavesToChunk(
    chunkArray: ChunkArray,
    chunkX: number,
    minY: number,
    chunkZ: number,
    groundHeightmap: any,
    caveData: any,
  ) {
    const random = new SeededRandom(`caveBlocks${chunkX}|${minY}|${chunkZ}`);

    for (let x = chunkX; x < chunkX + groundHeightmap.chunkSize; x++) {
      for (let z = minY; z < minY + groundHeightmap.chunkSize; z++) {
        const groundHeight = groundHeightmap.get(x, z, HeightField.GroundHeight);

        for (const caveType of groundHeightmap.caveTypePrioritization) {
          const floorY = groundHeightmap.getOrGenerate(x, z, caveType, CaveField.FloorY);
          if (floorY === OUT_OF_RUNGE_NUMBER.NO_CAVE_NUMBER) {
            continue;
          }
          const ceilingY = groundHeightmap.getOrGenerate(x, z, caveType, CaveField.CeilingY);
          const maxY = Math.min(ceilingY + 1, minY + groundHeightmap.chunkSize, groundHeight + 1);
          const blockIds = groundHeightmap.caveTypeToBlockIds[caveType];

          for (let y = Math.max(floorY, minY); y < maxY; y++) {
            const blockId = typeof blockIds === "number" ? blockIds : blockIds.sample(random);

            chunkArray.set(
              x - chunkX,
              y - minY,
              z - minY,
              blockId
            );
          }
        }
      }
    }
  }

  getCaveHeightmapVals(
    x: number, 
    z: number, 
    heightmapVals: any
  ) {
    const chunkCoord: Vec2 = [x, z];
    const caveMetadata = new CaveGeneratorManager(
      this.caveMetadataForChunkCache,
      heightmapVals,
      this.chunkSize
    );

    const numCaveTypes = this.caveMetadataForChunkCache.numCaveTypes;
    const caveTypeToBlockIds = this.caveMetadataForChunkCache.caveTypeToBlockId;
    const caveTypePrioritization = this.caveMetadataForChunkCache.caveTypePrioritization;

    const heightmapData = ChunkDataCache4D.create(
      this.chunkSize,
      chunkCoord,
      numCaveTypes,
      HeightField.NumFields,
      caveMetadata
    );

    return new CaveDataView(
      numCaveTypes,
      caveTypeToBlockIds,
      caveTypePrioritization,
      this.chunkSize,
      heightmapData
    );
  }
}