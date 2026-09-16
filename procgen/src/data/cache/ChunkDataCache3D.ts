import { emptyArray } from "@/core/constants.js";
import { CombinedArray3D } from "../array/CombinedArray3D.js";
import { Sparse3DArray } from "../array/Sparse3DArray.js";
import { Vec2 } from "@/core/types.js";
import { ChunkArray3D } from "../array/ChunkArray3D.js";

//型について修正欲しい
//zH
export class ChunkDataCache3D {
  innerContiguousArray: any;
  generator: any;
  outerSparseArray: Sparse3DArray;

  constructor(innerContiguousArray: any, generator: any) {
    this.innerContiguousArray = innerContiguousArray;
    this.generator = generator;
    this.outerSparseArray = new Sparse3DArray();
  }

  static create(size: number, chunkBottomLeft: Vec2, dimension3: number, generator: any) {
    const innerArray = new ChunkArray3D(size, chunkBottomLeft, dimension3);

    for (let x = chunkBottomLeft[0]; x < chunkBottomLeft[0] + size; x++) {
      for (let z = chunkBottomLeft[1]; z < chunkBottomLeft[1] + size; z++) {
        generator.generateAndSet(x, z, innerArray);
      }
    }

    return new ChunkDataCache3D(innerArray, generator);
  }

  getOrGenerate(x: number, y: number, z: number) {
    if (this.innerContiguousArray.isInBounds(x, y)) {
      return this.innerContiguousArray.get(x, y, z);
    }

    const cachedValue = this.outerSparseArray.get(x, y, z);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    this.generator.generateAndSet(x, y, this.outerSparseArray);
    return this.outerSparseArray.get(x, y, z);
  }

  viewJustInnerChunk() {
    return new CombinedArray3D(emptyArray, this.innerContiguousArray);
  }
}