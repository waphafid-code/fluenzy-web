import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { calculateLazyHearts } from '@/lib/core/gamification';
import { classifyMasteryLevel } from '@/lib/core/mastery';
import {
  calculateErrorTypeDistribution,
  generatePedagogicalInsights,
  formatDailyXpChartData,
  calculateStreakCalendar,
} from '@/lib/core/insights';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email') || 'budi@fluenzy.id';

    // 1. Ambil data user beserta relasinya
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        stats: true,
        skillMasteries: {
          include: { skill: true },
        },
        dailyActivities: {
          orderBy: { date: 'asc' },
        },
      },
    });

    // Jika user belum ada, ambil user pertama yang tersedia
    if (!user) {
      user = await prisma.user.findFirst({
        include: {
          stats: true,
          skillMasteries: {
            include: { skill: true },
          },
          dailyActivities: {
            orderBy: { date: 'asc' },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // 1.5 Cek dan sinkronkan data live dari Supabase Mobile jika ada
    try {
      const { data: supaProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (supaProfile && user.stats) {
        user.stats.totalXp = Math.max(user.stats.totalXp, supaProfile.xp || 0);
        user.stats.currentStreak = Math.max(user.stats.currentStreak, supaProfile.streak_days || 0);
        user.stats.gems = Math.max(user.stats.gems, supaProfile.gems || 0);
        user.stats.hearts = supaProfile.hearts ?? user.stats.hearts;
      }
    } catch (e) {
      // fallback smoothly to local stats
    }

    // 2. Evaluasi Hati secara Lazy
    const rawHearts = user.stats?.hearts ?? 5;
    const heartsUpdatedAt = user.stats?.heartsUpdatedAt ?? new Date();
    const lazyHearts = calculateLazyHearts(rawHearts, heartsUpdatedAt);

    // 3. Olah Penguasaan Seluruh Skill
    const allSkills = await prisma.skill.findMany();
    const masteryMap = new Map(user.skillMasteries.map((m) => [m.skillId, m]));

    const skillsOverview = allSkills.map((s) => {
      const rec = masteryMap.get(s.id);
      const mastery = rec ? rec.mastery : 0.5;
      return {
        skillId: s.id,
        skillName: s.name,
        description: s.description,
        mastery,
        level: classifyMasteryLevel(mastery),
        attempts: rec?.attempts || 0,
        correctCount: rec?.correctCount || 0,
        avgResponseTimeMs: rec?.avgResponseTimeMs || 0,
      };
    });

    // Urutkan untuk mencari 3 skill terlemah
    const sortedSkills = [...skillsOverview].sort((a, b) => a.mastery - b.mastery);
    const weakSkills = sortedSkills.filter((s) => s.mastery < 0.5).slice(0, 3);
    const displayWeakSkills = weakSkills.length > 0 ? weakSkills : sortedSkills.slice(0, 3);

    // 4. Ambil AnswerLogs 30 hari terakhir untuk analisis pola kesalahan
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentLogs = await prisma.answerLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      include: { skill: true },
    });

    const formattedLogs = recentLogs.map((l) => ({
      id: l.id,
      skillId: l.skillId,
      skillName: l.skill.name,
      errorType: l.errorType,
      isCorrect: l.isCorrect,
      createdAt: l.createdAt,
    }));

    const errorDistribution = calculateErrorTypeDistribution(formattedLogs, 30);

    // Cari skill spesifik dengan error berulang terbanyak
    const skillErrorMap: Record<string, { skillName: string; errorType: string; count: number }> = {};
    for (const log of formattedLogs) {
      if (!log.isCorrect && log.errorType && log.skillName) {
        const key = `${log.skillName}___${log.errorType}`;
        if (!skillErrorMap[key]) {
          skillErrorMap[key] = {
            skillName: log.skillName,
            errorType: log.errorType,
            count: 0,
          };
        }
        skillErrorMap[key].count++;
      }
    }
    const dominantSkillError = Object.values(skillErrorMap).sort((a, b) => b.count - a.count)[0];

    // 5. Bangun Kalimat Wawasan Berbasis Aturan (Pedagogical Insights)
    const insights = generatePedagogicalInsights({
      weakSkills: displayWeakSkills.map((s) => ({ skillName: s.skillName, mastery: s.mastery })),
      errorDistribution,
      dominantSkillError,
    });

    // 6. Grafik XP Harian (7 Hari & 30 Hari)
    const dailyActivities = user.dailyActivities.map((a) => ({
      date: a.date,
      xpEarned: a.xpEarned,
      lessonsCompleted: a.lessonsCompleted,
    }));

    const xpChart7Days = formatDailyXpChartData(dailyActivities, 7);
    const xpChart30Days = formatDailyXpChartData(dailyActivities, 30);

    // 7. Kalender Streak Bulan Ini
    const now = new Date();
    const streakCalendar = calculateStreakCalendar(
      dailyActivities,
      now.getFullYear(),
      now.getMonth() + 1
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
      stats: {
        totalXp: user.stats?.totalXp || 0,
        gems: user.stats?.gems || 0,
        hearts: lazyHearts.hearts,
        nextHeartRegenSeconds: lazyHearts.nextRegenSeconds,
        currentStreak: user.stats?.currentStreak || 0,
        longestStreak: user.stats?.longestStreak || 0,
        streakFreezeCount: user.stats?.streakFreezeCount || 0,
        dailyGoalXp: user.stats?.dailyGoalXp || 30,
      },
      skillsOverview,
      weakSkills: displayWeakSkills,
      errorDistribution,
      insights,
      charts: {
        xp7Days: xpChart7Days,
        xp30Days: xpChart30Days,
        streakCalendar,
      },
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memuat data dashboard.' },
      { status: 500 }
    );
  }
}
