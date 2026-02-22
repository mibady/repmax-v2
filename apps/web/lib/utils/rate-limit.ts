import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let minuteLimiter: Ratelimit | null = null;
let dailyLimiter: Ratelimit | null = null;

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getMinuteLimiter(): Ratelimit | null {
  if (minuteLimiter) return minuteLimiter;
  const redis = getRedis();
  if (!redis) return null;

  minuteLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '60 s'),
    analytics: true,
    prefix: 'repmax-minute',
  });
  return minuteLimiter;
}

function getDailyLimiter(): Ratelimit | null {
  if (dailyLimiter) return dailyLimiter;
  const redis = getRedis();
  if (!redis) return null;

  dailyLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 d'),
    analytics: true,
    prefix: 'repmax-daily',
  });
  return dailyLimiter;
}

export async function rateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const limiter = getMinuteLimiter();
  if (!limiter) return { success: true, remaining: -1 };

  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  } catch {
    return { success: true, remaining: -1 };
  }
}

export async function dailyRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const limiter = getDailyLimiter();
  if (!limiter) return { success: true, remaining: -1 };

  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  } catch {
    return { success: true, remaining: -1 };
  }
}
