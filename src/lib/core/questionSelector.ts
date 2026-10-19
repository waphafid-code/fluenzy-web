import { QUESTION_SELECTOR_CONFIG, GAMIFICATION_CONFIG } from './config';

/**
 * QUESTIONSELECTOR.TS - Mesin Pemilih Soal Adaptif (Adaptive Question Selector)
 *
 * DASAR AKADEMIS & METODOLOGI:
 * 1. Flow Theory & Dynamic Difficulty Adjustment (DDA) (Csikszentmihalyi, 1990):
 *    Menjaga siswa tetap berada di "Flow Channel" (antara rasa bosan/boredom dan cemas/anxiety):
 *      - 3 jawaban benar beruntun -> Naik 1 tingkat kesulitan (meningkatkan tantangan kognitif)
 *      - 2 jawaban salah beruntun -> Turun 1 tingkat kesulitan (mencegah frustrasi dan disengagement)
 *      - Dibatasi dalam rentang Difficulty 1 (Novice) sampai 5 (Mastery).
 *
 * 2. Interleaved & Distributed Practice (Rohrer & Taylor, 2007; Dunlosky et al., 2013):
 *    Menggabungkan materi baru dan pengulangan berkala secara proporsional dalam satu sesi:
 *      - 60% Pembelajaran Baru (Current Lesson Focus)
 *      - 25% Remedial Bertarget (Weakest Skill Consolidation)
 *      - 15% Pengulangan Berjarak Jatuh Tempo (Due Review Retrieval Practice)
 *
 * 3. Graceful Fallback Redistribution:
 *    Jika slot pengulangan berjarak belum tersedia (misal siswa baru hari pertama),
 *    kuota dialihkan secara otomatis ke materi pelajaran saat ini dan remedial agar
 *    panjang sesi tetap optimal (8 - 10 butir) sesuai Cognitive Load Theory (Sweller, 1988).
 */

export interface QuestionSummary {
  id: string;
  skillId: string;
  difficulty: number;
  type?: string;
  [key: string]: unknown;
}

export interface SkillMasterySummary {
  skillId: string;
  mastery: number;
}

export interface DifficultyAdjustmentResult {
  nextDifficulty: number;
  adjusted: boolean;
  reason: 'increased_on_streak' | 'decreased_on_errors' | 'maintained';
}

export interface SessionQuotas {
  currentLessonCount: number;
  weakestSkillCount: number;
  dueReviewCount: number;
  total: number;
}

export interface AdaptiveSelectionInput<T extends QuestionSummary> {
  currentLessonQuestions: T[];
  weakestSkillQuestions?: T[];
  dueReviewQuestions?: T[];
  totalQuestions?: number;
  targetDifficulty?: number;
}

export interface AdaptiveSelectionResult<T extends QuestionSummary> {
  selectedQuestions: T[];
  sourceBreakdown: {
    currentLesson: number;
    weakestSkill: number;
    dueReview: number;
  };
  totalSelected: number;
}

/**
 * Menyesuaikan tingkat kesulitan secara dinamis berdasarkan performa beruntun.
 *
 * @param currentDifficulty Tingkat kesulitan saat ini (1 - 5)
 * @param consecutiveCorrect Jumlah jawaban benar berturut-turut
 * @param consecutiveIncorrect Jumlah jawaban salah berturut-turut
 */
export function adjustDifficulty(
  currentDifficulty: number = 1,
  consecutiveCorrect: number = 0,
  consecutiveIncorrect: number = 0
): DifficultyAdjustmentResult {
  const safeCurrent = Math.max(
    QUESTION_SELECTOR_CONFIG.MIN_DIFFICULTY,
    Math.min(QUESTION_SELECTOR_CONFIG.MAX_DIFFICULTY, currentDifficulty)
  );

  // Kriteria Naik: 3 benar beruntun
  if (consecutiveCorrect >= QUESTION_SELECTOR_CONFIG.STREAK_TO_INCREASE_DIFFICULTY) {
    const nextDifficulty = Math.min(
      QUESTION_SELECTOR_CONFIG.MAX_DIFFICULTY,
      safeCurrent + 1
    );
    return {
      nextDifficulty,
      adjusted: nextDifficulty !== safeCurrent,
      reason: 'increased_on_streak',
    };
  }

  // Kriteria Turun: 2 salah beruntun
  if (consecutiveIncorrect >= QUESTION_SELECTOR_CONFIG.STREAK_TO_DECREASE_DIFFICULTY) {
    const nextDifficulty = Math.max(
      QUESTION_SELECTOR_CONFIG.MIN_DIFFICULTY,
      safeCurrent - 1
    );
    return {
      nextDifficulty,
      adjusted: nextDifficulty !== safeCurrent,
      reason: 'decreased_on_errors',
    };
  }

  return {
    nextDifficulty: safeCurrent,
    adjusted: false,
    reason: 'maintained',
  };
}

/**
 * Menghitung kuota ideal pembagian soal berdasarkan rasio pedagogis (60% / 25% / 15%).
 */
