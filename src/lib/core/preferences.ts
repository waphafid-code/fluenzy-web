// ============================================================================
// USER PERSONALIZATION & LEARNING PREFERENCES
// ============================================================================

import { safeGetStorage, safeSetStorage } from './storage';

export type UserLearningGoal = 'career' | 'academic' | 'travel' | 'social';
export type UserProficiencyTier = 'A1' | 'A2' | 'B1';

export interface GoalMetadata {
  id: UserLearningGoal;
  titleId: string;
  titleEn: string;
  emoji: string;
  descriptionId: string;
  porsiBahasaIndonesia: string;
  sampleTopics: string[];
}

export const LEARNING_GOALS: Record<UserLearningGoal, GoalMetadata> = {
  career: {
    id: 'career',
    titleId: 'Karir, IT & Kerja',
    titleEn: 'Tech & Career',
    emoji: '💼',
    descriptionId: 'Interview kerja, daily standup, diskusi arsitektur, dan komunikasi profesional.',
    porsiBahasaIndonesia: '50% ID / 50% EN',
    sampleTopics: ['Job Interview', 'Daily Standup', 'PR Trade-offs', 'Incident Report'],
  },
  academic: {
    id: 'academic',
    titleId: 'Kuliah & Ujian',
    titleEn: 'Academic & Exams',
    emoji: '🎓',
    descriptionId: 'Presentasi skripsi, tanya jawab dengan dosen, diskusi ilmiah, dan persiapan TOEFL/IELTS.',
    porsiBahasaIndonesia: '40% ID / 60% EN',
    sampleTopics: ['Thesis Defense', 'Asking Professor', 'Research Methodology', 'Study Abroad'],
  },
  travel: {
    id: 'travel',
    titleId: 'Wisata & Liburan',
    titleEn: 'Travel & Leisure',
    emoji: '✈️',
    descriptionId: 'Check-in bandara, memesan hotel, bertanya arah jalan, dan belanja di luar negeri.',
    porsiBahasaIndonesia: '60% ID / 40% EN',
    sampleTopics: ['Airport Check-in', 'Hotel Booking', 'Asking Directions', 'Ordering Food'],
  },
  social: {
    id: 'social',
    titleId: 'Percakapan Santai',
    titleEn: 'Casual Chit-Chat',
    emoji: '🗣️',
    descriptionId: 'Small talk natural, menceritakan hobi, nonton film, dan nongkrong tanpa kaku.',
    porsiBahasaIndonesia: '60% ID / 40% EN',
    sampleTopics: ['Self Introduction', 'Hobbies & Weekend', 'Coffee Shop Chat', 'Expressing Feelings'],
  },
};

export interface ProficiencyTierMetadata {
  tier: UserProficiencyTier;
  titleId: string;
  cefrRange: string;
  porsiIndonesia: string;
  descriptionId: string;
  pedagogicalTip: string;
}

export const PROFICIENCY_TIERS: Record<UserProficiencyTier, ProficiencyTierMetadata> = {
  A1: {
    tier: 'A1',
    titleId: 'Pemula Dasar (Beginner)',
    cefrRange: 'CEFR A1',
    porsiIndonesia: '70% ID / 30% EN',
    descriptionId: 'Baru mulai belajar. Butuh bimbingan santai dalam Bahasa Indonesia dan kalimat pendek.',
    pedagogicalTip: 'Fokus berani buka mulut, jangan pusingkan rumus grammar dulu!',
  },
  A2: {
    tier: 'A2',
    titleId: 'Menengah Awal (Elementary)',
    cefrRange: 'CEFR A2',
    porsiIndonesia: '45% ID / 55% EN',
    descriptionId: 'Paham teks bacaan, tapi lidah masih kaku dan sering bingung merangkai kata saat bicara.',
    pedagogicalTip: 'Latih pola kalimat siap pakai (chunks) dan ritme intonasi harian.',
  },
  B1: {
    tier: 'B1',
    titleId: 'Percakapan Mandiri (Intermediate)',
    cefrRange: 'CEFR B1',
    porsiIndonesia: '20% ID / 80% EN',
    descriptionId: 'Sudah bisa ngobrol mandiri. Ingin melatih kelancaran, intonasi native, dan istilah kerja.',
    pedagogicalTip: 'Poles nuansa kesopanan diplomatis dan minimalkan jeda berpikir.',
  },
};

