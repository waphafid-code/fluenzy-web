/**
 * RATE_LIMITER.TS - Production-Grade Sliding Window Rate Limiter
 *
 * ARSITEKTUR KEAMANAN & DEFENSE-IN-DEPTH:
 * 1. Mencegah Resource Exhaustion / API Denial-of-Service (DoS) pada endpoint komputasi mahal
 *    (TTS, STT, database sync, AI evaluation).
 * 2. Sliding Window Counter:
 *    Mencatat timestamp setiap request dalam rentang windowMs. Menghitung jumlah request
 *    secara presisi tanpa boundary burst flaw (seperti yang sering terjadi pada fixed window).
 * 3. Standard IETF / RFC 6585 Headers:
 *    Menghasilkan header X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After.
 * 4. Memory Safe & Self-Pruning:
 *    Menghapus entri IP yang sudah kedaluwarsa secara otomatis dan membatasi ukuran memori maksimal.
 * 5. Multi-Proxy IP Resolution:
 *    Mendukung Cloudflare cf-connecting-ip, x-real-ip, dan x-forwarded-for.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const MAX_STORE_SIZE = 5000;
const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSec: number;
}

/**
 * Membersihkan record lama di memori jika store melebihi batas kapasitas
 */
function pruneStaleRecords(now: number, windowMs: number): void {
  if (rateLimitStore.size < MAX_STORE_SIZE) return;
  const threshold = now - windowMs;
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => ts > threshold);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Memeriksa apakah request dari client IP/identifier masih dalam batas kuota yang diizinkan.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  pruneStaleRecords(now, windowMs);

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps hanya yang berada di dalam window aktif
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const currentCount = record.timestamps.length;
  const isAllowed = currentCount < maxRequests;

  if (isAllowed) {
    record.timestamps.push(now);
  }

  const oldestTimestamp = record.timestamps[0] || now;
  const resetTimeMs = oldestTimestamp + windowMs;
  const retryAfterSec = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));
  const remaining = Math.max(0, maxRequests - record.timestamps.length);

  return {
    isAllowed,
    limit: maxRequests,
    remaining,
    resetTimeMs,
    retryAfterSec,
  };
}

/**
 * Menghasilkan objek Header HTTP standar RFC 6585 untuk respons API
 */
export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTimeMs / 1000)),
  };

  if (!result.isAllowed) {
    headers['Retry-After'] = String(result.retryAfterSec);
  }

  return headers;
}

/**
 * Mengambil IP klien dari request headers Next.js (Cloudflare, x-forwarded-for, atau x-real-ip)
 */
export function getClientIp(request: Request): string {
  // 1. Cloudflare direct edge header
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp && cfConnectingIp.trim().length > 0) {
    return cfConnectingIp.trim();
  }

  // 2. Standard proxy x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // 3. Nginx / AWS ALB x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return '127.0.0.1';
}

/**
 * Mengosongkan store rate limiter (berguna untuk pengujian unit test terisolasi)
 */
export function resetRateLimiter(): void {
  rateLimitStore.clear();
}


