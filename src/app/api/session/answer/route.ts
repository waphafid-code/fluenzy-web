import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { classifyError } from '@/lib/core/errorClassifier';
import { calculateMasteryUpdate, calculateSkillStatsUpdate } from '@/lib/core/mastery';
import { processReviewOutcome } from '@/lib/core/spacedRepetition';
import { deductHeartOnIncorrect, calculateQuestionXp } from '@/lib/core/gamification';
import { explainMistake } from '@/lib/ai/explain';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userEmail = 'budi@fluenzy.id',
      questionId,
      userAnswer,
      exerciseType = 'fill_blank',
      responseTimeMs = 3000,
      hintUsed = false,
      isWeakPractice = false,
    } = body;

    // 1. Ambil data User & Soal
    let user = await prisma.user.findFirst({
      where: { email: userEmail },
      include: { stats: true },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        include: { stats: true },
      });
    }

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
        include: { stats: true },
      });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { skill: true },
    });
    if (!question) {
      return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 });
    }

    // 2. Ekstrak Kunci Jawaban Baku dari Payload Soal
    let correctAnswer = '';
    try {
      const parsed = JSON.parse(question.payload);
      correctAnswer = parsed.correctAnswer || parsed.options?.[0] || '';
    } catch {
      correctAnswer = question.prompt;
    }

    // 3. Evaluasi Kesalahan melalui Mesin Klasifikasi (Pure Function)
    const diagnosis = classifyError(String(userAnswer || ''), correctAnswer, exerciseType);
    const isCorrect = diagnosis.isCorrect;

    // 4. Update Mastery Skill (Exponential Moving Average / EMA)
    const currentMasteryRecord = await prisma.userSkillMastery.findUnique({
      where: {
        userId_skillId: {
          userId: user.id,
          skillId: question.skillId,
        },
      },
    });

    const isWeakSkill = (currentMasteryRecord?.mastery ?? 0.5) < 0.5;

    const masteryUpdate = calculateMasteryUpdate({
      currentMastery: currentMasteryRecord?.mastery,
      isCorrect,
      usedHint: hintUsed,
      difficulty: question.difficulty,
    });

    const statsUpdate = calculateSkillStatsUpdate({
      currentAttempts: currentMasteryRecord?.attempts,
      currentCorrectCount: currentMasteryRecord?.correctCount,
      currentAvgResponseTimeMs: currentMasteryRecord?.avgResponseTimeMs,
      isCorrect,
      responseTimeMs,
    });

    await prisma.userSkillMastery.upsert({
      where: {
        userId_skillId: {
          userId: user.id,
          skillId: question.skillId,
        },
      },
      create: {
        userId: user.id,
        skillId: question.skillId,
        mastery: masteryUpdate.newMastery,
        attempts: statsUpdate.attempts,
        correctCount: statsUpdate.correctCount,
        avgResponseTimeMs: statsUpdate.avgResponseTimeMs,
        lastPracticedAt: new Date(),
      },
      update: {
        mastery: masteryUpdate.newMastery,
        attempts: statsUpdate.attempts,
        correctCount: statsUpdate.correctCount,
        avgResponseTimeMs: statsUpdate.avgResponseTimeMs,
        lastPracticedAt: new Date(),
      },
    });

    // 5. Update Jadwal Spaced Repetition (Kotak Leitner 1-5)
    const existingSchedule = await prisma.reviewSchedule.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: question.id,
        },
      },
    });

    const currentBox = existingSchedule?.box || 1;
    const leitnerResult = processReviewOutcome(currentBox, isCorrect);

    await prisma.reviewSchedule.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: question.id,
        },
      },
      create: {
        userId: user.id,
        questionId: question.id,
        box: leitnerResult.nextBox,
        nextReviewAt: leitnerResult.nextReviewAt,
      },
      update: {
        box: leitnerResult.nextBox,
        nextReviewAt: leitnerResult.nextReviewAt,
      },
    });

    // 6. Evaluasi Hati (Hearts) - Kecuali pada Mode Latihan Titik Lemah (Bebas Risiko)
    let remainingHearts = user.stats?.hearts ?? 5;
    let heartsUpdatedAt = user.stats?.heartsUpdatedAt ?? new Date();
    let canContinueSession = true;

    if (!isCorrect && !isWeakPractice) {
      const heartResult = deductHeartOnIncorrect(remainingHearts, heartsUpdatedAt);
      remainingHearts = heartResult.hearts;
      heartsUpdatedAt = heartResult.heartsUpdatedAt;
      canContinueSession = heartResult.canContinueSession;

      if (user.stats) {
        await prisma.userStats.update({
          where: { userId: user.id },
          data: {
            hearts: remainingHearts,
            heartsUpdatedAt,
          },
        });
      }
    }

    // 7. Hitung Perolehan XP (+3 bonus XP untuk materi lemah)
    const xpResult = calculateQuestionXp(isCorrect, isWeakSkill);
    if (xpResult.totalXp > 0 && user.stats) {
      await prisma.userStats.update({
        where: { userId: user.id },
        data: {
          totalXp: { increment: xpResult.totalXp },
        },
      });

      // Update DailyActivity XP
      const todayStr = new Date().toISOString().split('T')[0];
      await prisma.dailyActivity.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: todayStr,
          },
        },
        create: {
          userId: user.id,
          date: todayStr,
          xpEarned: xpResult.totalXp,
          lessonsCompleted: 0,
        },
        update: {
          xpEarned: { increment: xpResult.totalXp },
        },
      });
    }

    // 8. Dapatkan Penjelasan Cerdas (AI / Static Fallback) jika jawaban keliru
    let explanationText = question.explanation;
    let explanationSource = 'default_fallback';

    if (!isCorrect) {
      const explainRes = await explainMistake({
        questionPrompt: question.prompt,
        userAnswer: String(userAnswer || ''),
        correctAnswer,
        errorType: diagnosis.errorType,
        defaultExplanation: question.explanation,
      });
      explanationText = explainRes.explanation;
      explanationSource = explainRes.source;
    }

    // 9. Rekam Log Telemetri di AnswerLog
    await prisma.answerLog.create({
      data: {
        userId: user.id,
        questionId: question.id,
        skillId: question.skillId,
        exerciseType,
        userAnswer: String(userAnswer || ''),
        correctAnswer,
        isCorrect,
        errorType: diagnosis.errorType,
        responseTimeMs,
        hintUsed,
      },
    });

    return NextResponse.json({
      isCorrect,
      errorType: diagnosis.errorType,
      detail: diagnosis.detail,
      explanation: explanationText,
      explanationSource,
      correctAnswer,
      xpEarned: xpResult.totalXp,
      weakSkillBonusEarned: xpResult.weakSkillBonus,
      newMastery: masteryUpdate.newMastery,
      masteryDelta: masteryUpdate.delta,
      skillName: question.skill.name,
      heartsRemaining: remainingHearts,
      canContinueSession,
      leitnerBox: leitnerResult.nextBox,
    });
  } catch (error) {
    console.error('Failed to submit answer:', error);
    return NextResponse.json({ error: 'Gagal memproses jawaban' }, { status: 500 });
  }
}
