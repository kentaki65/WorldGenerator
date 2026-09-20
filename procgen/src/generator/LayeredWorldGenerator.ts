import { BlockMetadata } from "@/core/types.js";
import { WorldGenerator } from "./WorldGenerator.js";

interface WorldGenLayer {
  VI: number; // レイヤー適用開始Y座標
  YI: number; // レイヤー適用終了Y座標(排他的)
  aI: number; // レイヤー内ローカルY座標へのオフセット
  fI?: WorldGenLayer[]; // (Ihのoptions.fIとして使われる、レイヤー一覧)
}

export class LayeredWorldGenerator {
  defaultGenerator: WorldGenerator;
  layerEntries!: { layer: WorldGenLayer; generator: WorldGenerator }[];

  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    itemMetadata: any,
    seed: string,
    useBiggerCache: boolean,
    fixedPointPrefabs: any,
    cacheSizeMultiplier: number,
    options?: { fI?: WorldGenLayer[] }
  ) {
    this.defaultGenerator = new WorldGenerator(chunkSize, blockMetadata, itemMetadata, seed, useBiggerCache, fixedPointPrefabs, cacheSizeMultiplier);

    const layers = options?.fI ?? [];

    (function (layerList: WorldGenLayer[], context: any) {
      for (const layer of layerList) {
        Eh(layer, context);
      }
      const sorted = [...layerList].sort((a, b) => a.VI - b.VI);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].VI < sorted[i - 1].YI) {
          throw new Error(
            `Custom world-gen layers overlap: [${sorted[i - 1].VI}, ${sorted[i - 1].YI}) and [${sorted[i].VI}, ${sorted[i].YI})`
          );
        }
      }
    })(layers, blockMetadata);

    this.layerEntries = layers.map((layer) => ({
      layer,
      generator: new WorldGenerator(chunkSize, blockMetadata, itemMetadata, seed, useBiggerCache, fixedPointPrefabs, cacheSizeMultiplier, layer as any)
    }));
  }

  getChunk(chunkArray: any, chunkStartX: number, chunkStartY: number, chunkStartZ: number) {
    for (const { layer, generator } of this.layerEntries) {
      if (chunkStartY >= layer.VI && chunkStartY < layer.YI) {
        return generator.getChunk(chunkArray, chunkStartX, chunkStartY - layer.aI, chunkStartZ);
      }
    }
    return this.defaultGenerator.getChunk(chunkArray, chunkStartX, chunkStartY, chunkStartZ);
  }

  getBiomeSelector() {
    return this.defaultGenerator.biomeSelector;
  }

  getTreeGenerator() {
    return this.defaultGenerator.treeGenerator;
  }
}