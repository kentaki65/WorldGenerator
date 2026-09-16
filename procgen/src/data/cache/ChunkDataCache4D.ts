import { Vec2 } from "@/core/types.js";
import { Sparse4DArray } from "../array/Sparse4DArray.js";
import { ChunkArray4D } from "../array/ChunkArray4D.js";
import { emptyArray } from "@/core/constants.js";
import { CombinedArray4D } from "../array/CombinedArray4D.js";

//型修正必要
export class ChunkDataCache4D {
  outerSparseArray: Sparse4DArray;
  innerContiguousArray: any;
  generator: any;

  constructor(innerContiguousArray: any, generator: any) {
    this.innerContiguousArray = innerContiguousArray;
    this.generator = generator;
    this.outerSparseArray = new Sparse4DArray();
  }

  static create(size: number, chunkBottomLeft: Vec2, dimension3: number, dimension4: number, generator: any) {
    const innerArray = new ChunkArray4D(size, chunkBottomLeft, dimension3, dimension4);
    for (let x = chunkBottomLeft[0]; x < chunkBottomLeft[0] + size; x++) {
      for (let y = chunkBottomLeft[1]; y < chunkBottomLeft[1] + size; y++) {
        generator.generateAndSet(x, y, innerArray);
      }
    }
    return new ChunkDataCache4D(innerArray, generator);
  }
  
  getOrGenerate(x: number, y: number, z: number, d: number) {
    if (this.innerContiguousArray.isInBounds(x, y)) {
      return this.innerContiguousArray.get(x, y, z, d);
    }

    {
      const value = this.outerSparseArray.get(x, y, z, d);
      if (value !== undefined) {
        return value;
      }
    }

    this.generator.generateAndSet(x, y, this.outerSparseArray);
    return this.outerSparseArray.get(x, y, z, d);
  }

  viewJustInnerChunk() {
    return new CombinedArray4D(emptyArray, this.innerContiguousArray);
  }
}