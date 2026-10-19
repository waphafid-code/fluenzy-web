import { ERROR_CLASSIFIER_CONFIG } from './config';

/**
 * ERRORCLASSIFIER.TS - Mesin Klasifikasi Kesalahan Kognitif Siswa
 *
 * DASAR AKADEMIS & TAKSONOMI LINGUISTIK:
 * Mengadopsi Surface Strategy Taxonomy (Dulay, Burt, & Krashen, 1982):
 * 1. Omission (Penghilangan): missing_word -> Siswa melompati auxiliary verb / preposition.
 * 2. Addition (Penambahan): extra_word -> Redundansi struktur bahasa ibu (L1 interference).
 * 3. Misordering (Pembalikan Urutan): word_order -> Kesalahan urutan sintaksis S-V-O atau adjective-noun.
 * 4. Misformation (Pembentukan Keliru): typo (slip mekanikal ortografi) vs wrong_word (lexical/morphological mistake).
 * 5. Selection Error: wrong_choice -> Kegagalan pemahaman diskriminatif pada pilihan ganda.
 */

export type ErrorType =
  | 'typo'
  | 'word_order'
  | 'missing_word'
  | 'extra_word'
  | 'wrong_word'
  | 'wrong_choice'
  | 'listening_error';

export interface ErrorClassificationResult {
  isCorrect: boolean;
  errorType: ErrorType | null;
  detail: string;
  similarityScore: number; // 0.0 sampai 1.0 (berdasarkan Jaccard / Levenshtein similarity)
}

/**
 * Menghitung Jarak Levenshtein antara string a dan b.
 * Rumus:
 * d(i, j) = min(
 *   d(i-1, j) + 1,        // deletion
 *   d(i, j-1) + 1,        // insertion
 *   d(i-1, j-1) + cost    // substitution (cost = 0 jika a[i]==b[j], else 1)
 * )
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // Deletion
        dp[i][j - 1] + 1,      // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Normalisasi teks: lowercase, trim, hilangkan tanda baca luar, dan rapikan multiple spasi.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Memecah string menjadi array token kata bersih.
 */
export function tokenizeWords(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized.split(' ');
}

/**
 * Fungsi Murni Klasifikasi Kesalahan
 *
 * @param userAnswer Jawaban input dari siswa
 * @param correctAnswer Kunci jawaban acuan sistem
 * @param exerciseType Tipe latihan ('multiple_choice', 'fill_blank', 'word_order', 'matching', dll.)
 */
