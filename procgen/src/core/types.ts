import blockMetadata from "./blockMetadata.json" with { type: "json"};

export type Seed = number | string;

export type Vec3 = [number, number, number];

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

export type BlockName = keyof typeof blockMetadata;
export type BlockId = number;

export type NumCaveTypes = number;

export type BlockMetadata = {
  [key in BlockName]?: { id: number;[key: string]: any };
};

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
  distance: number;
  fracAlong: number;
  lineSegmentLength: number;
}

export interface CaveHeightThreshold extends Range {
  midpoint: number;
  width: number;
  halfWidth: number;
}

export interface GroundHeightmap{
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