export type MascotChoice = 'boy' | 'girl' | 'lily' | 'arthur';
export type LearningFocus = 'balanced' | 'grammar' | 'review' | 'vocab';
export type AudioSpeedChoice = 0.8 | 0.95 | 1.1;
export type EnglishAccentChoice = 'us' | 'uk' | 'au' | 'auto';
export type VoiceGenderChoice = 'auto' | 'male' | 'female';

export type TargetAccent = 'en-US' | 'en-GB' | 'en-AU' | 'us' | 'uk' | 'au' | 'auto';
export type VoiceTimbre = 'ember' | 'breeze' | 'cove' | 'auto' | 'male' | 'female';

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
  arthur: {
    id: 'arthur',
    name: 'Arthur (Coach Leo)',
    role: 'Tech Lead & Diagnostic Mentor',
    gender: 'male',
    avatar: '/mascot/arthur_head_circle.png',
    fullImage: '/mascot/lingua_boy_coffee.jpg',
    quote: 'Teknik yang tepat, membuatmu selangkah lebih maju.',
    specialty: ['Technical Presentation', 'Diagnostic Tests', 'Grammar Surgery'],
  },
  boy: {
    id: 'boy',
    name: 'Leo',
    role: 'Tech Lead & Diagnostic Mentor',
    gender: 'male',
    avatar: '/mascot/lingua_boy_coffee.jpg',
    fullImage: '/mascot/lingua_boy_coffee.jpg',
    quote: 'Teknik yang tepat, membuatmu selangkah lebih maju.',
    specialty: ['Technical Presentation', 'Diagnostic Tests', 'Grammar Surgery'],
  },
  lily: {
    id: 'arthur',
    name: 'Arthur (Coach Leo)',
    role: 'Tech Lead & Diagnostic Mentor',
    gender: 'male',
    avatar: '/mascot/arthur_head_circle.png',
    fullImage: '/mascot/lingua_boy_coffee.jpg',
    quote: 'Teknik yang tepat, membuatmu selangkah lebih maju.',
    specialty: ['Technical Presentation', 'Diagnostic Tests', 'Grammar Surgery'],
  },
  girl: {
    id: 'boy',
    name: 'Leo',
    role: 'Tech Lead & Diagnostic Mentor',
    gender: 'male',
    avatar: '/mascot/lingua_boy_coffee.jpg',
    fullImage: '/mascot/lingua_boy_coffee.jpg',
    quote: 'Teknik yang tepat, membuatmu selangkah lebih maju.',
    specialty: ['Technical Presentation', 'Diagnostic Tests', 'Grammar Surgery'],
  },
};

export function getCompanionInfo(choice: MascotChoice): CompanionInfo {
  return COMPANIONS[choice] || COMPANIONS.arthur;
}

export type VoiceEngineProvider = 'browser-groq' | 'vibevoice';

export interface AcousticVoiceProfile {
  targetAccent: string;
  voiceGender: VoiceGenderChoice;
  voiceTimbre: string;
  audioSpeed: AudioSpeedChoice;
  voiceEngine: VoiceEngineProvider;
  label: string;
  coachTitle: string;
}

