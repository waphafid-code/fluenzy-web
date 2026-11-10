import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase Server
const mockGetUser = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Mock Prisma
const mockFindUser = vi.fn();
const mockCreateUser = vi.fn();
const mockFindQuestion = vi.fn();
const mockUpsertMastery = vi.fn();
const mockFindSchedule = vi.fn();
const mockUpsertSchedule = vi.fn();
const mockUpdateStats = vi.fn();
const mockCreateLog = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findFirst: (...args: unknown[]) => mockFindUser(...args),
      create: (...args: unknown[]) => mockCreateUser(...args),
    },
    question: {
      findUnique: (...args: unknown[]) => mockFindQuestion(...args),
    },
    userSkillMastery: {
      findUnique: vi.fn(async () => null),
      upsert: (...args: unknown[]) => mockUpsertMastery(...args),
    },
    reviewSchedule: {
      findUnique: (...args: unknown[]) => mockFindSchedule(...args),
      upsert: (...args: unknown[]) => mockUpsertSchedule(...args),
    },
    userStats: {
      update: (...args: unknown[]) => mockUpdateStats(...args),
    },
    dailyActivity: {
      upsert: vi.fn(),
    },
    answerLog: {
      create: (...args: unknown[]) => mockCreateLog(...args),
    },
  },
}));

// Mock AI Explain
vi.mock('@/lib/ai/explain', () => ({
  explainMistake: vi.fn(async () => ({
    explanation: 'Test explanation',
    source: 'mock',
  })),
}));

import { POST } from '../route';

describe('/api/session/answer Security & Data Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindQuestion.mockResolvedValue({
      id: 'q123',
      skillId: 's1',
      prompt: 'I ___ to school',
      payload: JSON.stringify({ correctAnswer: 'go' }),
      explanation: 'Use go for simple present with I',
      difficulty: 1,
      skill: { id: 's1', name: 'Grammar' },
    });
  });

  it('strictly sandboxes unauthenticated requests into guest account and ignores spoofed userEmail', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockFindUser.mockResolvedValue({
      id: 'guest_user_1',
      email: 'guest_sess_123@guest.fluenzy.local',
      stats: { hearts: 5, totalXp: 100 },
    });

    const req = new Request('http://localhost:3000/api/session/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: 'q123',
        userAnswer: 'go',
        guestId: 'sess_123',
        userEmail: 'victim@fluenzy.id', // Spoofed target
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    // Verify Prisma findFirst was called for guest_sess_123, NOT victim@fluenzy.id or budi@fluenzy.id
    expect(mockFindUser).toHaveBeenCalledWith({
      where: { email: 'guest_sess_123@guest.fluenzy.local' },
      include: { stats: true },
    });
  });

  it('binds to verified Supabase authenticated user email when present', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'auth_usr_99',
          email: 'student@universitas.ac.id',
          user_metadata: { full_name: 'Budi Santoso' },
        },
      },
    });

    mockFindUser.mockResolvedValue({
      id: 'db_usr_99',
      email: 'student@universitas.ac.id',
      stats: { hearts: 5, totalXp: 250 },
    });

    const req = new Request('http://localhost:3000/api/session/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: 'q123',
        userAnswer: 'go',
        userEmail: 'attacker_override@fluenzy.id', // Attempt to override
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    // Verified authEmail takes precedence
    expect(mockFindUser).toHaveBeenCalledWith({
      where: { email: 'student@universitas.ac.id' },
      include: { stats: true },
    });
  });
});
