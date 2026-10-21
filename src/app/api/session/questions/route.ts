import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { selectAdaptiveQuestions, findWeakestSkills } from '@/lib/core/questionSelector';



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'lesson'; // 'lesson' | 'weakness' | 'review'
    const lessonId = searchParams.get('lessonId');
    const userEmail = searchParams.get('email') || 'budi@fluenzy.id';

    let user = await prisma.user.findFirst({
      where: { email: userEmail },
      include: {
        skillMasteries: true,
        reviewSchedules: {
          include: { question: { include: { skill: true } } },
        },
      },
    });

    // Fallback gracefully to demo/guest profile if specific user email not found
    if (!user) {
      user = await prisma.user.findFirst({
        include: {
          skillMasteries: true,
          reviewSchedules: {
            include: { question: { include: { skill: true } } },
          },
        },
      });
    }

    // Auto-create guest learner profile if database has no users yet
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: 'Pelajar Fluenzy',
          passwordHash: 'guest_managed',
          stats: {
            create: {
              totalXp: 100,
              hearts: 5,
              currentStreak: 1,
            },
          },
        },
        include: {
          skillMasteries: true,
          reviewSchedules: {
            include: { question: { include: { skill: true } } },
          },
        },
      });
    }

    // =========================================================================
    // MODE 1: LATIHAN TITIK LEMAH (WEAKNESS PRACTICE)
    // =========================================================================
    if (mode === 'weakness') {
      const weakestSkillIds = findWeakestSkills(
        user.skillMasteries.map((m) => ({ skillId: m.skillId, mastery: m.mastery })),
        3
      );

      // Jika belum ada data mastery, ambil 3 skill pertama
      const targetSkillIds =
        weakestSkillIds.length > 0
          ? weakestSkillIds
          : (await prisma.skill.findMany({ take: 3 })).map((s) => s.id);

      const weakQuestions = await prisma.question.findMany({
        where: { skillId: { in: targetSkillIds } },
        include: { skill: true },
        take: 10,
      });

      return NextResponse.json({
        mode: 'weakness',
        title: 'Latihan Titik Lemah (Tanpa Risiko Hati)',
        description: 'Materi difokuskan pada 3 skill yang paling memerlukan penguatan.',
        questions: weakQuestions,
      });
    }

    // =========================================================================
    // MODE 2: REVIEW HARIAN JATUH TEMPO (SPACED REPETITION)
    // =========================================================================
    if (mode === 'review') {
      const now = new Date();
      const dueSchedules = await prisma.reviewSchedule.findMany({
        where: {
          userId: user.id,
          nextReviewAt: { lte: now },
        },
        include: { question: { include: { skill: true } } },
        take: 10,
      });

      let reviewQuestions = dueSchedules.map((s) => s.question);

      // Jika belum ada yang jatuh tempo, ambil soal-soal di Kotak 1 atau 2
      if (reviewQuestions.length === 0) {
        const fallbackSchedules = await prisma.reviewSchedule.findMany({
          where: { userId: user.id },
          include: { question: { include: { skill: true } } },
          take: 10,
        });
        reviewQuestions = fallbackSchedules.map((s) => s.question);
      }

      // Jika tetap kosong, fallback ke soal umum
      if (reviewQuestions.length === 0) {
        reviewQuestions = await prisma.question.findMany({
          take: 10,
          include: { skill: true },
        });
      }

      return NextResponse.json({
        mode: 'review',
        title: 'Review Harian (Sistem Kotak Leitner)',
        description: 'Pengulangan berjarak untuk menstabilkan ingatan jangka panjang.',
        questions: reviewQuestions,
      });
    }

    // =========================================================================
    // MODE 3: SESI PELAJARAN ADAPTIF (60% Lesson / 25% Weak / 15% Review)
    // =========================================================================
    let targetLessonId = lessonId;
    if (!targetLessonId) {
      const firstLesson = await prisma.lesson.findFirst();
      targetLessonId = firstLesson?.id || 'lesson-1';
    }

    const currentLessonQuestions = await prisma.question.findMany({
      where: { lessonId: targetLessonId },
      include: { skill: true },
    });

    const weakestSkillIds = findWeakestSkills(
      user.skillMasteries.map((m) => ({ skillId: m.skillId, mastery: m.mastery })),
      2
    );

    const weakQuestions = await prisma.question.findMany({
      where: {
        skillId: { in: weakestSkillIds },
        lessonId: { not: targetLessonId },
      },
      include: { skill: true },
    });

    const now = new Date();
    const dueReviews = await prisma.reviewSchedule.findMany({
      where: {
        userId: user.id,
        nextReviewAt: { lte: now },
      },
      include: { question: { include: { skill: true } } },
    });

    const dueQuestions = dueReviews.map((r) => r.question);

    // Jalankan pemilihan soal adaptif menggunakan fungsi murni
    const selection = selectAdaptiveQuestions({
      currentLessonQuestions,
      weakestSkillQuestions: weakQuestions,
      dueReviewQuestions: dueQuestions,
      totalQuestions: 10,
    });

    const lesson = await prisma.lesson.findUnique({
      where: { id: targetLessonId },
    });

    return NextResponse.json({
      mode: 'lesson',
      lessonId: targetLessonId,
      title: lesson?.title || 'Sesi Belajar Adaptif',
      breakdown: selection.sourceBreakdown,
      questions: selection.selectedQuestions,
    });
  } catch (error) {
    console.error('Failed to prepare session questions:', error);
    return NextResponse.json({ error: 'Gagal memuat butir soal sesi' }, { status: 500 });
  }
}
