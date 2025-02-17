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

export { checkCache, memcached, requestDataBasedOnCache };
