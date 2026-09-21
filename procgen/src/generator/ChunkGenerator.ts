import { Biome } from "@/biome/Biome.js";
import { BiomeSelector } from "@/biome/BiomeSelector.js";
import { OreGenerator } from "@/structures/ore/oreGenerator.js";
import { PrefabGenerator } from "@/structures/prefab/PrefabGenerator.js";
import { TreeGenerator } from "@/structures/tree/TreeGenerator.js";
import { PointsGenerator } from "./PointsGenerator.js";
import { BlockPlacementMode, HeightField, OUT_OF_RUNGE_NUMBER, TERRAIN_LEVELS } from "@/core/constants.js";
import { Sparse3DMap } from "@/data/array/Sparse3DMap.js";
import { CaveManager } from "@/structures/cave/CaveManager.js";
import { CaveDecorationGenerator } from "@/structures/cave/CaveDecorationGenerator.js";
import { CaveDataView } from "@/structures/cave/CaveDataViewer.js";
import { FixedPointPrefabManager } from "@/structures/prefab/FixedPointPrefabManager.js";
import { BlockMetadata, PrefabInstance, Seed, TreePlacement } from "@/core/types.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { squaredDistanceToPoint } from "@/utils/MathHelper.js";

interface SpecialBlockEntry {
  x: number;
  y: number;
  z: number;
  val: {
    getBlockId(): number;
    generate(): Record<string, unknown>;
  };
}

interface ChunkArrayLike {
  set(x: number, y: number, z: number, value: number): void;
  get(x: number, y: number, z: number): number;
}

interface HeightmapValsLike {
  get(x: number, z: number, field: unknown): number;
}

interface BiomeInfo {
  biomeIds: { get(x: number, z: number): number };
  stoneTypeIds: { get(x: number, z: number): number };
}

interface FillChunkResult {
  specialBlocks: Array<{ pos: [number, number, number];[key: string]: unknown }>;
}

export class ChunkGenerator {
  prefabGenerator: PrefabGenerator;
  seed: Seed;
  chunkSize: number;
  biomeSelector: BiomeSelector;
  treeGenerator: TreeGenerator;
  blockMetadata: BlockMetadata;
  oreGenerator: OreGenerator;
  baseBiome: Biome;
  riverbedFeatureGenerator: PointsGenerator;
  bedrockId: number;
  waterId: number;
  sandId: number;
  clayId: number;
  chalkId: number;

  constructor(
    chunkSize: number,
    biomeSelector: BiomeSelector,
    treeGenerator: TreeGenerator,
    prefabGenerator: PrefabGenerator,
    blockMetadata: BlockMetadata,
    oreGenerator: OreGenerator,
    baseBiome: Biome,
    seed: Seed
  ) {
    this.prefabGenerator = prefabGenerator;
    this.seed = seed;
    this.chunkSize = chunkSize;
    this.biomeSelector = biomeSelector;
    this.treeGenerator = treeGenerator;
    this.blockMetadata = blockMetadata;
    this.oreGenerator = oreGenerator;
    this.baseBiome = baseBiome;

    this.bedrockId = blockMetadata.Bedrock.id;
    this.waterId = blockMetadata.Water.id;
    this.sandId = blockMetadata.Sand.id;
    this.clayId = blockMetadata.Clay.id;
    this.chalkId = blockMetadata.Chalk.id;

    this.riverbedFeatureGenerator = new PointsGenerator("clay", 50, false, true, seed, 4, chunkSize, null, true);
  }

