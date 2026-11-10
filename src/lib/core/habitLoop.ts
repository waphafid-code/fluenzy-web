import { processReviewOutcome, LeitnerTransitionResult } from './spacedRepetition';
import { getUserPreferences } from './preferences';
import { safeGetStorage, safeSetStorage } from './storage';

export interface HabitProgress {
  date: string; // YYYY-MM-DD
  sessionsCompletedToday: number;
  targetSessionsPerDay: number;
  minutesSpentToday: number;
  xpEarnedToday: number;
  targetXpPerDay: number;
  streakCount: number;
  streakProtectedToday: boolean;
  isGoalAchieved: boolean;
}

export interface WarmupItem {
  id: string;
  word: string;
  targetSentence: string;
  ipa: string;
  box: number; // 1 to 5
  lastPracticedAt: string; // ISO Date string
  nextReviewAt: string; // ISO Date string
  mistakeCount: number;
  masteryStreak: number;
  articulatoryHint: string;
}

const HABIT_STORAGE_KEY = 'fluenzy_daily_habit_v2';
const WARMUP_STORAGE_KEY = 'fluenzy_warmup_queue_v2';

// In-memory fallback for SSR and testing
let memoryHabitStore: HabitProgress | null = null;
let memoryWarmupStore: WarmupItem[] = [
  {
    id: 'seed-thank',
    word: 'thank',
    targetSentence: 'Thank you for your time and guidance.',
    ipa: '/θæŋk/',
    box: 1,
    lastPracticedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() - 3600 * 1000).toISOString(), // due now
    mistakeCount: 2,
    masteryStreak: 0,
    articulatoryHint: 'Gigit sedikit ujung lidah di antara gigi atas dan bawah, jangan dibaca "tenk".',
  },
  {
    id: 'seed-could',
    word: 'could',
    targetSentence: 'Could you please review my pull request?',
    ipa: '/kʊd/',
    box: 1,
    lastPracticedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() - 1800 * 1000).toISOString(), // due now
    mistakeCount: 1,
    masteryStreak: 0,
    articulatoryHint: 'Huruf "l" adalah huruf bisu (silent letter), baca sebagai /kʊd/.',
  },
];

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Mendapatkan status progres kebiasaan harian (Habit Loop)
 */
export function getDailyHabitProgress(): HabitProgress {
  const today = getTodayString();
  const prefs = getUserPreferences();
  const targetXp = prefs.dailyGoalXp || 50;

  const stored = safeGetStorage<HabitProgress | null>(HABIT_STORAGE_KEY, memoryHabitStore);
  if (stored) {
    if (stored.date === today) {
      return stored;
    }
    // Hari baru: Cek kelanjutan streak
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];
    const streakContinues = stored.date === yesterday && stored.isGoalAchieved;
    const newStreak = streakContinues ? stored.streakCount : stored.isGoalAchieved ? stored.streakCount : 1;

    const refreshed: HabitProgress = {
      date: today,
      sessionsCompletedToday: 0,
      targetSessionsPerDay: 1,
      minutesSpentToday: 0,
      xpEarnedToday: 0,
      targetXpPerDay: targetXp,
      streakCount: newStreak,
      streakProtectedToday: false,
      isGoalAchieved: false,
    };
    safeSetStorage(HABIT_STORAGE_KEY, refreshed);
    memoryHabitStore = refreshed;
    return refreshed;
  }

  const defaultProgress: HabitProgress = {
    date: today,
    sessionsCompletedToday: 0,
    targetSessionsPerDay: 1,
    minutesSpentToday: 0,
    xpEarnedToday: 0,
    targetXpPerDay: targetXp,
    streakCount: 14, // default initial active streak
    streakProtectedToday: false,
    isGoalAchieved: false,
  };

  safeSetStorage(HABIT_STORAGE_KEY, defaultProgress);
  memoryHabitStore = defaultProgress;
  return defaultProgress;
}

/**
 * Mencatat penyelesaian sesi latihan (3-5 menit) dan menambahkan XP ke target harian
 */
export function recordPracticeSession(
  durationMinutes: number = 3,
  xpEarned: number = 30
): { progress: HabitProgress; milestoneAchieved: boolean } {
  const current = getDailyHabitProgress();
  const wasAchieved = current.isGoalAchieved;

  const newSessions = current.sessionsCompletedToday + 1;
  const newMinutes = current.minutesSpentToday + durationMinutes;
  const newXp = current.xpEarnedToday + xpEarned;
  const isNowAchieved = newSessions >= current.targetSessionsPerDay || newXp >= current.targetXpPerDay;
  const milestoneAchieved = !wasAchieved && isNowAchieved;

  const nextProgress: HabitProgress = {
    ...current,
    sessionsCompletedToday: newSessions,
    minutesSpentToday: newMinutes,
    xpEarnedToday: newXp,
    isGoalAchieved: isNowAchieved,
    streakCount: milestoneAchieved ? current.streakCount + 1 : current.streakCount,
  };

  safeSetStorage(HABIT_STORAGE_KEY, nextProgress);
  memoryHabitStore = nextProgress;

  return { progress: nextProgress, milestoneAchieved };
}

