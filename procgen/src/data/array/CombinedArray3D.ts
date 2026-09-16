export class CombinedArray3D {
  sparseArray: any;
  contiguousArray: any;

  //型について修正ほしい
  constructor(sparseArray: any, contiguousArray: any) {
    this.sparseArray = sparseArray;
    this.contiguousArray = contiguousArray;
  }

  get(x: number, y: number, z: number) {
    if (this.contiguousArray.isInBounds(x, y)) {
      return this.contiguousArray.get(x, y, z);
    }

    const value = this.sparseArray.get(x, y, z);

    if (value === undefined) {
      throw new Error(
        `Number not found for x=${x}, y=${y}, z=${z}`
      );
    }

    return value;
  }
}