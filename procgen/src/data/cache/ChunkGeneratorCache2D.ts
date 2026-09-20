import { Vec2 } from "@/core/types.js";
import { ChunkArray2DWithPadding } from "../array/ChunkArray2DWithPadding.js";

//型の修正必要
//dH
export class ChunkGeneratorCache {
  innerContiguousArray: any;
  generator: any;
  outerSparseArray: any;

  constructor(innerContiguousArray: any, generator: any) {
    this.innerContiguousArray = innerContiguousArray;
    this.generator = generator;
    this.outerSparseArray = [];
  }

  static create(size: number, chunkBottomLeft: Vec2, generator: any) {
    const array = new ChunkArray2DWithPadding(size, chunkBottomLeft);

    for (let x = chunkBottomLeft[0]; x < chunkBottomLeft[0] + size; x++) {
      for (let y = chunkBottomLeft[1]; y < chunkBottomLeft[1] + size; y++) {
        const value = generator.generate(x, y);
        array.set(x, y, value);
      }
    }

    return new ChunkGeneratorCache(array, generator);
  }

  getOrGenerate(x: number, y: number) {
    if (this.innerContiguousArray.isInBounds(x, y)) {
      return this.innerContiguousArray.get(x, y);
    }
    let value = this.outerSparseArray[x]?.[y];
    if (value === undefined) {
      value = this.generator.generate(x, y);
      if (!this.outerSparseArray[x]) {
        this.outerSparseArray[x] = [];
      }
      this.outerSparseArray[x][y] = value;
    }
    return value;
  }
}