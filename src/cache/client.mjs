import { Cluster } from "ioredis";

class Cache {
  constructor() {
    this.cluster = new Cluster([
      {
        host: "localhost",
        port: 6379,
      },
      {
        host: "localhost",
        port: 6380,
      },
    ]);
  }

  get client () {
    return this.cluster;
  }
}

export const redisCache = new Cache();