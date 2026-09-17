export class PartitionTTLCache {
  getGlobalKey: any;
  globalTTLCache: any;

  constructor(getGlobalKey: any, globalTTLCache: any) {
    this.getGlobalKey = getGlobalKey;
    this.globalTTLCache = globalTTLCache;
  }

  get(key: any): any {
    const globalKey = this.getGlobalKey(key);
    return this.globalTTLCache.get(globalKey);
  }

  set(key: any, value: any): void {
    const globalKey = this.getGlobalKey(key);
    this.globalTTLCache.set(globalKey, value);
  }

  delete(key: any): boolean {
    const globalKey = this.getGlobalKey(key);
    return this.globalTTLCache.delete(globalKey);
  }
}