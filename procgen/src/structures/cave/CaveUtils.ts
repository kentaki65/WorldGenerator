import { CaveField, OUT_OF_RUNGE_NUMBER } from "@/core/constants.js";
import { BlockMetadata, BlockName, CaveInterval, ClusterSettings, Vec3 } from "@/core/types.js";
import { CaveDataProvider } from "./CaveDataProvider.js";

interface BlockOffsetOptions {
  includeDown: boolean;
  includeSides: boolean;
  includeUp: boolean;
}

interface BlockOffset {
  offset: Vec3;
  blockId: number;
}

const down: Vec3 = [0, -1, 0];
const up: Vec3 = [0, 1, 0];
const west: Vec3 = [-1, 0, 0];
const east: Vec3 = [1, 0, 0];
const north: Vec3 = [0, 0, -1];
const south: Vec3 = [0, 0, 1];

//xI
export function mergeCaveIntervals(
  intervals: CaveInterval[],
  floorY: number,
  ceilingY: number
): void {
  let index = 0;

  while (index < intervals.length) {
    const interval = intervals[index]!;

    if (floorY > interval.ceilingY) {
      break;
    }

    if (ceilingY < interval.floorY) {
      index++;
    } else {
      floorY = Math.min(interval.floorY, floorY);
      ceilingY = Math.max(interval.ceilingY, ceilingY);
      intervals.splice(index, 1);
    }
  }

  intervals.splice(index, 0, {
    floorY,
    ceilingY,
  });
}

//bI
export function collectCaveIntervals(
  x: number,
  z: number,
  caveHeightmapVals: any,
  skipSolidCaveTypes: boolean,
  intervals: CaveInterval[]
): void {
  for (let caveType = 0; caveType < caveHeightmapVals.numCaveTypes; caveType++) {
    if (
      skipSolidCaveTypes &&
      caveHeightmapVals.caveTypeToBlockIds[caveType] !== 0
    ) {
      continue;
    }

    const floorY = caveHeightmapVals.getOrGenerate(x, z, caveType, CaveField.FloorY);

    if (floorY === OUT_OF_RUNGE_NUMBER.NO_CAVE_NUMBER) {
      continue;
    }

    mergeCaveIntervals(
      intervals,
      floorY,
      caveHeightmapVals.getOrGenerate(x, z, caveType, CaveField.CeilingY)
    );
  }
}

//SI
export function getCaveIntervals(
  x: number,
  z: number,
  caveHeightmapVals: any,
  skipSolidCaveTypes: boolean
): CaveInterval[] {
  const intervals: CaveInterval[] = [];

  collectCaveIntervals(
    x,
    z,
    caveHeightmapVals,
    skipSolidCaveTypes,
    intervals
  );

  return intervals;
}

export function getBlockOffsets(
  blockMetadata: BlockMetadata,
  blockName: BlockName,
  options: BlockOffsetOptions
): BlockOffset[] {
  const result: BlockOffset[] = [];

  if (options.includeDown) {
    result.push({
      offset: down,
      blockId: blockMetadata[blockName].id
    });
  }

  if (options.includeSides) {
    result.push(
      {
        offset: west,
        blockId: blockMetadata[`${blockName}|meta|rot2|side`].id
      },
      {
        offset: east,
        blockId: blockMetadata[`${blockName}|meta|rot4|side`].id
      },
      {
        offset: north,
        blockId: blockMetadata[`${blockName}|meta|rot1|side`].id
      },
      {
        offset: south,
        blockId: blockMetadata[`${blockName}|meta|rot3|side`].id
      }
    );
  }

  if (options.includeUp) {
    result.push({
      offset: up,
      blockId: blockMetadata[`${blockName}|meta|rot1|top`].id
    });
  }

  return result;
}

//修正必要

export function createClusterSettings(
  blockMetadata: BlockMetadata,
  clusterConfigs: ClusterSettings[] | null
) {
  if (clusterConfigs === null) {
    return [
      {
        seedPrefix: "crystal",
        anchorOptions: getBlockOffsets(blockMetadata, "Crystal", {
          includeDown: true,
          includeSides: true,
          includeUp: true
        }),
        clusterBoxSize: 4,
        yI: 0.8,
        oI: 0,
        mE: 0.12,
        ZI: 0.25,
        shallowClusterY: -20,
        deepClusterY: -85
      },
      {
        seedPrefix: "mushroom",
        anchorOptions: getBlockOffsets(blockMetadata, "Glowing Mushroom", {
          includeDown: true,
          includeSides: true,
          includeUp: false
        }),
        clusterBoxSize: 4,
        yI: 0.7,
        oI: 2,
        mE: 0.58
      }
    ];
  }

  return clusterConfigs.map(clusterConfig => {
    const clusterYSettings = clusterConfig.kE;

    return {
      seedPrefix: clusterConfig.blockName,
      anchorOptions: getBlockOffsets(blockMetadata, clusterConfig.blockName, {
        includeDown: clusterConfig.qI,
        includeSides: clusterConfig.LI,
        includeUp: clusterConfig.gI
      }),
      clusterBoxSize: 4,
      yI: clusterConfig.yI,
      oI: clusterConfig.oI,
      mE: clusterConfig.mE,
      ZI: clusterYSettings?.ZI,
      shallowClusterY: clusterYSettings?.CI,
      deepClusterY: clusterYSettings?.cI
    };
  });
}

export function isPositionAvailable(
  x: number,
  y: number,
  z: number,
  caveDataProvider: CaveDataProvider
) {
  if (y > caveDataProvider.getGroundHeight(x, z)) {
    return false;
  }

  const caveIntervals = caveDataProvider.getAllCaves(x, z);

  for (const caveInterval of caveIntervals) {
    if (y >= caveInterval.floorY && y <= caveInterval.ceilingY) {
      return false;
    }
  }

  return true;
}

export function selectAvailableOffset(
  x: number,
  y: number,
  z: number,
  offsets: any[],
  randomValue: number,
  caveDataProvider: CaveDataProvider
) {
  let downOffset = null;
  const availableOffsets = [];

  for (const offset of offsets) {
    if (
      isPositionAvailable(
        x + offset.offset[0],
        y + offset.offset[1],
        z + offset.offset[2],
        caveDataProvider
      )
    ) {
      if (offset.offset === down) {
        downOffset = offset;
      } else {
        availableOffsets.push(offset);
      }
    }
  }

  if (downOffset !== null) {
    return downOffset;
  }

  if (availableOffsets.length === 0) {
    return null;
  }

  return availableOffsets[Math.floor(randomValue * availableOffsets.length)];
}