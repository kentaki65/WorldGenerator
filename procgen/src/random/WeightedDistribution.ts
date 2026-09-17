import { WeightedItem } from "@/core/types.js";
import { SeededRandom } from "@/noise/SeededRandom.js";

interface DistributionItem {
  cumulativeProbability: number;
  value: number;
}

export class WeightedDistribution {
  distribution: DistributionItem[]

  constructor(items: WeightedItem[]) {
    if (items.length <= 0) {
      throw new Error(
        `Distribution must have at least one item: ${JSON.stringify(items)}`
      );
    }

    const values = new Set();
    let totalWeight = 0;

    for (const item of items) {
      const value = item.value;

      if (values.has(value)) {
        throw new Error(`Values must be unique: ${JSON.stringify(items)}`);
      }

      values.add(value);

      const weight = item.weight;

      if (weight <= 0) {
        throw new Error(`Weights must be positive: ${JSON.stringify(items)}`);
      }

      totalWeight += weight;
    }

    let cumulativeProbability = 0;

    this.distribution = items.map(item => {
      const { weight, value } = item;

      cumulativeProbability += weight / totalWeight;

      return { cumulativeProbability, value };
    });
  }

  sample(random: SeededRandom) {
    const randomValue = random.next();

    for (const item of this.distribution) {
      if (randomValue < item.cumulativeProbability) {
        return item.value;
      }
    }

    const fallback = this.distribution[this.distribution.length - 1];
    if(fallback === undefined) return;

    return fallback.value;
  }
}