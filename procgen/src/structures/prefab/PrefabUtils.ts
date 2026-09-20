
//gE
export function worldToPrefabX(
  prefabPlacement: any, 
  worldX: number
) {
  let localX = worldX - prefabPlacement.anchorX;

  if (prefabPlacement.xRotationOffset !== null) {
    localX = prefabPlacement.xRotationOffset - localX;
  }

  return localX;
}

//yE
export function worldToPrefabZ(
  prefabPlacement: any, 
  worldZ: number
) {
  let localZ = worldZ - prefabPlacement.anchorZ;

  if (prefabPlacement.zRotationOffset !== null) {
    localZ = prefabPlacement.zRotationOffset - localZ;
  }

  return localZ;
}

//OE
export function prefabToWorldX(
  prefabPlacement: any,
  localX: number,
  localZ: number
) {
  const rotatedCoordinate = prefabPlacement.shouldSwapXZ ? localZ : localX;

  if (prefabPlacement.xRotationOffset !== null) {
    return prefabPlacement.xRotationOffset - rotatedCoordinate + prefabPlacement.anchorX;
  }

  return rotatedCoordinate + prefabPlacement.anchorX;
}

//kR
export function prefabToWorldZ(
  prefabPlacement: any,
  localX: number,
  localZ: number
) {
  const rotatedCoordinate = prefabPlacement.shouldSwapXZ ? localX : localZ;

  if (prefabPlacement.zRotationOffset !== null) {
    return prefabPlacement.zRotationOffset - rotatedCoordinate + prefabPlacement.anchorZ;
  }

  return rotatedCoordinate + prefabPlacement.anchorZ;
}