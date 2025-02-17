import Memcached from 'memcached';
import { Request, Response, NextFunction } from 'express';

const servers = process.env.MEMCACHIER_SERVERS || '';

const memcached = new Memcached(servers);

const checkCache = (req: Request, res: Response, next: NextFunction) => {
  const key = req.originalUrl;
  memcached.get(key, (err, cachedData) => {
    if (cachedData) {
      return res.json(cachedData);
    }
    next();
  });
};

const requestDataBasedOnCache = (req: Request, res: Response, data: any) => {
  const key = req.originalUrl;
  memcached.set(key, data, 60, (err) => {
    if (err) console.error(err);
  });
  res.json(data);
};

export { checkCache, memcached, requestDataBasedOnCache };
