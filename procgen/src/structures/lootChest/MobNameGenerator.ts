import { ItemAttributes } from "@/core/types.js";
import { mobNamePrefixDistribution } from "../../utils/randomValues.js";

export class MobNameGenerator {
  mobType: string;

  constructor(mobType: string) {
    this.mobType = mobType;
  }

  sample(random: any): ItemAttributes{
    const prefix = mobNamePrefixDistribution.sample(random);
    const name = `${prefix} ${this.mobType}`;

    return {
      customDisplayName: name,
      customAttributes: {
        mobSettings: {
          name,
        },
      },
    };
  }
}