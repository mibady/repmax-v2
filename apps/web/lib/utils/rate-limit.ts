import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  try {
    ratelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      analytics: true,
      prefix: 'repmax-ratelimit',
    });
    return ratelimit;
  } catch {
    return null;
  }
}

export async function rateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const limiter = getRatelimit();
  if (!limiter) return { success: true, remaining: -1 };

  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  } catch {
    return { success: true, remaining: -1 };
  }
}
