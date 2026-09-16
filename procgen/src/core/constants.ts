export const ChunkSize = 32;

export enum TreeType {
  Maple = 0,
  Pine = 1,
  Plum = 2,
  Cedar = 4,
  Aspen = 5,
  Jungle = 6,
  Palm = 7,
  AutumnMaple = 8,
  Pear = 9,
  Cherry = 10,
  Spectral = 11,
  Mango = 12,
  AutumnAspen = 13,
}

export enum Rarity {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
}

export enum BiomeRegion {
  PLAINS = 0,
  AUTUMN = 1,
}

export enum TERRAIN_LEVELS {
  seaLevel = 0,
  bedrockLevel = -100
};

//修正必要
export enum outOfRangeNumber {
  mI = -10000,
  ZH = -10000,
  OUT_OF_RANGE = -10000,
}

export const emptyArray = {
  get() {
    return undefined;
  }
};