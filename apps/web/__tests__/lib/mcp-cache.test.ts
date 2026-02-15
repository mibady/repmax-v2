import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCached, setCache } from '@/lib/utils/mcp-cache';

describe('mcp-cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear any leftover cache entries by advancing past any TTL
    vi.advanceTimersByTime(10 * 60 * 1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('set then get returns correct data', () => {
    const payload = { zones: ['WEST', 'MIDWEST'], count: 42 };
    setCache('zone-stats', payload);
    const result = getCached<typeof payload>('zone-stats');
    expect(result).toEqual(payload);
  });

  it('get with unknown key returns null', () => {
    const result = getCached('nonexistent-key');
    expect(result).toBeNull();
  });

  it('get after TTL expires returns null', () => {
    setCache('expiring', { value: 'temp' });

    // Still valid right before expiry (5 min default)
    vi.advanceTimersByTime(4 * 60 * 1000);
    expect(getCached('expiring')).toEqual({ value: 'temp' });

    // Expire it (advance past 5 min total)
    vi.advanceTimersByTime(2 * 60 * 1000);
    expect(getCached('expiring')).toBeNull();
  });

  it('custom TTL parameter works', () => {
    const shortTTL = 1000; // 1 second
    setCache('short-lived', 'data', shortTTL);

    // Still valid
    vi.advanceTimersByTime(500);
    expect(getCached('short-lived')).toBe('data');

    // Expired
    vi.advanceTimersByTime(600);
    expect(getCached('short-lived')).toBeNull();
  });

  it('overwrite existing key with new data', () => {
    setCache('mutable', { version: 1 });
    expect(getCached('mutable')).toEqual({ version: 1 });

    setCache('mutable', { version: 2 });
    expect(getCached('mutable')).toEqual({ version: 2 });
  });

  it('type parameter on getCached works', () => {
    interface ZoneData {
      code: string;
      states: string[];
    }
    const zone: ZoneData = { code: 'WEST', states: ['CA', 'NV', 'OR'] };
    setCache('typed-zone', zone);

    const result = getCached<ZoneData>('typed-zone');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('WEST');
    expect(result!.states).toContain('CA');
  });
});
