import { TTLCacheOption } from "@/core/types.js";
import { TTLCache } from "@isaacs/ttlcache";
import { PartitionTTLCache } from "./PartitionTTLCache.js";


export class PartitionedTTLCache {
  static DEFAULT_KEY_SEPARATOR = "$";
  nextUniquePartitionId: number;
  keySeparator: string;
  globalTTLCache: TTLCache;

  constructor(options: TTLCacheOption) {
    this.nextUniquePartitionId = 0;
    this.keySeparator = options.keySeparator;

    this.globalTTLCache = new TTLCache({
      ttl: options.ttl,
      max: options.max,
      updateAgeOnGet: options.updateAgeOnGet
    });
  }

  partitionTTLCache() {
    const partitionId = this.nextUniquePartitionId++;

    return new PartitionTTLCache(
      (key: string) => this.getKeyForPartition(partitionId, key),
      this.globalTTLCache
    );
  }

  getKeyForPartition(partitionId: number, key: string) {
    return `${partitionId}${this.keySeparator}${key}`;
  }
}