export function classifyError(
  userAnswer: string,
  correctAnswer: string,
  exerciseType: string = 'fill_blank'
): ErrorClassificationResult {
  const cleanUser = normalizeText(userAnswer);
  const cleanCorrect = normalizeText(correctAnswer);

  // 1. Kasus Sempurna: Teks identik setelah normalisasi
  if (cleanUser === cleanCorrect) {
    return {
      isCorrect: true,
      errorType: null,
      detail: 'Jawaban tepat dan sempurna.',
      similarityScore: 1.0,
    };
  }

  // 2. Kasus Pilihan Ganda / Matching
  if (exerciseType === 'multiple_choice' || exerciseType === 'matching') {
    return {
      isCorrect: false,
      errorType: 'wrong_choice',
      detail: 'Pilihan yang dipilih belum sesuai dengan konteks soal.',
      similarityScore: 0.0,
    };
  }

  // 3. Kasus Latihan Mendengarkan Audio
  if (exerciseType === 'listeningQuiz') {
    const levDist = calculateLevenshteinDistance(cleanUser, cleanCorrect);
    const maxLen = Math.max(cleanUser.length, cleanCorrect.length);
    const similarity = maxLen === 0 ? 1.0 : Math.max(0, 1 - levDist / maxLen);

    if (levDist <= ERROR_CLASSIFIER_CONFIG.MAX_LEVENSHTEIN_TYPO) {
      return {
        isCorrect: false,
        errorType: 'typo',
        detail: 'Hampir tepat! Ada kesalahan ejaan kecil saat mentranskripsikan audio.',
        similarityScore: similarity,
      };
    }

    return {
      isCorrect: false,
      errorType: 'listening_error',
      detail: 'Kesalahan pendengaran: kata yang diketik berbeda dari ujaran audio penutur.',
      similarityScore: similarity,
    };
  }

  // 4. Analisis Berbasis Token Kalimat & Kata
  const userTokens = tokenizeWords(cleanUser);
  const correctTokens = tokenizeWords(cleanCorrect);

  const rawLevDist = calculateLevenshteinDistance(cleanUser, cleanCorrect);
  const maxLen = Math.max(cleanUser.length, cleanCorrect.length);
  const similarityScore = maxLen === 0 ? 1.0 : Number((1 - rawLevDist / maxLen).toFixed(2));

  // A. Single Word Comparison (Soal Kosakata Tunggal)
  if (correctTokens.length === 1 && userTokens.length === 1) {
    const wordDist = calculateLevenshteinDistance(userTokens[0], correctTokens[0]);
    if (wordDist <= ERROR_CLASSIFIER_CONFIG.MAX_LEVENSHTEIN_TYPO) {
      return {
        isCorrect: false,
        errorType: 'typo',
        detail: `Typo pada kata "${userTokens[0]}". Bentuk yang benar adalah "${correctTokens[0]}".`,
        similarityScore,
      };
    }
    return {
      isCorrect: false,
      errorType: 'wrong_word',
      detail: `Kata yang dimasukkan keliru. Seharusnya "${correctTokens[0]}".`,
      similarityScore,
    };
  }

  // B. Typo Seluruh String (Jarak Levenshtein <= 2 dan perbedaan panjang karakter <= 2)
  if (
    rawLevDist <= ERROR_CLASSIFIER_CONFIG.MAX_LEVENSHTEIN_TYPO &&
    Math.abs(cleanUser.length - cleanCorrect.length) <= ERROR_CLASSIFIER_CONFIG.MAX_LENGTH_DIFF_TYPO
  ) {
    return {
      isCorrect: false,
      errorType: 'typo',
      detail: `Kesalahan ketik minor (jarak edit: ${rawLevDist}). Perhatikan ejaan hurufnya.`,
      similarityScore,
    };
  }

  // C. Analisis Urutan Kata (Word Order / Sintaksis)
  // Syarat: jumlah kata sama, himpunan kata identik (anagram tingkat kata), tetapi urutan berbeda
  if (userTokens.length === correctTokens.length && userTokens.length > 1) {
    const sortedUser = [...userTokens].sort();
    const sortedCorrect = [...correctTokens].sort();
    const isSameMultiset = sortedUser.every((word, idx) => word === sortedCorrect[idx]);

    if (isSameMultiset) {
      return {
        isCorrect: false,
        errorType: 'word_order',
        detail: 'Kata-kata yang kamu pilih sudah benar, namun urutan kalimatnya terbalik.',
        similarityScore,
      };
    }

    // Cek apakah hanya ada 1 kata yang berbeda dan kata tersebut adalah typo
    let differingWords = 0;
    let singleWordTypo = false;

    for (let i = 0; i < userTokens.length; i++) {
      if (userTokens[i] !== correctTokens[i]) {
        differingWords++;
        if (calculateLevenshteinDistance(userTokens[i], correctTokens[i]) <= ERROR_CLASSIFIER_CONFIG.MAX_LEVENSHTEIN_TYPO) {
          singleWordTypo = true;
        }
      }
    }

    if (differingWords === 1 && singleWordTypo) {
      return {
        isCorrect: false,
        errorType: 'typo',
        detail: 'Terdapat satu kesalahan ketik kecil pada salah satu kata dalam kalimat.',
        similarityScore,
      };
    }
  }

  // D. Analisis Missing Word (Penghilangan Kata / Omission)
  if (userTokens.length < correctTokens.length) {
    // Cek apakah seluruh userTokens termuat dalam correctTokens secara berurutan
    let userIdx = 0;
    let matchedCount = 0;

    for (const token of correctTokens) {
      if (userIdx < userTokens.length && token === userTokens[userIdx]) {
        matchedCount++;
        userIdx++;
      }
    }

    const missingCount = correctTokens.length - userTokens.length;

    if (matchedCount === userTokens.length) {
      return {
        isCorrect: false,
        errorType: 'missing_word',
        detail: `Kalimatmu kurang ${missingCount} kata untuk melengkapi struktur yang tepat.`,
        similarityScore,
      };
    }
  }

  // E. Analisis Extra Word (Penambahan Kata Tidak Perlu / Addition)
  if (userTokens.length > correctTokens.length) {
    let correctIdx = 0;
    let matchedCount = 0;

    for (const token of userTokens) {
      if (correctIdx < correctTokens.length && token === correctTokens[correctIdx]) {
        matchedCount++;
        correctIdx++;
      }
    }

    const extraCount = userTokens.length - correctTokens.length;

    if (matchedCount === correctTokens.length) {
      return {
        isCorrect: false,
        errorType: 'extra_word',
        detail: `Kalimatmu kelebihan ${extraCount} kata yang tidak diperlukan dalam struktur ini.`,
        similarityScore,
      };
    }
  }

  // F. Kesalahan Leksikal / Tata Bahasa Total (Wrong Word)
  return {
    isCorrect: false,
    errorType: 'wrong_word',
    detail: 'Struktur atau pilihan kata berbeda total dari jawaban yang diharapkan.',
    similarityScore,
  };
}
