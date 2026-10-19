import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // 1. Ambil daftar siswa
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      include: {
        stats: true,
        skillMasteries: {
          include: { skill: true },
        },
      },
    });

    // 2. Format laporan per siswa
    const studentReports = students.map((s) => {
      const masteries = s.skillMasteries.map((m) => ({
        skillName: m.skill.name,
        mastery: m.mastery,
      }));
      masteries.sort((a, b) => a.mastery - b.mastery);

      const avgMastery =
        masteries.length > 0
          ? masteries.reduce((acc, m) => acc + m.mastery, 0) / masteries.length
          : 0.5;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        totalXp: s.stats?.totalXp || 0,
        streak: s.stats?.currentStreak || 0,
        lastActiveDate: s.stats?.lastActiveDate || '-',
        avgMasteryPercent: Math.round(avgMastery * 100),
        weakestSkill: masteries[0]?.skillName || 'Belum ada data',
        weakestSkillPercent: masteries[0] ? Math.round(masteries[0].mastery * 100) : 50,
      };
    });

    // 3. Ringkasan Kelas: Skill yang paling banyak salah di seluruh siswa
    const mistakeLogs = await prisma.answerLog.findMany({
      where: { isCorrect: false },
      include: { skill: true },
    });

    const skillMistakeCount: Record<string, { skillName: string; count: number }> = {};
    for (const log of mistakeLogs) {
      const sId = log.skillId;
      if (!skillMistakeCount[sId]) {
        skillMistakeCount[sId] = {
          skillName: log.skill.name,
          count: 0,
        };
      }
      skillMistakeCount[sId].count++;
    }

    const classWeakestSkills = Object.values(skillMistakeCount).sort((a, b) => b.count - a.count);

    const totalQuestions = await prisma.question.count();
    const totalSkills = await prisma.skill.count();

    return NextResponse.json({
      totalStudents: students.length,
      totalQuestions,
      totalSkills,
      classWeakestSkills,
      students: studentReports,
    });
  } catch (error) {
    console.error('Failed to fetch teacher overview:', error);
    return NextResponse.json({ error: 'Gagal memuat laporan guru' }, { status: 500 });
  }
}
