import { GAMIFICATION_CONFIG } from './config';

/**
 * GAMIFICATION.TS - Mesin Gamifikasi Lanjutan & Manajemen Hati (Hearts)
 *
 * DASAR AKADEMIS & METODOLOGI:
 * 1. Self-Determination Theory (Ryan & Deci, 2000):
 *    - Competence: XP bertingkat dan bonus soal menantang/lemah memotivasi penguasaan materi sulit.
 *    - Autonomy: Gems dan Streak Freeze memberikan perlindungan fleksibel terhadap stres akademik.
 * 2. Loss Aversion (Kahneman & Tversky, 1979):
 *    - Mekanisme Hati (5 Hearts) dan Streak harian mendorong fokus serta kehati-hatian dalam menjawab.
 * 3. Lazy Evaluation (Cron-free Architecture):
 *    - Regenerasi hati (1 hati per 30 menit) dihitung secara deterministik matematis saat user berinteraksi
 *      menggunakan selisih waktu `now - heartsUpdatedAt`. Tidak membutuhkan cron job server yang mahal.
 */

export interface LazyHeartsResult {
  hearts: number;
  heartsRegenerated: number;
  nextRegenSeconds: number | null;
  heartsUpdatedAt: Date;
}

export interface QuestionXpResult {
  baseXp: number;
  weakSkillBonus: number;
  totalXp: number;
}

export interface LessonRewardsResult {
  lessonXpBonus: number;
  gemsEarned: number;
  dailyGoalReached: boolean;
  dailyGoalGemsBonus: number;
  totalGemsEarned: number;
}

export interface StreakEvaluationResult {
  newStreak: number;
  freezeUsed: boolean;
  remainingFreezeCount: number;
  status: 'maintained' | 'incremented' | 'protected_by_freeze' | 'reset';
}

/**
 * Menghitung regenerasi hati secara malas (lazy evaluation) berdasarkan selisih waktu.
 *
 * @param currentHearts Jumlah hati yang tersimpan di basis data (0 - 5)
 * @param heartsUpdatedAt Stempel waktu terakhir kali hati berkurang / teregenerasi
 * @param now Waktu evaluasi saat ini (default: waktu sekarang)
 */
export function calculateLazyHearts(
  currentHearts: number,
  heartsUpdatedAt: Date | string | number,
  now: Date | string | number = new Date()
): LazyHeartsResult {
  const maxHearts = GAMIFICATION_CONFIG.MAX_HEARTS;
  const intervalMs = GAMIFICATION_CONFIG.HEART_REGEN_INTERVAL_MS;

  const validCurrentHearts = Math.max(0, Math.min(maxHearts, currentHearts));
  const updatedTime = new Date(heartsUpdatedAt).getTime();
  const currentTime = new Date(now).getTime();

  // Jika hati sudah penuh, timer tidak berjalan
  if (validCurrentHearts >= maxHearts) {
    return {
      hearts: maxHearts,
      heartsRegenerated: 0,
      nextRegenSeconds: null,
      heartsUpdatedAt: new Date(currentTime),
    };
  }

  // Jika stempel waktu tidak valid atau waktu berjalan mundur
  if (isNaN(updatedTime) || isNaN(currentTime) || currentTime <= updatedTime) {
    const msUntilNext = intervalMs;
    return {
      hearts: validCurrentHearts,
      heartsRegenerated: 0,
      nextRegenSeconds: Math.ceil(msUntilNext / 1000),
      heartsUpdatedAt: new Date(updatedTime || currentTime),
    };
  }

  const elapsedMs = currentTime - updatedTime;
  const heartsToAdd = Math.floor(elapsedMs / intervalMs);

  if (heartsToAdd <= 0) {
    const msUntilNext = intervalMs - elapsedMs;
    return {
      hearts: validCurrentHearts,
      heartsRegenerated: 0,
      nextRegenSeconds: Math.ceil(msUntilNext / 1000),
      heartsUpdatedAt: new Date(updatedTime),
    };
  }

  const newHearts = Math.min(maxHearts, validCurrentHearts + heartsToAdd);
  const actualRegenerated = newHearts - validCurrentHearts;

  if (newHearts >= maxHearts) {
    return {
      hearts: maxHearts,
      heartsRegenerated: actualRegenerated,
      nextRegenSeconds: null,
      heartsUpdatedAt: new Date(currentTime),
    };
  }

  // Jika masih belum penuh, majukan stempel waktu sebesar siklus yang telah dikonsumsi
  const consumedMs = heartsToAdd * intervalMs;
  const newUpdatedAtTime = updatedTime + consumedMs;
  const msUntilNext = intervalMs - (currentTime - newUpdatedAtTime);

  return {
    hearts: newHearts,
    heartsRegenerated: actualRegenerated,
    nextRegenSeconds: Math.max(1, Math.ceil(msUntilNext / 1000)),
    heartsUpdatedAt: new Date(newUpdatedAtTime),
  };
}

/**
 * Mengurangi satu hati saat siswa menjawab salah, dan menginisiasi penghitungan regenerasi.
 */
