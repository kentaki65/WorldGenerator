import { MobNameGenerator } from "@/structures/lootChest/MobNameGenerator.js";
import blockMetadata from "./blockMetadata.json" with { type: "json"};
import { RandomIntRange } from "@/random/RandomIntRange.js";
import { WeightedDistribution } from "@/random/WeightedDistribution.js";
import { CaveMobs, TreeType } from "./constants.js";

export type Seed = number | string;
export type Vec3 = [number, number, number];
export type CaveMobNames = (typeof CaveMobs)[number];

export interface Vec3Object {
  x: number;
  y: number;
  z: number;
}
export type Vec2 = [number, number];

export type Range = {
  low: number;
  high: number;
};

export type Octave = {
  amplitude: number;
  frequency: number;
};

export type LootItem = {
  numItemsDistribution: RandomIntRange;
  itemDistribution: WeightedDistribution<{
    name: string;
    amountDistribution: RandomIntRange | null;
    attributesDistribution: MobNameGenerator | null;
  }>;
};

export type BlockName = keyof typeof blockMetadata;
export type BlockId = number;

export type NumCaveTypes = number;

export type BlockMetadata = {
  [key in BlockName]?: { id: number;[key: string]: any };
};

export interface ChunkArray {
  set(x: number, y: number, z: number, id: BlockId): void;
}


export interface CaveInterval {
  floorY: number;
  ceilingY: number;
}

export interface WeightedItem<T> {
  value: T;
  weight: number;
}

export interface TTLCacheOption {
  ttl: number;
  max: number;
  updateAgeOnGet?: boolean;
  keySeparator: string;
}

export interface ClosestPointOnSegmentResult {
  alongCoord: number;
  fracAlong: number;
  lineSegmentLength: number;
}

export interface CaveHeightThreshold extends Range {
  midpoint: number;
  width: number;
  halfWidth: number;
}

export interface GroundHeightmap {
  chunkSize: number;
  caveTypeToBlockIds: BlockId[];

}

export interface FixedPointPrefabInfo {
  schematic: any;
  bottomLeftX: number;
  bottomLeftZ: number;
  floorY: number;
  ceilingY: number;
  topRightX: number;
  topRightZ: number;
}

export interface FrequenciesItems {
  name: string;
  frequency: number;
  amount?: {
    min: number;
    max: number;
  } | null
  itemAttributesDistribution?: MobNameGenerator;
};

export interface ItemAttributes {
  customDisplayName?: string;
  customAttributes?: {
    mobSettings?: {
      name: string;
    };
  };
}

//seed, chunkSize, blockMetadata, itemMetadata, prefabSize, typeSettings
export interface PrefabConfig {
  seed: Seed;
  chunkSize: number;
  blockMetadata: any;
  itemMetadata: any;
  prefabSize: number;
  typeSettings: any;
}

export interface Prefab {
  dimensionX: number;
  dimensionY: number;
  dimensionZ: number;

  chestLocations: {
    localX: number;
    localY: number;
    localZ: number;
  }[];

  spawnerBlockLocations: {
    localX: number;
    localY: number;
    localZ: number;
  }[];

  schematic: {
    name: string;
    getRLEChunk(x: number, y: number, z: number): any;
  };
}

export interface PrefabCenter {
  centreX: number;
  centreZ: number;
  prefab: {
    clearingRadiusSquared: number;
  }
}

export interface TreePlacement {
  treeX: number;
  treeZ: number;
  trunkBase: number;
  height: number;
  treeType: TreeType;
  vineDir?: number
}