import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  getClientIp,
  buildRateLimitHeaders,
  resetRateLimiter,
} from '../rateLimiter';

describe('Sliding Window Rate Limiter Engine', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('mengizinkan request di bawah batas limit yang ditentukan', () => {
    const key = 'test-ip-1';
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(key, 5, 10000);
      expect(res.isAllowed).toBe(true);
      expect(res.remaining).toBe(5 - (i + 1));
    }
  });

  it('menolak request (isAllowed = false) ketika melebihi batas kuota', () => {
    const key = 'test-ip-blocked';
    // Gunakan kuota 3
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 10000);
    }

    // Request ke-4 harus ditolak
    const blockedRes = checkRateLimit(key, 3, 10000);
    expect(blockedRes.isAllowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.retryAfterSec).toBeGreaterThan(0);
  });

  it('mengambil client IP secara benar dari header Cloudflare cf-connecting-ip atau x-forwarded-for', () => {
    const reqCloudflare = new Request('http://localhost', {
      headers: { 'cf-connecting-ip': '198.51.100.42' },
    });
    expect(getClientIp(reqCloudflare)).toBe('198.51.100.42');

    const reqWithForwarded = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
    });
    expect(getClientIp(reqWithForwarded)).toBe('203.0.113.195');

    const reqFallback = new Request('http://localhost');
    expect(getClientIp(reqFallback)).toBe('127.0.0.1');
  });

  it('menghasilkan header HTTP standar RFC 6585 dengan benar', () => {
    const allowed = checkRateLimit('test-headers', 10, 60000);
    const headersAllowed = buildRateLimitHeaders(allowed);
    expect(headersAllowed['X-RateLimit-Limit']).toBe('10');
    expect(headersAllowed['X-RateLimit-Remaining']).toBe('9');
    expect(headersAllowed['Retry-After']).toBeUndefined();

    // Trigger block
    for (let i = 0; i < 9; i++) {
      checkRateLimit('test-headers', 10, 60000);
    }
    const blocked = checkRateLimit('test-headers', 10, 60000);
    const headersBlocked = buildRateLimitHeaders(blocked);
    expect(headersBlocked['X-RateLimit-Remaining']).toBe('0');
    expect(headersBlocked['Retry-After']).toBeDefined();
    expect(Number(headersBlocked['Retry-After'])).toBeGreaterThan(0);
  });
});


