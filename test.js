// scripts/genBlockNames.ts
import fs from "node:fs";

const json = JSON.parse(
  fs.readFileSync("./procgen/src/core/blockMetadata.json", "utf-8")
);

const names = Object.keys(json);

const out =
  `// auto-generated. do not edit.\n` +
  `export const BLOCK_NAMES = ${JSON.stringify(names, null, 2)} as const;\n` +
  `export type BlockName = (typeof BLOCK_NAMES)[number];\n`;

fs.writeFileSync("./procgen/src/core/blockNames.generated.ts", out);
console.log(`generated ${names.length} block names`);