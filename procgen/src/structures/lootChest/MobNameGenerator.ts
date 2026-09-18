import { mobNamePrefixDistribution } from "./LootChestDatas.js";

export class MobNameGenerator {
  mobType: string;

  constructor(mobType: string) {
    this.mobType = mobType;
  }

  sample(random: any): {
    customDisplayName: string;
    customAttributes: {
      mobSettings: {
        name: string;
      };
    };
  } {
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