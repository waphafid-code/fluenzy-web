import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../export/route';
import { escapeCsvCell } from '@/lib/server/csvSanitizer';
import { resetRateLimiter } from '@/lib/server/rateLimiter';

// Mock prisma database
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    answerLog: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'log-1',
          userId: 'user-abc-123456',
          createdAt: new Date('2026-03-01T10:00:00Z'),
          exerciseType: 'chunk_repetition',
          isCorrect: true,
          errorType: null,
          responseTimeMs: 1200,
          hintUsed: false,
          skill: { name: 'Present Perfect Simple' },
        },
      ]),
    },
    userSkillMastery: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'm-1',
          userId: 'user-abc-123456',
          skill: { name: 'Past Participle Regular' },
          mastery: 0.85,
          attempts: 10,
          correctCount: 9,
          avgResponseTimeMs: 1100,
          lastPracticedAt: new Date('2026-03-01T10:00:00Z'),
        },
      ]),
    },
    susFeedback: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'sus-1',
          userId: 'user-abc-123456',
          createdAt: new Date('2026-03-01T10:00:00Z'),
          responses: JSON.stringify([5, 1, 5, 1, 5, 1, 5, 1, 5, 1]),
          susScore: 100,
          feedback: 'Sangat praktis dan modern!',
        },
      ]),
    },
  },
}));

describe('Whitebox Security & Logic Audit: /api/research/export', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('menolak akses tanpa kunci otorisasi (401 Unauthorized)', async () => {
    const req = new Request('http://localhost:3000/api/research/export?type=answers', {
      method: 'GET',
    });
    const res = await GET(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toContain('Akses ditolak');
  });

  it('menolak akses dengan kunci otorisasi palsu / salah (401 Unauthorized)', async () => {
    const req = new Request('http://localhost:3000/api/research/export?type=answers&key=hacker-fake-key', {
      method: 'GET',
      headers: {
        'x-admin-key': 'wrong-password',
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('mengizinkan ekspor dataset answers dengan kunci yang sah via Query Param', async () => {
    const req = new Request('http://localhost:3000/api/research/export?type=answers&key=fluenzy-thesis-2026', {
      method: 'GET',
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/csv');

    const csvText = await res.text();
    expect(csvText).toContain('user_hash,timestamp,skill_name');
    expect(csvText).toContain('USR_123456');
    expect(csvText).toContain('Present Perfect Simple');
  });

  it('mengizinkan ekspor dengan kunci sah via Header x-admin-key', async () => {
    const req = new Request('http://localhost:3000/api/research/export?type=prepost', {
      method: 'GET',
      headers: {
        'x-admin-key': 'fluenzy-thesis-2026',
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const csvText = await res.text();
    expect(csvText).toContain('normalized_gain_hake');
    expect(csvText).toContain('High');
  });

  it('mencegah CSV Formula Injection (CWE-1236)', () => {
    expect(escapeCsvCell('=cmd|\' /C calc\'!A0')).toBe('"\'=cmd|\' /C calc\'!A0"');
    expect(escapeCsvCell('+12345')).toBe('"\'+12345"');
    expect(escapeCsvCell('-SUM(A1:A10)')).toBe('"\' -SUM(A1:A10)"'.replace(' ', ''));
    expect(escapeCsvCell('@evil.com')).toBe('"\'@evil.com"');
    expect(escapeCsvCell('\tmalicious_tab')).toBe('"\'\tmalicious_tab"');
    expect(escapeCsvCell('Normal Word "with quotes"')).toBe('"Normal Word ""with quotes"""');
    expect(escapeCsvCell(null)).toBe('""');
  });

  it('mengaktifkan proteksi rate limiting setelah melampaui batas 30 request/menit (429)', async () => {
    const validUrl = 'http://localhost:3000/api/research/export?type=answers&key=fluenzy-thesis-2026';

    // Lakukan 30 request pertama yang sah
    for (let i = 0; i < 30; i++) {
      const req = new Request(validUrl, {
        headers: { 'x-forwarded-for': '192.168.1.100' },
      });
      const res = await GET(req);
      expect(res.status).toBe(200);
    }

    // Request ke-31 harus ditolak dengan 429 Too Many Requests
    const floodedReq = new Request(validUrl, {
      headers: { 'x-forwarded-for': '192.168.1.100' },
    });
    const floodedRes = await GET(floodedReq);
    expect(floodedRes.status).toBe(429);

    const json = await floodedRes.json();
    expect(json.error).toContain('Batas kuota ekspor');
  });
});
