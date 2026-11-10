import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../progress/route';
import { resetRateLimiter } from '@/lib/server/rateLimiter';

// Mock prisma database with hoisted variable
const { mockUser } = vi.hoisted(() => ({
  mockUser: {
    id: 'usr-mock-123',
    email: 'learner@fluenzy.id',
    stats: {
      id: 'stats-mock-123',
      totalXp: 150,
      currentStreak: 3,
      gems: 50,
      hearts: 5,
    },
  },
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn().mockImplementation(async () => mockUser),
      create: vi.fn(),
    },
    userStats: {
      update: vi.fn().mockResolvedValue(mockUser.stats),
      findUnique: vi.fn().mockResolvedValue(mockUser.stats),
    },
  },
}));

describe('Whitebox Security & Boundary Audit: /api/sync/progress', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('mengembalikan 400 Bad Request jika payload request bukan JSON valid (fuzzing non-JSON)', async () => {
    const req = new Request('http://localhost:3000/api/sync/progress', {
      method: 'POST',
      body: 'MALFORMED_NON_JSON_CORRUPT_PAYLOAD{{{{',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Invalid JSON payload');
  });

  it('melakukan sanitasi dan clamping batas nilai negatif dan ekstrem (Boundary Value Analysis)', async () => {
    const req = new Request('http://localhost:3000/api/sync/progress', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'usr-mock-123',
        email: 'attacker@evil.com',
        xp: -999999, // Nilai negatif
        streak: 999999999, // Nilai luar batas
        gems: -50,
        hearts: 999, // Melebihi batas nyawa maksimum (5)
        audioSpeed: 100, // Kecepatan audio tidak wajar
        targetAccent: 'invalid_accent_injection',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.stats.targetAccent).toBe('us'); // Fallback ke default aman
    expect(json.stats.audioSpeed).toBeLessThanOrEqual(2.0); // Dibatasi ke batas aman 2.0
  });

  it('memicu proteksi rate limit 429 saat dibombardir melebihi kuota 60 request/menit', async () => {
    const validPayload = JSON.stringify({
      userId: 'usr-mock-123',
      xp: 200,
    });

    for (let i = 0; i < 60; i++) {
      const req = new Request('http://localhost:3000/api/sync/progress', {
        method: 'POST',
        body: validPayload,
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.0.99',
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // Request ke-61 dari IP yang sama harus ditolak 429
    const blockedReq = new Request('http://localhost:3000/api/sync/progress', {
      method: 'POST',
      body: validPayload,
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.99',
      },
    });
    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);
  });
});
