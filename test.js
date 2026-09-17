import fs from 'node:fs';

let blockMetadata = JSON.parse(
  fs.readFileSync("C:/Users/kenta/Downloads/20260913-0827_e19ece4f42ec125ee7f88d5a2cba2dc8.json", "utf8")
);

blockMetadata = Object.keys(blockMetadata)

const outputPath = "C:/Users/kenta/Downloads/bloxd Generator/output.js";
fs.writeFileSync(outputPath, JSON.stringify(blockMetadata, null, 2), "utf8");

console.log("ファイルの出力が完了しました！");
