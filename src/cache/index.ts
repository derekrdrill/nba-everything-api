import { Request, Response, NextFunction } from 'express';
import memjs from 'memjs';

const memcached = memjs.Client.create(process.env.MEMCACHIER_SERVERS, {
  username: process.env.MEMCACHIER_USERNAME,
  password: process.env.MEMCACHIER_PASSWORD,
  failover: true,
  timeout: 1,
  keepAlive: true,
});

const checkCache = (req: Request, res: Response, next: NextFunction) => {
  const key = req.originalUrl;

  memcached.get(key, (err, cachedData) => {
    if (err) {
      console.error(err);
      return next();
    }

    if (cachedData) {
      const data = JSON.parse(cachedData.toString());
      return res.json(data);
    }
    next();
  });
};

const requestDataBasedOnCache = (req: Request, res: Response, data: any) => {
  const key = req.originalUrl;

  memcached.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error(err);
  });
  res.json(data);
};

class LocalCache {
  private cache = new Map();
  private readonly MAX_TTL = 24 * 60 * 60 * 1000; // 1 day max

  set(key: string, data: any, ttl: number) {
    const cappedTtl = Math.min(ttl, this.MAX_TTL);
    this.cache.set(key, {
      data,
      expires: Date.now() + cappedTtl,
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const localCache = new LocalCache();

export { checkCache, memcached, requestDataBasedOnCache, localCache };
