import { BlockId, BlockMetadata, BlockName } from "@/core/types.js";

export function isFalsy(value: any): boolean {
  return value === undefined || value === null;
}

export function getBlockId(
  blockName: BlockName,
  blockMetadata: BlockMetadata
): BlockId {
  if (blockName === "Air") {
    return 0;
  }

  const blockData = blockMetadata[blockName];

  if (blockData === undefined) {
    throw new Error(`Block "${blockName}" not found in blockMetadata`);
  }

  return blockData.id;
}