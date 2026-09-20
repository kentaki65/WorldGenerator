function validateCustomWorldGenLayer(layer, blockMetadata) {
  if (layer.minY >= layer.maxY) {
    throw new Error(`Custom world-gen layer has minY (${layer.minY}) >= maxY (${layer.maxY})`);
  }

  if (
    layer.minY % AH !== 0 ||
    layer.maxY % AH !== 0 ||
    layer.groundY % AH !== 0
  ) {
    throw new Error(
      `Custom world-gen layer bounds must be multiples of chunkSize (${AH}); got minY=${layer.minY}, maxY=${layer.maxY}, groundY=${layer.groundY}`
    );
  }

  (function (caveSettings, blockMetadata) {
    if (SH(caveSettings.lavaPitBlock, blockMetadata) === undefined) {
      throw new Error(
        `Custom world-gen caves lavaPitBlock "${caveSettings.lavaPitBlock}" not found in blockMetadata`
      );
    }

    if (caveSettings.decorations) {
      for (const decoration of caveSettings.decorations) {
        validateCaveDecoration(decoration, blockMetadata);
      }
    }
  })(layer.caves, blockMetadata);

  if (layer.biomes.length === 0) {
    throw new Error("Custom world-gen layer must have at least one biome");
  }

  let totalFrequency = 0;

  for (const biome of layer.biomes) {
    validateCustomBiome(biome, blockMetadata);
    totalFrequency += biome.frequency;
  }

  if (totalFrequency <= 0) {
    throw new Error("Custom world-gen layer biome frequencies must sum to > 0");
  }

  for (const ore of layer.ores) {
    validateCustomOre(ore, blockMetadata);
  }
}

function validateCaveDecoration(decoration, blockMetadata) {
  const {
    blockName,
    qI: allowFloor,
    LI: allowWalls,
    gI: allowCeiling
  } = decoration;

  if (SH(blockName, blockMetadata) === undefined) {
    throw new Error(
      `Custom world-gen cave decoration blockName "${blockName}" not found in blockMetadata`
    );
  }

  if (!allowFloor && !allowWalls && !allowCeiling) {
    throw new Error(
      `Custom world-gen cave decoration "${blockName}" must allow at least one of floor/walls/ceiling anchoring`
    );
  }

  if (allowWalls) {
    for (const sideVariant of [
      "meta|rot1|side",
      "meta|rot2|side",
      "meta|rot3|side",
      "meta|rot4|side"
    ]) {
      validateDirectionalVariant(blockName, sideVariant, blockMetadata);
    }
  }

  if (allowCeiling) {
    validateDirectionalVariant(blockName, "meta|rot1|top", blockMetadata);
  }

  validateProbability(decoration.mE, blockName, "mE");
  validateProbability(decoration.yI, blockName, "yI");

  if (!Number.isInteger(decoration.oI) || decoration.oI < 0) {
    throw new Error(
      `Custom world-gen cave decoration "${blockName}" minPlacements must be a non-negative integer, got ${decoration.oI}`
    );
  }

  if (
    !GH(decoration.kE) &&
    (
      validateProbability(
        decoration.kE.ZI,
        blockName,
        "depthRamp.deepClusterChance"
      ),
      decoration.kE.CI <= decoration.kE.cI
    )
  ) {
    throw new Error(
      `Custom world-gen cave decoration "${blockName}" deepY must be strictly smaller than shallowY, but ${decoration.kE.CI} <= ${decoration.kE.cI} `
    );
  }
}

function validateDirectionalVariant(blockName, variant, blockMetadata) {
  const directionalBlockName = `${blockName}|${variant}`;

  if (SH(directionalBlockName, blockMetadata) === undefined) {
    throw new Error(
      `Custom world-gen cave decoration "${blockName}" is missing directional variant "${directionalBlockName}" required for wall/ceiling anchoring`
    );
  }
}

function validateProbability(value, blockName, propertyName) {
  if (value < 0 || value > 1) {
    throw new Error(
      `Custom world-gen cave decoration "${blockName}" ${propertyName} must be in [0, 1], got ${value}`
    );
  }
}

function validateCustomBiome(biome, blockMetadata) {
  if (biome.frequency <= 0) {
    throw new Error(
      `Custom world-gen biome frequency must be positive, got ${biome.frequency}`
    );
  }

  if (SH(biome.iE, blockMetadata) === undefined) {
    throw new Error(
      `Custom world-gen biome topsoilBlock "${biome.iE}" not found in blockMetadata`
    );
  }

  if (SH(biome.DI, blockMetadata) === undefined) {
    throw new Error(
      `Custom world-gen biome lowsoilBlock "${biome.DI}" not found in blockMetadata`
    );
  }

  if (biome.XI.length === 0) {
    throw new Error("Custom world-gen biome must have at least one stoneType");
  }

  for (const stoneType of biome.XI) {
    if (stoneType.frequency <= 0) {
      throw new Error(
        `Custom world-gen biome stoneType frequency must be positive, got ${stoneType.frequency}`
      );
    }

    if (SH(stoneType.blockName, blockMetadata) === undefined) {
      throw new Error(
        `Custom world-gen biome stoneType blockName "${stoneType.blockName}" not found in blockMetadata`
      );
    }
  }
}

function validateCustomOre(ore, blockMetadata) {
  if (SH(ore.blockName, blockMetadata) === undefined) {
    throw new Error(
      `Custom world-gen ore blockName "${ore.blockName}" not found in blockMetadata`
    );
  }

  if (ore.QI < 0) {
    throw new Error(
      `Custom world-gen ore "${ore.blockName}" radius must be >= 0, got ${ore.QI}`
    );
  }

  if (ore.rI <= 0) {
    throw new Error(
      `Custom world-gen ore "${ore.blockName}" minDistBetweenDeposits must be > 0, got ${ore.rI}`
    );
  }

  if (ore.minY > ore.maxY) {
    throw new Error(
      `Custom world-gen ore "${ore.blockName}" minY (${ore.minY}) must be <= maxY (${ore.maxY})`
    );
  }

  if (ore.FI < 0 || ore.FI > 1) {
    throw new Error(
      `Custom world-gen ore "${ore.blockName}" spawnChance must be in [0, 1], got ${ore.FI}`
    );
  }
}