export function getAcousticProfile(
  accentOrPrefs?: TargetAccent | EnglishAccentChoice | UserPreferences,
  timbre?: VoiceTimbre | VoiceGenderChoice
): AcousticVoiceProfile {
  let resolvedAccent: string = 'us';
  let resolvedTimbre: string = 'ember';
  let resolvedGender: VoiceGenderChoice = 'auto';
  let resolvedSpeed: AudioSpeedChoice = 0.95;
  let resolvedEngine: VoiceEngineProvider = 'browser-groq';

  if (typeof accentOrPrefs === 'object' && accentOrPrefs !== null) {
    const p = accentOrPrefs as UserPreferences;
    resolvedAccent =
      p.englishAccent && p.englishAccent !== 'auto'
        ? p.englishAccent
        : p.targetAccent && p.targetAccent !== 'auto'
        ? p.targetAccent
        : 'us';
    resolvedTimbre = p.voiceTimbre || (p.voiceGender === 'female' ? 'breeze' : 'ember');
    resolvedGender = p.voiceGender || 'auto';
    resolvedSpeed = p.audioSpeed || 0.95;
    resolvedEngine = p.voiceEngine || 'browser-groq';
  } else if (typeof accentOrPrefs === 'string') {
    resolvedAccent = accentOrPrefs;
    if (timbre) {
      resolvedTimbre = timbre;
    }
  } else {
    const p = getUserPreferences();
    resolvedAccent =
      p.englishAccent && p.englishAccent !== 'auto'
        ? p.englishAccent
        : p.targetAccent && p.targetAccent !== 'auto'
        ? p.targetAccent
        : 'us';
    resolvedTimbre = p.voiceTimbre || (p.voiceGender === 'female' ? 'breeze' : 'ember');
    resolvedGender = p.voiceGender || 'auto';
    resolvedSpeed = p.audioSpeed || 0.95;
    resolvedEngine = p.voiceEngine || 'browser-groq';
  }

  const isUK = resolvedAccent === 'uk' || resolvedAccent === 'en-GB';
  const isAU = resolvedAccent === 'au' || resolvedAccent === 'en-AU';
  const label = isUK
    ? 'British English (en-GB)'
    : isAU
    ? 'Australian English (en-AU)'
    : 'American English (en-US)';

  const isFemale = resolvedTimbre === 'breeze' || resolvedTimbre === 'female';
  const isCove = resolvedTimbre === 'cove';
  const finalTimbreCode = isFemale ? 'breeze' : isCove ? 'cove' : 'ember';
  const coachTitle = isFemale
    ? 'Breeze Voice (Female)'
    : isCove
    ? 'Cove Voice (Neutral)'
    : 'Ember Voice (Male)';

  return {
    targetAccent: resolvedAccent,
    voiceGender: resolvedGender,
    voiceTimbre: finalTimbreCode,
    audioSpeed: resolvedSpeed,
    voiceEngine: resolvedEngine,
    label,
    coachTitle,
  };
}

export interface UserPreferences {
  goal: UserLearningGoal;
  proficiencyTier: UserProficiencyTier;
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
  targetAccent: TargetAccent;
  voiceTimbre: VoiceTimbre;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  goal: 'career',
  proficiencyTier: 'A2',
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
  targetAccent: 'auto',
  voiceTimbre: 'ember',
};

/**
 * Menentukan gender suara aktif: jika 'auto', disesuaikan dengan gender maskot (Arthur: male, Lily: female).
 */
export function getEffectiveVoiceGender(prefs?: UserPreferences): 'male' | 'female' {
  const p = prefs || getUserPreferences();
  if (p.voiceGender === 'male' || p.voiceGender === 'female') {
    return p.voiceGender;
  }
  // Default for Coach Leo / Arthur: male natural timbre
  return 'male';
}

const STORAGE_KEY = 'fluenzy_user_preferences_v1';

/**
 * Mengambil preferensi pengguna dari storage atau fallback default
 */
export function getUserPreferences(): UserPreferences {
  const parsed = safeGetStorage<Partial<UserPreferences>>(STORAGE_KEY, {});
  return {
    ...DEFAULT_PREFERENCES,
    ...parsed,
  };
}

/**
 * Menyimpan preferensi pengguna ke storage dan memicu custom event untuk sinkronisasi
 */
export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences();
  const updated: UserPreferences = { ...current, ...prefs };

  safeSetStorage(STORAGE_KEY, updated);

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('fluenzy-preferences-updated', { detail: updated }));
    } catch {
      // Abaikan jika CustomEvent belum diinisialisasi
    }
  }
  return updated;
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
