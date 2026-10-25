import type { NextFunction, Request, Response } from "express";
import redis from "../redisClient.js";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const sid = req.cookies.sid;
  if (!sid) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const userId = await redis.get(`SESSION:${sid}`);
  if (!userId) {
    res.status(401).json({ error: "Session expired" });
    return;
  }

  // sliding-TTL: renew 4h from now
  await redis.expire(`SESSION:${sid}`, 60 * 60 * 4);

  req.userId = userId;

  next();
}
