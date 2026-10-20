// ============================================================================
// USER PERSONALIZATION & LEARNING PREFERENCES
// ============================================================================

export type MascotChoice = 'boy' | 'girl' | 'lily' | 'arthur';
export type LearningFocus = 'balanced' | 'grammar' | 'review' | 'vocab';
export type AudioSpeedChoice = 0.8 | 0.95 | 1.1;
export type EnglishAccentChoice = 'us' | 'uk' | 'au' | 'auto';

export interface CompanionInfo {
  id: MascotChoice;
  name: string;
  role: string;
  avatar: string;
  fullImage: string;
  quote: string;
  specialty: string[];
}

export const COMPANIONS: Record<MascotChoice, CompanionInfo> = {
  lily: {
    id: 'lily',
    name: 'Lily (Lumi)',
    role: 'AI Peer & Speaking Coach',
    avatar: '/mascot/lily_head_circle.png',
    fullImage: '/mascot/lumi_solo.png',
    quote: 'Kamu pasti bisa! Sedikit demi sedikit, pasti bisa!',
    specialty: ['Home Roadmap', 'Speaking Drill', 'Live Peer Call'],
  },
  arthur: {
    id: 'arthur',
    name: 'Arthur',
    role: 'Tech Lead & Diagnostic Mentor',
    avatar: '/mascot/arthur_head_circle.png',
    fullImage: '/mascot/arthur_character.png',
    quote: 'Teknik yang tepat, membuatmu selangkah lebih maju.',
    specialty: ['Weekly Boss Battle', 'Diagnostic Tests', 'Grammar Surgery'],
  },
  boy: {
    id: 'boy',
    name: 'Arthur',
    role: 'Tech Lead & Diagnostic Mentor',
    avatar: '/mascot/arthur_head_circle.png',
    fullImage: '/mascot/arthur_character.png',
    quote: 'Teknik yang tepat, membuatmu selangkah lebih maju.',
    specialty: ['Weekly Boss Battle', 'Diagnostic Tests', 'Grammar Surgery'],
  },
  girl: {
    id: 'girl',
    name: 'Lily (Lumi)',
    role: 'AI Peer & Speaking Coach',
    avatar: '/mascot/lily_head_circle.png',
    fullImage: '/mascot/lumi_solo.png',
    quote: 'Kamu pasti bisa! Sedikit demi sedikit, pasti bisa!',
    specialty: ['Home Roadmap', 'Speaking Drill', 'Live Peer Call'],
  },
};

export function getCompanionInfo(choice: MascotChoice): CompanionInfo {
  return COMPANIONS[choice] || COMPANIONS.lily;
}

export interface UserPreferences {
  mascot: MascotChoice;
  dailyGoalXp: number;
  audioSpeed: AudioSpeedChoice;
  autoPronounce: boolean;
  learningFocus: LearningFocus;
  soundEffectsEnabled: boolean;
  englishAccent: EnglishAccentChoice;
  customEnglishVoice: string; // 'auto' | exact name
  customIndonesianVoice: string; // 'auto' | exact name
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  mascot: 'boy',
  dailyGoalXp: 50,
  audioSpeed: 0.95, // Kecepatan suara favorit user yang natural
  autoPronounce: false,
  learningFocus: 'balanced',
  soundEffectsEnabled: true,
  englishAccent: 'auto',
  customEnglishVoice: 'auto',
  customIndonesianVoice: 'auto',
};

const STORAGE_KEY = 'fluenzy_user_preferences_v1';

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
      return (globalThis as unknown as { localStorage: Storage }).localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Mengambil preferensi pengguna dari storage atau fallback default
 */
export function getUserPreferences(): UserPreferences {
  const storage = getStorage();
  if (!storage) return DEFAULT_PREFERENCES;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Menyimpan preferensi pengguna ke storage dan memicu custom event untuk sinkronisasi
 */
export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const storage = getStorage();
  const current = getUserPreferences();
  const updated: UserPreferences = { ...current, ...prefs };
  if (!storage) return updated;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('fluenzy-preferences-updated', { detail: updated }));
      } catch {
        // Abaikan jika CustomEvent belum diinisialisasi
      }
    }
    return updated;
  } catch {
    return updated;
  }
}

/**
 * Menghitung persentase pencapaian target harian
 */
export function calculateDailyGoalProgress(todayXp: number, goalXp: number): {
  percentage: number;
  isAchieved: boolean;
  remainingXp: number;
} {
  const safeGoal = Math.max(1, goalXp || 50);
  const percentage = Math.min(100, Math.round((todayXp / safeGoal) * 100));
  const remainingXp = Math.max(0, safeGoal - todayXp);
  return {
    percentage,
    isAchieved: todayXp >= safeGoal,
    remainingXp,
  };
}
