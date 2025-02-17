import Memcached from 'memcached';
import { Request, Response, NextFunction } from 'express';
import memjs from 'memjs';

const servers = process.env.MEMCACHIER_SERVERS || '';

// const memcached = new Memcached(servers);

const mc = memjs.Client.create(process.env.MEMCACHIER_SERVERS, {
  username: process.env.MEMCACHIER_USERNAME,
  password: process.env.MEMCACHIER_PASSWORD,
  failover: true, // default: false
  timeout: 1, // default: 0.5 (seconds)
  keepAlive: true, // default: false
});

const checkCache = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.originalUrl);
  const key = req.originalUrl;
  mc.get(key, (err, cachedData) => {
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

  mc.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error(err);
  });
  res.json(data);
};

export { checkCache, mc as memcached, requestDataBasedOnCache };
