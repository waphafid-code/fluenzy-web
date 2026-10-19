import { MASTERY_CONFIG } from './config';

/**
 * MASTERY.TS - Mesin Evaluasi Penguasaan Kognitif (Skill Mastery)
 *
 * DASAR AKADEMIS & FORMULASI MATEMATIKA:
 * 1. Exponential Moving Average (EMA) (Hunter, 1986):
 *    Digunakan untuk memodelkan pembaruan probabilitas penguasaan siswa secara adaptif.
 *    Rumus:
 *      mastery_baru = mastery_lama + α * (hasil - mastery_lama)
 *    di mana:
 *      - mastery_lama: Nilai penguasaan sebelumnya (0.0 - 1.0, initial = 0.5)
 *      - hasil (R):
 *          1.0 = Benar mandiri (tanpa petunjuk / hint)
 *          0.6 = Benar berbantuan (dengan petunjuk / hint) -> Scaffolding effect (Vygotsky, 1978)
 *          0.0 = Salah
 *      - α (learning rate / bobot sensitivitas):
 *          0.25 (Alpha Dasar) untuk soal difficulty 1-3
 *          0.35 (Alpha Lanjutan) untuk soal difficulty >= 4 (Zone of Proximal Development;
 *          keberhasilan menyelesaikan soal menantang memberikan estimasi kompetensi yang lebih berbobot).
 *
 * 2. Ebbinghaus Forgetting Curve & Decay Penguasaan:
 *    R = e^(-t/S), disederhanakan secara linear per minggu untuk stabilitas komputasi:
 *    Jika t (inaktivitas) > 7 hari:
 *      decay = ((t - 7) / 7) * DECAY_RATE_PER_WEEK
 *      mastery_decayed = max(0.0, mastery - decay)
 *
 * 3. Taksonomi Tingkat Penguasaan (Mastery Levels):
 *    - Lemah (Weak)   : mastery < 0.5 (Prioritas remedial dalam sesi adaptif)
 *    - Sedang (Medium): 0.5 <= mastery <= 0.8 (Fase konsolidasi pemahaman)
 *    - Kuat (Strong)  : mastery > 0.8 (Telah mencapai otomatisasi kognitif)
 */

export type SkillMasteryLevel = 'weak' | 'medium' | 'strong';

export interface MasteryUpdateInput {
  currentMastery?: number;
  isCorrect: boolean;
  usedHint?: boolean;
  difficulty?: number;
}

export interface MasteryUpdateResult {
  previousMastery: number;
  newMastery: number;
  alpha: number;
  resultScore: number;
  delta: number;
  level: SkillMasteryLevel;
}

export interface MasteryDecayResult {
  originalMastery: number;
  decayedMastery: number;
  daysInactive: number;
  decayApplied: number;
  level: SkillMasteryLevel;
}

export interface SkillStatsUpdateInput {
  currentAttempts?: number;
  currentCorrectCount?: number;
  currentAvgResponseTimeMs?: number;
  isCorrect: boolean;
  responseTimeMs: number;
}

export interface SkillStatsUpdateResult {
  attempts: number;
  correctCount: number;
  avgResponseTimeMs: number;
}

/**
 * Menentukan bobot alpha (learning rate) berdasarkan tingkat kesulitan soal.
 */
export function getAlphaForDifficulty(difficulty: number = 1): number {
  if (difficulty >= MASTERY_CONFIG.DIFFICULTY_THRESHOLD_FOR_HIGH_ALPHA) {
    return MASTERY_CONFIG.ALPHA_DIFFICULT;
  }
  return MASTERY_CONFIG.ALPHA_BASE;
}

/**
 * Menentukan skor performa butir soal berdasarkan kebenaran dan penggunaan petunjuk (hint).
 */
export function getPerformanceScore(isCorrect: boolean, usedHint: boolean = false): number {
  if (!isCorrect) {
    return MASTERY_CONFIG.RESULT_INCORRECT;
  }
  return usedHint
    ? MASTERY_CONFIG.RESULT_CORRECT_WITH_HINT
    : MASTERY_CONFIG.RESULT_CORRECT_NO_HINT;
}

/**
 * Mengklasifikasikan tingkat kemahiran materi ke dalam kategori: weak | medium | strong.
 */
export function classifyMasteryLevel(mastery: number): SkillMasteryLevel {
  const clamped = Math.max(0, Math.min(1, mastery));
  if (clamped < MASTERY_CONFIG.LEVEL_THRESHOLDS.WEAK_MAX) {
    return 'weak';
  }
  if (clamped <= MASTERY_CONFIG.LEVEL_THRESHOLDS.MEDIUM_MAX) {
    return 'medium';
  }
  return 'strong';
}

