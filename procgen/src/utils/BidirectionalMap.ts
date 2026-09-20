export class BidirectionalMap {
  keyToValueTable: Record<string, any>;
  valueToKeyTable: Record<string | number, string | number>;

  constructor(
    keyToValueTable: Record<string, any>,
    keyType: "string" | "number"
  ) {
    this.keyToValueTable = keyToValueTable;
    const valueToKeyTable: Record<string | number, string | number> = {};

    for (const key in this.keyToValueTable) {
      const value = this.keyToValueTable[key];
      if (valueToKeyTable[value] !== undefined) {
        throw new Error(`Duplicate value found in bi-directional table: ${String(value)}`);
      }
      valueToKeyTable[value] = keyType === "string" ? key : Number(key);
    }
    this.valueToKeyTable = valueToKeyTable;
  }

  get(key: number): number {
    return this.keyToValueTable[key];
  }

  reverseGet(value: string | number): string | number | undefined {
    return this.valueToKeyTable[value];
  }
}