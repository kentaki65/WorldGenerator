import { Plains } from "./Plains.js";

export class TallGrassPlains extends Plains {
  constructor() {
    super(...arguments);
    this.grassChance = 0.06;
    this.tallGrassChance = 0.12;
  }
}