// ============================================================================
// AUTOMATED MISTAKE INGESTION & LEITNER WARMUP BOX
// ============================================================================

function getStoredWarmupItems(): WarmupItem[] {
  return safeGetStorage<WarmupItem[]>(WARMUP_STORAGE_KEY, memoryWarmupStore);
}

function saveWarmupItems(items: WarmupItem[]): void {
  safeSetStorage(WARMUP_STORAGE_KEY, items);
  memoryWarmupStore = items;
}

/**
 * Otomatis memasukkan kata yang keliru (<80%) ke antrean Spaced Repetition (Box 1)
 */
export function ingestSpokenMistake(params: {
  word: string;
  targetSentence: string;
  ipa: string;
  articulatoryHint?: string;
}): WarmupItem {
  const cleanWord = params.word.toLowerCase().replace(/[^a-z]/g, '');
  const items = getStoredWarmupItems();
  const existingIdx = items.findIndex(
    (item) => item.word.toLowerCase() === cleanWord
  );

  const now = new Date();
  // Jadwal review pertama: 4 jam kemudian (fase memori kerja Box 1)
  const nextReviewDate = new Date(now.getTime() + 4 * 3600 * 1000);

  if (existingIdx >= 0) {
    const existing = items[existingIdx];
    const updated: WarmupItem = {
      ...existing,
      targetSentence: params.targetSentence,
      box: 1, // Demosi kembali ke Box 1
      lastPracticedAt: now.toISOString(),
      nextReviewAt: nextReviewDate.toISOString(),
      mistakeCount: existing.mistakeCount + 1,
      masteryStreak: 0,
      articulatoryHint: params.articulatoryHint || existing.articulatoryHint,
    };
    items[existingIdx] = updated;
    saveWarmupItems(items);
    return updated;
  }

  const newItem: WarmupItem = {
    id: `warmup_${cleanWord}_${Date.now()}`,
    word: cleanWord,
    targetSentence: params.targetSentence,
    ipa: params.ipa,
    box: 1,
    lastPracticedAt: now.toISOString(),
    nextReviewAt: nextReviewDate.toISOString(),
    mistakeCount: 1,
    masteryStreak: 0,
    articulatoryHint:
      params.articulatoryHint ||
      `Perhatikan artikulasi fonem ${params.ipa} dengan rileks dan tepat.`,
  };

  items.unshift(newItem);
  saveWarmupItems(items);
  return newItem;
}

/**
 * Mengambil kata-kata yang telah jatuh tempo (due) untuk sesi Pemanasan 60 Detik.
 * Maksimal 3 kata agar sesi tetap ringan dan bebas burnout!
 */
export function getDueWarmupItems(maxItems: number = 3): WarmupItem[] {
  const items = getStoredWarmupItems();
  const nowTime = Date.now();

  const dueItems = items.filter((item) => {
    const reviewTime = new Date(item.nextReviewAt).getTime();
    return isNaN(reviewTime) || reviewTime <= nowTime;
  });

  return dueItems.slice(0, maxItems);
}

/**
 * Mencatat hasil evaluasi pemanasan kata Leitner
 */
export function recordWarmupReviewOutcome(
  itemId: string,
  isCorrect: boolean
): { item: WarmupItem; transition: LeitnerTransitionResult } | null {
  const items = getStoredWarmupItems();
  const index = items.findIndex((i) => i.id === itemId);
  if (index === -1) return null;

  const current = items[index];
  const transition = processReviewOutcome(current.box, isCorrect);
  const now = new Date();

  const updated: WarmupItem = {
    ...current,
    box: transition.nextBox,
    lastPracticedAt: now.toISOString(),
    nextReviewAt: transition.nextReviewAt.toISOString(),
    masteryStreak: isCorrect ? current.masteryStreak + 1 : 0,
    mistakeCount: isCorrect ? current.mistakeCount : current.mistakeCount + 1,
  };

  items[index] = updated;
  saveWarmupItems(items);

  return { item: updated, transition };
}

/**
 * Mengambil ringkasan statistik antrean review (Box 1 sampai 5)
 */
export function getWarmupStats(): {
  totalItems: number;
  dueCount: number;
  boxCounts: Record<number, number>;
} {
  const items = getStoredWarmupItems();
  const nowTime = Date.now();
  let dueCount = 0;
  const boxCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const item of items) {
    const box = Math.max(1, Math.min(5, item.box || 1));
    boxCounts[box] = (boxCounts[box] || 0) + 1;

    const reviewTime = new Date(item.nextReviewAt).getTime();
    if (isNaN(reviewTime) || reviewTime <= nowTime) {
      dueCount++;
    }
  }

  return {
    totalItems: items.length,
    dueCount,
    boxCounts,
  };
}

