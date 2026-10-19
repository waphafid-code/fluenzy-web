/**
 * CONFIG.TS - Pusat Sentralisasi Konstanta Gamifikasi & Pedagogi Fluenzy
 *
 * DASAR AKADEMIS & FORMULA (TAHAP 1 & 2):
 * 1. Cognitive Load Theory (Sweller, 1988) & Chunking (Miller, 1956): 8-10 soal per sesi.
 * 2. Exponential Moving Average (EMA) untuk Mastery: Memodelkan dinamika kurva pembelajaran terkini.
 * 3. Ebbinghaus Forgetting Curve: Decay penguasaan setelah 7 hari inaktivitas.
 * 4. Sistem Kotak Leitner (1872): Interval bertingkat 1, 2, 4, 8, 16 hari untuk spaced repetition.
 * 5. Dynamic Difficulty Adjustment (Csikszentmihalyi's Flow): 3 benar beruntun naik, 2 salah turun.
 * 6. Error Taxonomy: Membedakan slip mekanikal (typo, word order) dari mistake konseptual (wrong word/choice).
 */

export const GAMIFICATION_CONFIG = {
  // --- XP (Experience Points) Rules ---
  XP_PER_CORRECT_ANSWER: 10,
  XP_PERFECT_LESSON_BONUS: 5,
  XP_WEAK_SKILL_BONUS: 3, // Bonus insentif agar pengguna tertantang melatih materi lemah
  DEFAULT_DAILY_GOAL_XP: 30,
  GEMS_PER_LESSON_COMPLETION: 10,
  GEMS_PER_DAILY_GOAL: 20,

  // --- Hearts (Nyawa) & Regen Rules ---
  // Kapasitas 5 hati, berkurang 1 saat salah, regenerasi 1 hati per 30 menit (lazy evaluation)
  MAX_HEARTS: 5,
  HEARTS_LOST_PER_INCORRECT: 1,
  HEART_REGEN_MINUTES: 30,
  HEART_REGEN_INTERVAL_MS: 30 * 60 * 1000,
  STREAK_FREEZE_COST_GEMS: 100,

  // --- Streak Rules ---
  DEFAULT_TIMEZONE: 'Asia/Jakarta',
  MIN_LESSONS_FOR_STREAK: 1,

  // --- Pedagogical Session Rules ---
  MIN_QUESTIONS_PER_LESSON: 8,
  MAX_QUESTIONS_PER_LESSON: 10,
  MIN_PASSING_ACCURACY_PERCENT: 70,
} as const;

export const ERROR_CLASSIFIER_CONFIG = {
  // Ambang batas Levenshtein untuk mengkategorikan kesalahan sebagai typo (slip kognitif ringan)
  MAX_LEVENSHTEIN_TYPO: 2,
  MAX_LENGTH_DIFF_TYPO: 2,
} as const;

export const MASTERY_CONFIG = {
  // Nilai awal penguasaan materi (prior probabilitas netral 50%)
  INITIAL_MASTERY: 0.5,

  // Bobot pembaruan EMA (Exponential Moving Average):
  // mastery_baru = mastery_lama + alpha * (hasil - mastery_lama)
  ALPHA_BASE: 0.25,
  ALPHA_DIFFICULT: 0.35, // Soal berdifficulty >= 4 memberi sinyal kemampuan kognitif lebih kuat
  DIFFICULTY_THRESHOLD_FOR_HIGH_ALPHA: 4,

  // Skor hasil per butir (Scoring weight)
  RESULT_CORRECT_NO_HINT: 1.0,
  RESULT_CORRECT_WITH_HINT: 0.6,
  RESULT_INCORRECT: 0.0,

  // Ebbinghaus Forgetting Curve Decay (Penurunan penguasaan akibat inaktivitas)
  DECAY_INACTIVITY_DAYS_THRESHOLD: 7, // Mulai decay setelah 7 hari tidak latihan
  DECAY_RATE_PER_WEEK: 0.05,          // Berkurang 0.05 per minggu inaktif

  // Kategori level penguasaan skill
  LEVEL_THRESHOLDS: {
    WEAK_MAX: 0.5,    // < 0.5: Butuh remedial intensif
    MEDIUM_MAX: 0.8,  // 0.5 - 0.8: Sedang berkembang
    // > 0.8: Kuat / Mahir
  },
} as const;

export const LEITNER_CONFIG = {
  // Interval kotak Leitner (dalam satuan hari kalender)
  // Box 1: 1 hari, Box 2: 2 hari, Box 3: 4 hari, Box 4: 8 hari, Box 5: 16 hari
  BOX_INTERVALS_DAYS: [1, 2, 4, 8, 16] as const,
  MIN_BOX: 1,
  MAX_BOX: 5,
} as const;

export const QUESTION_SELECTOR_CONFIG = {
  // Rasio komposisi bank soal dalam satu sesi adaptif
  CURRENT_LESSON_RATIO: 0.60, // 60% materi pelajaran saat ini
  WEAKEST_SKILL_RATIO: 0.25,  // 25% penguatan skill dengan mastery terendah
  DUE_REVIEW_RATIO: 0.15,     // 15% pengulangan berjarak yang telah jatuh tempo

  // Adaptive Difficulty Adjustment (Flow Channel Csikszentmihalyi)
  STREAK_TO_INCREASE_DIFFICULTY: 3, // 3 benar beruntun -> naikkan tantangan (+1)
  STREAK_TO_DECREASE_DIFFICULTY: 2, // 2 salah beruntun -> turunkan beban kognitif (-1)
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 5,
} as const;
