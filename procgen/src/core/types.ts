import blockMetadata from "./blockMetadata.json" with { type: "json"};

export type Seed = number | string;

export type Vec3 = [number, number, number];
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

export interface WeightedItem {
  value: number;
  weight: number;
}

export interface TTLCacheOption {
  ttl: number;
  max: number;
  updateAgeOnGet: boolean;
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