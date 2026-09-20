import { Desert } from "./Desert.js";

export class CactusDesert extends Desert {
  constructor() {
    super(...arguments);
    this.cactusChance = 0.05;
  }
}