  fillChunk(
    chunkArray: ChunkArrayLike,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    heightmapVals: HeightmapValsLike,
    treeData: TreePlacement[],
    prefabData: PrefabInstance[],
    caveData: CaveDataView,
    oreData: number[],
    biomeInfo: BiomeInfo,
    fixedPrefabInfo: unknown,
    fixedPrefabs: unknown[],
    caveDecorations: any[]
  ): FillChunkResult {
    if (chunkStartY + this.chunkSize <= TERRAIN_LEVELS.bedrockLevel) {
      return {
        specialBlocks: []
      };
    }

    const specialBlockGenerators = new Sparse3DMap();

    let maxGroundHeight = -10000;
    let minGroundHeight = 10000;
    let maxWaterHeight = -10000;
    let minWaterHeight = 10000;
    let hasWater = false;

    for (
      let worldX = chunkStartX;
      worldX < chunkStartX + this.chunkSize;
      worldX++
    ) {
      for (
        let worldZ = chunkStartZ;
        worldZ < chunkStartZ + this.chunkSize;
        worldZ++
      ) {
        maxGroundHeight = Math.max(
          maxGroundHeight,
          heightmapVals.get(worldX, worldZ, HeightField.GroundHeight)
        );

        minGroundHeight = Math.min(
          minGroundHeight,
          heightmapVals.get(worldX, worldZ, HeightField.GroundHeight)
        );

        const waterHeight = heightmapVals.get(
          worldX,
          worldZ,
          HeightField.WaterHeight
        );

        if (waterHeight !== OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE) {
          hasWater = true;
          maxWaterHeight = Math.max(maxWaterHeight, waterHeight);
          minWaterHeight = Math.min(minWaterHeight, waterHeight);
        }
      }
    }

    // Topsoil
    if (maxGroundHeight >= chunkStartY && minGroundHeight < chunkStartY + this.chunkSize) {
      for (
        let worldX = chunkStartX;
        worldX < chunkStartX + this.chunkSize;
        worldX++
      ) {
        for (
          let worldZ = chunkStartZ;
          worldZ < chunkStartZ + this.chunkSize;
          worldZ++
        ) {
          const biomeId = biomeInfo.biomeIds.get(worldX, worldZ);
          const biome = this.biomeSelector.getBiomeFromId(biomeId);
          const groundHeight = heightmapVals.get(
            worldX,
            worldZ,
            HeightField.GroundHeight
          );

          if (
            groundHeight >= chunkStartY &&
            groundHeight < chunkStartY + this.chunkSize
          ) {
            chunkArray.set(
              worldX - chunkStartX,
              groundHeight - chunkStartY,
              worldZ - chunkStartZ,
              biome.getTopsoilBlock(worldX, groundHeight, worldZ)
            );
          }
        }
      }
    }

    // Low soil
    if (maxGroundHeight + 1 >= chunkStartY && minGroundHeight - 4 < chunkStartY + this.chunkSize) {
      for (
        let worldX = chunkStartX;
        worldX < chunkStartX + this.chunkSize;
        worldX++
      ) {
        for (
          let worldZ = chunkStartZ;
          worldZ < chunkStartZ + this.chunkSize;
          worldZ++
        ) {
          const biomeId = biomeInfo.biomeIds.get(worldX, worldZ);
          const biome = this.biomeSelector.getBiomeFromId(biomeId);
          const groundHeight = heightmapVals.get(
            worldX,
            worldZ,
            HeightField.GroundHeight
          );
          const maxY = Math.min(groundHeight, chunkStartY + this.chunkSize);

          for (
            let y = Math.max(groundHeight - 4, chunkStartY);
            y < maxY;
            y++
          ) {
            chunkArray.set(
              worldX - chunkStartX,
              y - chunkStartY,
              worldZ - chunkStartZ,
              biome.getLowsoilBlockType(worldX, y, worldZ, groundHeight)
            );
          }
        }
      }
    }

    // Stone
    if (maxGroundHeight - 4 >= chunkStartY) {
      for (
        let worldX = chunkStartX;
        worldX < chunkStartX + this.chunkSize;
        worldX++
      ) {
        for (
          let worldZ = chunkStartZ;
          worldZ < chunkStartZ + this.chunkSize;
          worldZ++
        ) {
          const stoneTypeId = biomeInfo.stoneTypeIds.get(worldX, worldZ);
          const groundHeight = heightmapVals.get(
            worldX,
            worldZ,
            HeightField.GroundHeight
          );
          const maxY = Math.min(groundHeight - 4, chunkStartY + this.chunkSize);

          for (let y = chunkStartY; y < maxY; y++) {
            chunkArray.set(
              worldX - chunkStartX,
              y - chunkStartY,
              worldZ - chunkStartZ,
              stoneTypeId
            );
          }
        }
      }
    }

    // Ores
    if (maxGroundHeight - 4 >= chunkStartY) {
      this.oreGenerator.addOresToChunk(
        chunkArray,
        chunkStartX,
        chunkStartY,
        chunkStartZ,
        4,
        heightmapVals,
        oreData
      );
    }

    // Caves and cave decorations
    if (maxGroundHeight >= chunkStartY) {
      CaveManager.addCavesToChunk(
        chunkArray,
        chunkStartX,
        chunkStartY,
        chunkStartZ,
        heightmapVals,
        caveData
      );

      CaveDecorationGenerator.addCaveDecorationsToChunk(
        chunkArray,
        chunkStartX,
        chunkStartY,
        chunkStartZ,
        this.chunkSize,
        caveDecorations
      );
    }

    // Bedrock
    if (
      TERRAIN_LEVELS.bedrockLevel >= chunkStartY &&
      TERRAIN_LEVELS.bedrockLevel < chunkStartY + this.chunkSize
    ) {
      for (
        let worldX = chunkStartX;
        worldX < chunkStartX + this.chunkSize;
        worldX++
      ) {
        for (
          let worldZ = chunkStartZ;
          worldZ < chunkStartZ + this.chunkSize;
          worldZ++
        ) {
          chunkArray.set(
            worldX - chunkStartX,
            TERRAIN_LEVELS.bedrockLevel - chunkStartY,
            worldZ - chunkStartZ,
            this.bedrockId
          );
        }
      }
    }

    // Flora
    if (
      maxGroundHeight + this.baseBiome.maxFloraHeight >= chunkStartY &&
      minGroundHeight + 1 < chunkStartY + this.chunkSize
    ) {
      for (
        let worldX = chunkStartX;
        worldX < chunkStartX + this.chunkSize;
        worldX++
      ) {
        for (
          let worldZ = chunkStartZ;
          worldZ < chunkStartZ + this.chunkSize;
          worldZ++
        ) {
          const biomeId = biomeInfo.biomeIds.get(worldX, worldZ);
          const biome = this.biomeSelector.getBiomeFromId(biomeId);
          const maxFloraHeight = biome.maxFloraHeight;
          const groundHeight = heightmapVals.get(
            worldX,
            worldZ,
            HeightField.GroundHeight
          );

          if (
            groundHeight >= chunkStartY + this.chunkSize ||
            groundHeight < chunkStartY - maxFloraHeight
          ) {
            continue;
          }

          if (
            heightmapVals.get(worldX, worldZ, HeightField.WaterHeight) !== OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE
          ) {
            continue;
          }

          if (CaveManager.isInCave(worldX, groundHeight, worldZ, caveData)) {
            continue;
          }

          if (!FixedPointPrefabManager.isWithinFixedPointPrefab(worldX, worldZ, fixedPrefabInfo)) {
            biome.floraGenerator.addBiomeFloraToColumn(
              chunkArray,
              chunkStartX,
              chunkStartZ,
              worldX,
              chunkStartY,
              worldZ,
              groundHeight
            );
          }
        }
      }
    }

    // Prefabs
    for (const prefab of prefabData) {
      for (
        let worldX = chunkStartX;
        worldX < chunkStartX + this.chunkSize;
        worldX++
      ) {
        for (
          let worldY = chunkStartY;
          worldY < chunkStartY + this.chunkSize;
          worldY++
        ) {
          for (
            let worldZ = chunkStartZ;
            worldZ < chunkStartZ + this.chunkSize;
            worldZ++
          ) {
            const blockId = this.prefabGenerator.getBlockFromPrefabAtPoint(
              worldX,
              worldY,
              worldZ,
              prefab,
              specialBlockGenerators
            );

            if (blockId !== 0) {
              chunkArray.set(
                worldX - chunkStartX,
                worldY - chunkStartY,
                worldZ - chunkStartZ,
                blockId === BlockPlacementMode.GUARANTEED_AIR ? 0 : blockId
              );
            }
          }
        }
      }
    }

    // Trees
    if (maxGroundHeight + this.treeGenerator.maxTreeHeight >= chunkStartY) {
      this.treeGenerator.addTreesToChunk(
        chunkArray,
        chunkStartX,
        chunkStartY,
        chunkStartZ,
        treeData
      );
    }

    // Water
    if (hasWater && maxWaterHeight >= chunkStartY) {
      for (
        let worldX = chunkStartX;
        worldX < chunkStartX + this.chunkSize;
        worldX++
      ) {
        for (
          let worldZ = chunkStartZ;
          worldZ < chunkStartZ + this.chunkSize;
          worldZ++
        ) {
          const waterHeight = heightmapVals.get(
            worldX,
            worldZ,
            HeightField.WaterHeight
          );

          if (waterHeight === OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE) {
            continue;
          }

          const biomeId = biomeInfo.biomeIds.get(worldX, worldZ);
          const biome = this.biomeSelector.getBiomeFromId(biomeId);
          const groundHeight = heightmapVals.get(
            worldX,
            worldZ,
            HeightField.GroundHeight
          );
          const maxY = Math.min(waterHeight + 1, chunkStartY + this.chunkSize);

          for (
            let y = Math.max(groundHeight + 1, chunkStartY);
            y < maxY;
            y++
          ) {
            const blockId =
              y === waterHeight
                ? biome.topwaterBlockType
                : this.waterId;

            chunkArray.set(
              worldX - chunkStartX,
              y - chunkStartY,
              worldZ - chunkStartZ,
              blockId
            );
          }
        }
      }
    }

    // Riverbed
    let lastRiverbedX: number | undefined;
    let lastRiverbedZ: number | undefined;
    let riverbedBlockId: number | undefined;

    if (
      hasWater &&
      maxGroundHeight >= chunkStartY &&
      minGroundHeight < chunkStartY + this.chunkSize
    ) {
      for (
        let worldX = chunkStartX;
        worldX < chunkStartX + this.chunkSize;
        worldX++
      ) {
        for (
          let worldZ = chunkStartZ;
          worldZ < chunkStartZ + this.chunkSize;
          worldZ++
        ) {
          const waterHeight = heightmapVals.get(
            worldX,
            worldZ,
            HeightField.WaterHeight
          );
          const groundHeight = heightmapVals.get(
            worldX,
            worldZ,
            HeightField.GroundHeight
          );

          if (
            waterHeight !== OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE &&
            groundHeight >= chunkStartY &&
            groundHeight < chunkStartY + this.chunkSize
          ) {
            if (waterHeight === groundHeight) {
              chunkArray.set(
                worldX - chunkStartX,
                groundHeight - chunkStartY,
                worldZ - chunkStartZ,
                this.sandId
              );
            } else {
              const riverbedPoint = this.riverbedFeatureGenerator.getClosestPoint(
                worldX,
                worldZ
              );

              if (squaredDistanceToPoint(riverbedPoint, worldX, worldZ) < 100) {
                if (
                  lastRiverbedX !== riverbedPoint[0] ||
                  lastRiverbedZ !== riverbedPoint[1]
                ) {
                  lastRiverbedX = riverbedPoint[0];
                  lastRiverbedZ = riverbedPoint[1];
                  riverbedBlockId =
                    new SeededRandom(`${this.seed}${lastRiverbedX}${lastRiverbedZ}`).next() < 0.3
                      ? this.chalkId
                      : this.clayId;
                }

                chunkArray.set(
                  worldX - chunkStartX,
                  groundHeight - chunkStartY,
                  worldZ - chunkStartZ,
                  riverbedBlockId!
                );

                if (groundHeight - 1 >= chunkStartY) {
                  chunkArray.set(
                    worldX - chunkStartX,
                    groundHeight - 1 - chunkStartY,
                    worldZ - chunkStartZ,
                    riverbedBlockId!
                  );
                }

                if (groundHeight - 2 >= chunkStartY) {
                  chunkArray.set(
                    worldX - chunkStartX,
                    groundHeight - 2 - chunkStartY,
                    worldZ - chunkStartZ,
                    riverbedBlockId!
                  );
                }
              } else {
                const biomeId = biomeInfo.biomeIds.get(worldX, worldZ);
                const biome = this.biomeSelector.getBiomeFromId(biomeId);

                chunkArray.set(
                  worldX - chunkStartX,
                  groundHeight - chunkStartY,
                  worldZ - chunkStartZ,
                  biome.getLowsoilBlockType(
                    worldX,
                    groundHeight,
                    worldZ,
                    groundHeight
                  )
                );
              }
            }
          }
        }
      }
    }

    // Fixed point prefabs
    for (const fixedPrefab of fixedPrefabs) {
      for (
        let worldX = chunkStartX;
        worldX < chunkStartX + this.chunkSize;
        worldX++
      ) {
        for (
          let worldY = chunkStartY;
          worldY < chunkStartY + this.chunkSize;
          worldY++
        ) {
          for (
            let worldZ = chunkStartZ;
            worldZ < chunkStartZ + this.chunkSize;
            worldZ++
          ) {
            const blockId = FixedPointPrefabManager.getBlockFromFixedPointPrefab(
              worldX,
              worldY,
              worldZ,
              fixedPrefab
            );

            if (blockId !== 0) {
              chunkArray.set(
                worldX - chunkStartX,
                worldY - chunkStartY,
                worldZ - chunkStartZ,
                blockId
              );
            }
          }
        }
      }
    }

    // Special blocks
    const specialBlocks: FillChunkResult["specialBlocks"] = [];

    for (const entry of specialBlockGenerators as unknown as Iterable<SpecialBlockEntry>) {
      const specialBlock = entry.val;

      if (
        chunkArray.get(
          entry.x - chunkStartX,
          entry.y - chunkStartY,
          entry.z - chunkStartZ
        ) !== specialBlock.getBlockId()
      ) {
        continue;
      }

      const generatedData = specialBlock.generate();
      const position: [number, number, number] = [entry.x, entry.y, entry.z];

      specialBlocks.push({
        pos: position,
        ...generatedData
      });
    }

    return {
      specialBlocks
    };
  }
}