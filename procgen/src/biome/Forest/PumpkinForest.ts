import { Forest } from "./Forest.js";

export class PumpkinForest extends Forest {
  constructor() {
    super(...arguments);
    this.pumpkinChance = 30;
    this.melonChance = 0;
    this.aspenTreeChance = 0;
    this.plumTreeChance = 1;
  }
}