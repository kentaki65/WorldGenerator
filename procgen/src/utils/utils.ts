import { BlockMetadata, BlockName } from "@/core/types.js";

export function isFalsy(value: any): boolean {
  return value === undefined || value === null;
}

export function getBlockId(blockName: BlockName, blockMetadata: BlockMetadata): number {
  if (blockName === "Air") {
    return 0;
  }
  const metadata = blockMetadata as Record<string, { id: number } | undefined>;
  const blockData = metadata[blockName];
  
  return blockData?.id ?? 0; 
}
