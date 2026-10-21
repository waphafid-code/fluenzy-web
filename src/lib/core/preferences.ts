// ============================================================================
// USER PERSONALIZATION & LEARNING PREFERENCES
// ============================================================================

export type MascotChoice = 'boy' | 'girl' | 'lily' | 'arthur';
export type LearningFocus = 'balanced' | 'grammar' | 'review' | 'vocab';
export type AudioSpeedChoice = 0.8 | 0.95 | 1.1;
export type EnglishAccentChoice = 'us' | 'uk' | 'au' | 'auto';
export type VoiceGenderChoice = 'auto' | 'male' | 'female';

export interface CompanionInfo {
  id: MascotChoice;
  name: string;
  role: string;
  gender: 'male' | 'female';
  avatar: string;
  fullImage: string;
  quote: string;
  specialty: string[];
}

export const COMPANIONS: Record<MascotChoice, CompanionInfo> = {
  lily: {
    id: 'lily',
    name: 'Lily',
    role: 'AI Peer & Speaking Coach',
    gender: 'female',
    avatar: '/mascot/lily_head_circle.png',
    fullImage: '/mascot/lingua_girl_waving.jpg',
    quote: 'Kamu pasti bisa! Sedikit demi sedikit, pasti bisa!',
    specialty: ['Home Roadmap', 'Speaking Drill', 'Live Peer Call'],
  },
  arthur: {
    id: 'arthur',
    name: 'Arthur',
    role: 'Tech Lead & Diagnostic Mentor',
    gender: 'male',
    avatar: '/mascot/arthur_head_circle.png',
    fullImage: '/mascot/lingua_boy_coffee.jpg',
    quote: 'Teknik yang tepat, membuatmu selangkah lebih maju.',
    specialty: ['Weekly Boss Battle', 'Diagnostic Tests', 'Grammar Surgery'],
  },
  boy: {
    id: 'boy',
    name: 'Leo',
    role: 'Tech Lead & Diagnostic Mentor',
    gender: 'male',
    avatar: '/mascot/lingua_boy_coffee.jpg',
    fullImage: '/mascot/lingua_boy_coffee.jpg',
    quote: 'Teknik yang tepat, membuatmu selangkah lebih maju.',
    specialty: ['Weekly Boss Battle', 'Diagnostic Tests', 'Grammar Surgery'],
  },
  girl: {
    id: 'girl',
    name: 'Maya & Lily',
    role: 'AI Peer & Speaking Coach',
    gender: 'female',
    avatar: '/mascot/lingua_girl_waving.jpg',
    fullImage: '/mascot/lingua_girl_waving.jpg',
    quote: 'Kamu pasti bisa! Sedikit demi sedikit, pasti bisa!',
    specialty: ['Home Roadmap', 'Speaking Drill', 'Live Peer Call'],
  },
};

export function getCompanionInfo(choice: MascotChoice): CompanionInfo {
  return COMPANIONS[choice] || COMPANIONS.lily;
}

export type VoiceEngineProvider = 'browser-groq' | 'vibevoice';

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
  voiceGender: VoiceGenderChoice; // 'auto' (mengikuti maskot) | 'male' | 'female'
  voiceEngine: VoiceEngineProvider;
  vibeVoiceEndpoint: string;
  vibeVoiceApiKey: string;
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
  voiceGender: 'auto',
  voiceEngine: 'browser-groq',
  vibeVoiceEndpoint: '',
  vibeVoiceApiKey: '',
};

/**
 * Menentukan gender suara aktif: jika 'auto', disesuaikan dengan gender maskot (Arthur: male, Lily: female).
 */
export function getEffectiveVoiceGender(prefs?: UserPreferences): 'male' | 'female' {
  const currentPrefs = prefs || getUserPreferences();
  if (currentPrefs.voiceGender === 'male') return 'male';
  if (currentPrefs.voiceGender === 'female') return 'female';
  // Jika 'auto', ikuti gender maskot
  const companion = getCompanionInfo(currentPrefs.mascot);
  return companion.gender || 'male';
}

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