export function calculateSessionQuotas(
  totalQuestions: number = GAMIFICATION_CONFIG.MAX_QUESTIONS_PER_LESSON
): SessionQuotas {
  const safeTotal = Math.max(
    GAMIFICATION_CONFIG.MIN_QUESTIONS_PER_LESSON,
    Math.min(GAMIFICATION_CONFIG.MAX_QUESTIONS_PER_LESSON, totalQuestions)
  );

  const currentLessonCount = Math.round(
    safeTotal * QUESTION_SELECTOR_CONFIG.CURRENT_LESSON_RATIO
  );
  const dueReviewCount = Math.round(
    safeTotal * QUESTION_SELECTOR_CONFIG.DUE_REVIEW_RATIO
  );
  // Alokasi sisa untuk skill terlemah agar total presisi sesuai safeTotal
  const weakestSkillCount = Math.max(
    0,
    safeTotal - currentLessonCount - dueReviewCount
  );

  return {
    currentLessonCount,
    weakestSkillCount,
    dueReviewCount,
    total: safeTotal,
  };
}

/**
 * Mencari daftar ID skill dengan nilai penguasaan (mastery) terendah.
 */
export function findWeakestSkills(
  userMasteries: SkillMasterySummary[],
  topN: number = 3
): string[] {
  if (!userMasteries || userMasteries.length === 0) return [];

  return [...userMasteries]
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, topN)
    .map((item) => item.skillId);
}

/**
 * Memilih soal secara cerdas dan adaptif dengan pembagian proporsional dan fallback anggun.
 */
export function selectAdaptiveQuestions<T extends QuestionSummary>(
  input: AdaptiveSelectionInput<T>
): AdaptiveSelectionResult<T> {
  const quotas = calculateSessionQuotas(
    input.totalQuestions ?? GAMIFICATION_CONFIG.MAX_QUESTIONS_PER_LESSON
  );

  const selectedSet = new Set<string>();
  const selectedQuestions: T[] = [];

  let fromCurrent = 0;
  let fromWeak = 0;
  let fromReview = 0;

  // Helper untuk menambah soal tanpa duplikasi ID
  const tryAdd = (question: T, type: 'current' | 'weak' | 'review'): boolean => {
    if (!question || selectedSet.has(question.id)) return false;
    selectedSet.add(question.id);
    selectedQuestions.push(question);
    if (type === 'current') fromCurrent++;
    if (type === 'weak') fromWeak++;
    if (type === 'review') fromReview++;
    return true;
  };

  // Helper pengurut yang mengutamakan tingkat kesulitan terdekat dengan targetDifficulty
  const sortByTargetDifficulty = (questions: T[], target?: number): T[] => {
    if (typeof target !== 'number') return questions;
    return [...questions].sort(
      (a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target)
    );
  };

  const currentPool = sortByTargetDifficulty(
    input.currentLessonQuestions || [],
    input.targetDifficulty
  );
  const weakPool = sortByTargetDifficulty(
    input.weakestSkillQuestions || [],
    input.targetDifficulty
  );
  const reviewPool = sortByTargetDifficulty(
    input.dueReviewQuestions || [],
    input.targetDifficulty
  );

  // 1. Ambil soal Review Jatuh Tempo (hingga kuota 15%)
  for (const q of reviewPool) {
    if (fromReview >= quotas.dueReviewCount) break;
    tryAdd(q, 'review');
  }

  // 2. Ambil soal Skill Terlemah (hingga kuota 25%)
  for (const q of weakPool) {
    if (fromWeak >= quotas.weakestSkillCount) break;
    tryAdd(q, 'weak');
  }

  // 3. Ambil soal Pelajaran Utama (hingga kuota 60%)
  for (const q of currentPool) {
    if (fromCurrent >= quotas.currentLessonCount) break;
    tryAdd(q, 'current');
  }

  // 4. Graceful Fallback: Jika kuota belum terpenuhi (karena review/weakest pool kosong atau sedikit),
  // isi sisa kuota dari currentPool, lalu weakPool, lalu reviewPool sampai mencapai total target
  const remainingNeeded = quotas.total - selectedQuestions.length;
  if (remainingNeeded > 0) {
    for (const q of currentPool) {
      if (selectedQuestions.length >= quotas.total) break;
      tryAdd(q, 'current');
    }
  }

  if (selectedQuestions.length < quotas.total) {
    for (const q of weakPool) {
      if (selectedQuestions.length >= quotas.total) break;
      tryAdd(q, 'weak');
    }
  }

  if (selectedQuestions.length < quotas.total) {
    for (const q of reviewPool) {
      if (selectedQuestions.length >= quotas.total) break;
      tryAdd(q, 'review');
    }
  }

  return {
    selectedQuestions,
    sourceBreakdown: {
      currentLesson: fromCurrent,
      weakestSkill: fromWeak,
      dueReview: fromReview,
    },
    totalSelected: selectedQuestions.length,
  };
}
