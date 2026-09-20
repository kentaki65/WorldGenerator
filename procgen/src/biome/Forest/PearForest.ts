import { Forest } from "./Forest.js";

export class PearForest extends Forest {
  constructor() {
    super(...arguments);
    this.melonChance = 30;
    this.aspenTreeChance = 0;
    this.pearTreeChance = 1;
  }
}