export function deductHeartOnIncorrect(
  currentHearts: number,
  heartsUpdatedAt: Date | string | number,
  now: Date | string | number = new Date()
): { hearts: number; heartsUpdatedAt: Date; canContinueSession: boolean } {
  // Evaluasi regenerasi terlebih dahulu sebelum pengurangan
  const evaluated = calculateLazyHearts(currentHearts, heartsUpdatedAt, now);
  const afterDeduction = Math.max(0, evaluated.hearts - GAMIFICATION_CONFIG.HEARTS_LOST_PER_INCORRECT);

  // Jika sebelumnya hati penuh (5) dan kini menjadi 4, mulai timer regenerasi dari sekarang
  const newUpdatedAt =
    evaluated.hearts === GAMIFICATION_CONFIG.MAX_HEARTS
      ? new Date(now)
      : evaluated.heartsUpdatedAt;

  return {
    hearts: afterDeduction,
    heartsUpdatedAt: newUpdatedAt,
    canContinueSession: afterDeduction > 0,
  };
}

/**
 * Menghitung perolehan XP per butir soal dengan insentif bonus untuk materi lemah.
 */
export function calculateQuestionXp(
  isCorrect: boolean,
  isWeakSkill: boolean = false
): QuestionXpResult {
  if (!isCorrect) {
    return {
      baseXp: 0,
      weakSkillBonus: 0,
      totalXp: 0,
    };
  }

  const baseXp = GAMIFICATION_CONFIG.XP_PER_CORRECT_ANSWER;
  const weakSkillBonus = isWeakSkill ? GAMIFICATION_CONFIG.XP_WEAK_SKILL_BONUS : 0;

  return {
    baseXp,
    weakSkillBonus,
    totalXp: baseXp + weakSkillBonus,
  };
}

/**
 * Menghitung reward penyelesaian pelajaran (Gems, Perfect Bonus, Daily Goal).
 */
export function calculateLessonRewards(
  isPerfectLesson: boolean,
  priorDailyXp: number,
  lessonGainedXp: number,
  dailyGoalXp: number = GAMIFICATION_CONFIG.DEFAULT_DAILY_GOAL_XP
): LessonRewardsResult {
  const lessonXpBonus = isPerfectLesson ? GAMIFICATION_CONFIG.XP_PERFECT_LESSON_BONUS : 0;
  const baseGems = GAMIFICATION_CONFIG.GEMS_PER_LESSON_COMPLETION;

  const reachedGoalNow =
    priorDailyXp < dailyGoalXp && priorDailyXp + lessonGainedXp >= dailyGoalXp;
  const dailyGoalGems = reachedGoalNow ? GAMIFICATION_CONFIG.GEMS_PER_DAILY_GOAL : 0;

  return {
    lessonXpBonus,
    gemsEarned: baseGems,
    dailyGoalReached: reachedGoalNow,
    dailyGoalGemsBonus: dailyGoalGems,
    totalGemsEarned: baseGems + dailyGoalGems,
  };
}

/**
 * Mengevaluasi pemeliharaan streak harian dan penggunaan Streak Freeze.
 *
 * @param lastActiveDate Tanggal aktivitas terakhir dalam format YYYY-MM-DD
 * @param todayDate Tanggal hari ini dalam format YYYY-MM-DD
 * @param currentStreak Nilai streak saat ini
 * @param streakFreezeCount Jumlah item Streak Freeze yang dimiliki user
 */
export function evaluateDailyStreak(
  lastActiveDate: string | null,
  todayDate: string,
  currentStreak: number,
  streakFreezeCount: number = 0
): StreakEvaluationResult {
  if (!lastActiveDate) {
    return {
      newStreak: 1,
      freezeUsed: false,
      remainingFreezeCount: streakFreezeCount,
      status: 'incremented',
    };
  }

  if (lastActiveDate === todayDate) {
    return {
      newStreak: currentStreak,
      freezeUsed: false,
      remainingFreezeCount: streakFreezeCount,
      status: 'maintained',
    };
  }

  const lastDate = new Date(`${lastActiveDate}T00:00:00Z`);
  const currDate = new Date(`${todayDate}T00:00:00Z`);
  const diffDays = Math.round(
    (currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Jika kemarin (selisih 1 hari), streak bertambah
  if (diffDays === 1) {
    return {
      newStreak: currentStreak + 1,
      freezeUsed: false,
      remainingFreezeCount: streakFreezeCount,
      status: 'incremented',
    };
  }

  // Jika bolos 1 hari (selisih 2 hari) dan memiliki Streak Freeze
  if (diffDays === 2 && streakFreezeCount > 0) {
    return {
      newStreak: currentStreak + 1, // Streak terselamatkan
      freezeUsed: true,
      remainingFreezeCount: streakFreezeCount - 1,
      status: 'protected_by_freeze',
    };
  }

  // Bolos lebih dari 1 hari atau tidak memiliki Freeze -> Streak reset ke 1
  return {
    newStreak: 1,
    freezeUsed: false,
    remainingFreezeCount: streakFreezeCount,
    status: 'reset',
  };
}
