import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimiter';
import { escapeCsvCell } from '@/lib/server/csvSanitizer';

const VALID_RESEARCH_KEY = process.env.RESEARCH_EXPORT_KEY || 'fluenzy-thesis-2026';

function isAuthorized(request: Request, searchParams: URLSearchParams): boolean {
  const adminHeader = request.headers.get('x-admin-key');
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
  const queryKey = searchParams.get('key');

  const providedKey = adminHeader || bearerToken || queryKey;
  return providedKey === VALID_RESEARCH_KEY;
}

export async function GET(request: Request) {
  // 1. Rate Limiting Check (30 requests / minute)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 30, 60000);
  if (!rateLimit.isAllowed) {
    return NextResponse.json(
      { error: 'Batas kuota ekspor terlampaui. Silakan coba beberapa saat lagi.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSec),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // 2. Security Check (Admin / Research Key Authentication)
    if (!isAuthorized(request, searchParams)) {
      return NextResponse.json(
        { error: 'Akses ditolak: Kunci otorisasi riset (admin key) diperlukan untuk mengunduh dataset.' },
        { status: 401 }
      );
    }

    const type = searchParams.get('type') || 'answers'; // 'answers' | 'mastery' | 'prepost'

    if (type === 'answers') {
      const logs = await prisma.answerLog.findMany({
        include: { skill: true },
        orderBy: { createdAt: 'desc' },
      });

      const headers = [
        'user_hash',
        'timestamp',
        'skill_name',
        'exercise_type',
        'is_correct',
        'error_type',
        'response_time_ms',
        'hint_used',
      ];

      const rows = logs.map((l) => [
        `USR_${l.userId.slice(-6)}`,
        l.createdAt.toISOString(),
        escapeCsvCell(l.skill.name),
        l.exerciseType,
        l.isCorrect ? '1' : '0',
        l.errorType || 'none',
        l.responseTimeMs,
        l.hintUsed ? '1' : '0',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="fluenzy_answer_logs.csv"',
        },
      });
    }

    if (type === 'mastery') {
      const masteries = await prisma.userSkillMastery.findMany({
        include: { skill: true },
      });

      const headers = [
        'user_hash',
        'skill_name',
        'mastery_score',
        'attempts',
        'correct_count',
        'accuracy_percent',
        'avg_response_time_ms',
        'last_practiced_at',
      ];

      const rows = masteries.map((m) => {
        const accuracy = m.attempts > 0 ? Math.round((m.correctCount / m.attempts) * 100) : 0;
        return [
          `USR_${m.userId.slice(-6)}`,
          escapeCsvCell(m.skill.name),
          m.mastery.toFixed(4),
          m.attempts,
          m.correctCount,
          accuracy,
          Math.round(m.avgResponseTimeMs),
          m.lastPracticedAt.toISOString(),
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="fluenzy_skill_mastery.csv"',
        },
      });
    }

    if (type === 'prepost') {
      // Hake (1998) Normalized Gain formula: g = (post - pre) / (1 - pre)
      const masteries = await prisma.userSkillMastery.findMany({
        include: { skill: true },
      });

      const headers = [
        'user_hash',
        'skill_name',
        'pre_test_mastery',
        'post_test_mastery',
        'absolute_gain',
        'normalized_gain_hake',
        'gain_category',
      ];

      const rows = masteries.map((m) => {
        const pre = 0.5; // Baseline prior
        const post = m.mastery;
        const absGain = Number((post - pre).toFixed(4));
        const normGain =
          post >= 1
            ? 1.0
            : Number(((post - pre) / (1 - pre)).toFixed(4));
        const category = normGain >= 0.70 ? 'High' : normGain >= 0.30 ? 'Medium' : normGain > 0 ? 'Low' : 'Negative';

        return [
          `USR_${m.userId.slice(-6)}`,
          escapeCsvCell(m.skill.name),
          pre.toFixed(4),
          post.toFixed(4),
          absGain,
          normGain,
          category,
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="fluenzy_prepost_gain_analysis.csv"',
        },
      });
    }

    if (type === 'sus') {
      const susList = await prisma.susFeedback.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const headers = [
        'id',
        'user_hash',
        'timestamp',
        'sus_score',
        'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
        'qualitative_feedback',
      ];

      const rows = susList.map((s) => {
        let qAnswers: string[] = Array(10).fill('');
        try {
          const parsed = JSON.parse(s.responses);
          if (Array.isArray(parsed)) {
            qAnswers = parsed.slice(0, 10).map(String);
          }
        } catch {
          // ignore
        }
        const userHash = s.userId ? `USR_${s.userId.slice(-6)}` : 'GUEST';
        return [
          s.id,
          userHash,
          s.createdAt.toISOString(),
          s.susScore.toFixed(2),
          ...qAnswers,
          escapeCsvCell(s.feedback || ''),
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="fluenzy_sus_evaluation_data.csv"',
        },
      });
    }

    return NextResponse.json({ error: 'Tipe ekspor tidak valid' }, { status: 400 });
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_')) throw error;
    console.error('Failed to export research data:', error);
    return NextResponse.json({ error: 'Gagal mengekspor data' }, { status: 500 });
  }
}
