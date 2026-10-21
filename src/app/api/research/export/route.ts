import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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
        `"${l.skill.name.replace(/"/g, '""')}"`,
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
          `"${m.skill.name.replace(/"/g, '""')}"`,
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
      ];

      const rows = masteries.map((m) => {
        const pre = 0.5; // Baseline prior
        const post = m.mastery;
        const absGain = Number((post - pre).toFixed(4));
        const normGain =
          post >= 1
            ? 1.0
            : Number(((post - pre) / (1 - pre)).toFixed(4));

        return [
          `USR_${m.userId.slice(-6)}`,
          `"${m.skill.name.replace(/"/g, '""')}"`,
          pre.toFixed(4),
          post.toFixed(4),
          absGain,
          normGain,
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

    return NextResponse.json({ error: 'Tipe ekspor tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Failed to export research data:', error);
    return NextResponse.json({ error: 'Gagal mengekspor data' }, { status: 500 });
  }
}
