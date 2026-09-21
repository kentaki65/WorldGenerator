import { blockMetadata } from "./core/blockMetadata.js";
import { WorldGenerator } from "./generator/WorldGenerator.js";
import ndarray from "ndarray";

const chunkSize = 32;
const seed = "helloworld";

const chunkX = 0;
const chunkY = 0;
const chunkZ = 0;

const itemMetadata = {};
const fixedPointPrefabs: any[] = [];

const worldScale = 1;

const generator = new WorldGenerator(
  chunkSize,
  blockMetadata,
  itemMetadata,
  seed,
  false,
  fixedPointPrefabs,
  worldScale
);

const chunk = ndarray(
  new Uint16Array(chunkSize * chunkSize * chunkSize),
  [chunkSize, chunkSize, chunkSize]
);

console.log("Generating chunk...");

const result = generator.getChunk(
  chunk,
  chunkX,
  chunkY,
  chunkZ
);

console.log("Generation finished!");
console.log("Result:", result);
console.log("Chunk shape:", chunk.shape);
console.log("Chunk data length:", chunk.data.length);
console.log("First values:", chunk.data.slice(0, 20));

console.log(chunk.get(0, 0, 0));
console.log(chunk.get(0, 0, 1));
console.log(chunk.get(0, 1, 0));
console.log(chunk.get(1, 0, 0));