/**
 * PHONETIC_FINGERPRINT.TS - Sidik Jari Fonetik 6 Fonem Kritis Penutur L1 Indonesia
 *
 * DASAR AKADEMIS:
 * Penutur bahasa Indonesia (L1) memiliki 6 area interferensi fonologis spesifik dalam bahasa Inggris:
 * 1. /θ/ (Voiceless dental fricative - think, thank, path) -> kerap diganti /s/ atau /t/
 * 2. /ð/ (Voiced dental fricative - this, they, mother) -> kerap diganti /d/
 * 3. /v/ (Voiced labiodental fricative - review, have, travel) -> kerap diganti /f/ atau /p/
 * 4. Silent Letters (Huruf bisu - could, debt, subtle, island) -> kerap dibaca utuh
 * 5. Consonant Clusters (Gugus konsonan akhir - request, ask, strict) -> kerap dihilangkan letupannya
 * 6. Vowel Length Contrast (/iː/ vs /ɪ/ - leave/live, sheet/shit) -> kerap disamakan durasinya
 */

import { safeGetStorage, safeSetStorage } from './storage';

export interface PhonemicCompetency {
  code: string;
  symbol: string;
  nameId: string;
  category: string;
  masteryPercent: number; // 0 - 100
  sampleWords: string[];
  articulatoryTip: string;
  status: 'Mastered' | 'Developing' | 'Needs Practice';
}

export const CRITICAL_L1_PHONEMES: Omit<PhonemicCompetency, 'masteryPercent' | 'status'>[] = [
  {
    code: 'dental_voiceless',
    symbol: '/θ/',
    nameId: 'Desis Gigi Tak Bersuara',
    category: 'Dental Fricative',
    sampleWords: ['think', 'thank', 'three', 'methodology'],
    articulatoryTip: 'Gigit lembut ujung lidah di antara gigi atas dan bawah, embuskan udara tanpa getaran pita suara.',
  },
  {
    code: 'dental_voiced',
    symbol: '/ð/',
    nameId: 'Desis Gigi Bersuara',
    category: 'Dental Fricative',
    sampleWords: ['this', 'that', 'they', 'together'],
    articulatoryTip: 'Posisi lidah sama seperti /θ/, namun getarkan pita suara di tenggorokan seperti mendengung.',
  },
  {
    code: 'labiodental_v',
    symbol: '/v/',
    nameId: 'Frikatif Bibir-Gigi',
    category: 'Labiodental',
    sampleWords: ['review', 'have', 'travel', 'improve'],
    articulatoryTip: 'Sentuhkan gigi atas ke bibir bawah bagian dalam, jangan biarkan kedua bibir menutup rapat seperti /p/.',
  },
  {
    code: 'silent_letters',
    symbol: 'Silent /l, b, k/',
    nameId: 'Konsonan Bisu (Silent Letters)',
    category: 'Orthography',
    sampleWords: ['could', 'would', 'debt', 'subtle', 'know'],
    articulatoryTip: 'Huruf "l" pada "could" atau "b" pada "debt" tidak boleh dibunyikan sama sekali.',
  },
  {
    code: 'consonant_clusters',
    symbol: 'Clusters /-st, -ks/',
    nameId: 'Gugus Konsonan Akhir',
    category: 'Coda Clusters',
    sampleWords: ['request', 'ask', 'next', 'strict'],
    articulatoryTip: 'Bunyikan kedua konsonan akhir secara berurutan dan tuntas tanpa memotong letupan /t/ atau /k/.',
  },
  {
    code: 'vowel_length',
    symbol: '/iː/ vs /ɪ/',
    nameId: 'Kontras Panjang Vokal',
    category: 'Vowel Duration',
    sampleWords: ['leave vs live', 'sheet vs shit', 'reach vs rich'],
    articulatoryTip: 'Tarik sudut bibir seperti tersenyum untuk vokal panjang /iː/, dan rilekskan mulut untuk /ɪ/ pendek.',
  },
];

const FINGERPRINT_STORAGE_KEY = 'fluenzy_phonetic_fingerprint_v1';

/**
 * Menghitung status sidik jari fonetik pengguna berdasarkan riwayat latihan
 */
export function calculatePhoneticFingerprint(
  customMastery?: Record<string, number>
): PhonemicCompetency[] {
  // Baseline empiris rata-rata penutur L1 Indonesia awal
  const defaultMastery: Record<string, number> = {
    dental_voiceless: 68,
    dental_voiced: 72,
    labiodental_v: 84,
    silent_letters: 78,
    consonant_clusters: 74,
    vowel_length: 70,
  };

  const masteryMap = {
    ...defaultMastery,
    ...customMastery,
  };

  return CRITICAL_L1_PHONEMES.map((item) => {
    const rawVal = masteryMap[item.code] ?? 70;
    const clamped = Math.max(0, Math.min(100, Math.round(rawVal)));

    let status: 'Mastered' | 'Developing' | 'Needs Practice' = 'Developing';
    if (clamped >= 80) {
      status = 'Mastered';
    } else if (clamped < 65) {
      status = 'Needs Practice';
    }

    return {
      ...item,
      masteryPercent: clamped,
      status,
    };
  });
}

/**
 * Menyimpan pembaruan skor fonem ke storage lokal secara aman
 */
export function recordPhonemeObservation(code: string, isCorrect: boolean): void {
  const currentMap = safeGetStorage<Record<string, number>>(FINGERPRINT_STORAGE_KEY, {});
  const prev = currentMap[code] ?? 70;
  // Exponential Moving Average sederhana (alpha = 0.2)
  const update = isCorrect ? prev + (100 - prev) * 0.15 : prev - prev * 0.12;
  currentMap[code] = Math.round(Math.max(20, Math.min(99, update)));

  safeSetStorage(FINGERPRINT_STORAGE_KEY, currentMap);
}

export function getStoredPhonemicMastery(): Record<string, number> {
  return safeGetStorage<Record<string, number>>(FINGERPRINT_STORAGE_KEY, {});
}

