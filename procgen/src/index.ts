import { blockMetadata } from "./core/blockMetadata.js";
import { WorldGenerator } from "./generator/WorldGenerator.js";

import ndarray from "ndarray";
import * as fs from 'fs';

const CHUNK_SIZE = 32;

// ===== 生成するチャンク数 =====
const CHUNK_COUNT_X = 10;
const CHUNK_COUNT_Y = 3;
const CHUNK_COUNT_Z = 10;

// ===== 生成開始座標 =====
const START_CHUNK_X = 0;
const START_CHUNK_Y = -32;
const START_CHUNK_Z = 0;

const seed = "vast_ridge_755876";

const itemMetadata = {};

const fixedPointPrefabs: any[] = [];

const worldScale = 1;

const generator = new WorldGenerator(
  CHUNK_SIZE,
  blockMetadata,
  itemMetadata,
  seed,
  false,
  fixedPointPrefabs,
  worldScale
);

const chunks: {
  chunkX: number;
  chunkY: number;
  chunkZ: number;
  data: Uint16Array;
}[] = [];

for (let x = 0; x < CHUNK_COUNT_X; x++) {
  for (let y = 0; y < CHUNK_COUNT_Y; y++) {
    for (let z = 0; z < CHUNK_COUNT_Z; z++) {

      const chunkX =
        START_CHUNK_X + x * CHUNK_SIZE;

      const chunkY =
        START_CHUNK_Y + y * CHUNK_SIZE;

      const chunkZ =
        START_CHUNK_Z + z * CHUNK_SIZE;

      const chunk = ndarray(
        new Uint16Array(
          CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE
        ),
        [
          CHUNK_SIZE,
          CHUNK_SIZE,
          CHUNK_SIZE
        ]
      );

      console.log(
        `Generating chunk (${chunkX}, ${chunkY}, ${chunkZ})...`
      );

      generator.getChunk(
        chunk,
        chunkX,
        chunkY,
        chunkZ
      );

      chunks.push({
        chunkX,
        chunkY,
        chunkZ,
        data: chunk.data
      });

      console.log("Generation finished!");
    }
  }
}

const outputPath = "C:\\Users\\kenta\\Downloads\\bloxd Generator\\procgen\\viewer\\chunkData.js";

const output = `export const chunks = [
${chunks
  .map(
    chunk => `  {
    chunkX: ${chunk.chunkX},
    chunkY: ${chunk.chunkY},
    chunkZ: ${chunk.chunkZ},
    data: new Uint16Array([
      ${Array.from(chunk.data).join(",")}
    ])
  }`
  )
  .join(",\n")}
];
`;

fs.writeFileSync(
  outputPath,
  output,
  "utf8"
);

console.log(
  `Wrote ${chunks.length} chunks to ${outputPath}`
);