/**
 * Menghitung pembaruan nilai mastery menggunakan rumus Exponential Moving Average (EMA).
 *
 * @param input Objek parameter pembaruan (currentMastery, isCorrect, usedHint, difficulty)
 * @returns Rincian kalkulasi matematika mastery baru
 */
export function calculateMasteryUpdate(input: MasteryUpdateInput): MasteryUpdateResult {
  const previousMastery =
    typeof input.currentMastery === 'number'
      ? Math.max(0, Math.min(1, input.currentMastery))
      : MASTERY_CONFIG.INITIAL_MASTERY;

  const alpha = getAlphaForDifficulty(input.difficulty ?? 1);
  const resultScore = getPerformanceScore(input.isCorrect, input.usedHint ?? false);

  // Rumus: mastery_baru = mastery_lama + alpha * (hasil - mastery_lama)
  const rawNewMastery = previousMastery + alpha * (resultScore - previousMastery);
  const clampedNewMastery = Math.max(0, Math.min(1, rawNewMastery));
  const roundedNewMastery = Number(clampedNewMastery.toFixed(4));
  const delta = Number((roundedNewMastery - previousMastery).toFixed(4));

  return {
    previousMastery,
    newMastery: roundedNewMastery,
    alpha,
    resultScore,
    delta,
    level: classifyMasteryLevel(roundedNewMastery),
  };
}

/**
 * Menghitung penurunan alami (decay) penguasaan akibat kurva lupa Ebbinghaus.
 *
 * @param currentMastery Nilai mastery saat ini (0 - 1)
 * @param lastPracticedAt Waktu terakhir latihan
 * @param now Waktu rujukan saat evaluasi dilakukan (default: waktu sekarang)
 */
export function calculateDecayedMastery(
  currentMastery: number,
  lastPracticedAt: Date | string | number,
  now: Date | string | number = new Date()
): MasteryDecayResult {
  const originalMastery = Math.max(0, Math.min(1, currentMastery));
  const lastTime = new Date(lastPracticedAt).getTime();
  const currentTime = new Date(now).getTime();

  if (isNaN(lastTime) || isNaN(currentTime) || currentTime <= lastTime) {
    return {
      originalMastery,
      decayedMastery: originalMastery,
      daysInactive: 0,
      decayApplied: 0,
      level: classifyMasteryLevel(originalMastery),
    };
  }

  const elapsedMs = currentTime - lastTime;
  const daysInactive = elapsedMs / (1000 * 60 * 60 * 24);

  if (daysInactive <= MASTERY_CONFIG.DECAY_INACTIVITY_DAYS_THRESHOLD) {
    return {
      originalMastery,
      decayedMastery: originalMastery,
      daysInactive: Number(daysInactive.toFixed(2)),
      decayApplied: 0,
      level: classifyMasteryLevel(originalMastery),
    };
  }

  const daysPastThreshold = daysInactive - MASTERY_CONFIG.DECAY_INACTIVITY_DAYS_THRESHOLD;
  const weeksInactive = daysPastThreshold / 7;
  const decayAmount = weeksInactive * MASTERY_CONFIG.DECAY_RATE_PER_WEEK;

  const rawDecayed = Math.max(0, originalMastery - decayAmount);
  const decayedMastery = Number(rawDecayed.toFixed(4));
  const decayApplied = Number((originalMastery - decayedMastery).toFixed(4));

  return {
    originalMastery,
    decayedMastery,
    daysInactive: Number(daysInactive.toFixed(2)),
    decayApplied,
    level: classifyMasteryLevel(decayedMastery),
  };
}

/**
 * Menghitung pembaruan statistik kumulatif (attempts, correctCount, rata-rata response time).
 */
export function calculateSkillStatsUpdate(input: SkillStatsUpdateInput): SkillStatsUpdateResult {
  const attempts = (input.currentAttempts ?? 0) + 1;
  const correctCount = (input.currentCorrectCount ?? 0) + (input.isCorrect ? 1 : 0);

  const prevAttempts = input.currentAttempts ?? 0;
  const prevAvg = input.currentAvgResponseTimeMs ?? 0;
  const validResponseTime = Math.max(0, input.responseTimeMs);

  // Rata-rata berjalan kumulatif: (prevAvg * prevCount + new) / totalCount
  const avgResponseTimeMs = Math.round((prevAvg * prevAttempts + validResponseTime) / attempts);

  return {
    attempts,
    correctCount,
    avgResponseTimeMs,
  };
}
