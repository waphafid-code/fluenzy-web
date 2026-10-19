import { LEITNER_CONFIG } from './config';

/**
 * SPACEDREPETITION.TS - Mesin Pengulangan Berjarak (Spaced Repetition System / SRS)
 *
 * DASAR AKADEMIS & METODOLOGI:
 * 1. Leitner Box System (Sebastian Leitner, 1972):
 *    Algoritma pengulangan bertingkat berbasis 5 kotak memori (Boxes 1-5).
 *    Setiap kenaikan kotak melipatgandakan interval waktu retensi memori:
 *      - Kotak 1: 1 hari   (Memori kerja / baru dipelajari)
 *      - Kotak 2: 2 hari   (Fase konsolidasi awal)
 *      - Kotak 3: 4 hari   (Fase stabilisasi memori jangka menengah)
 *      - Kotak 4: 8 hari   (Fase memori jangka panjang)
 *      - Kotak 5: 16 hari  (Retensi permanen / otomatisasi kognitif)
 *
 * 2. Spacing Effect (Ebbinghaus, 1885; Cepeda et al., 2006):
 *    Distribusi latihan dengan jeda waktu terbukti melipatgandakan retensi hingga 200%
 *    dibandingkan metode belajar berulang dalam satu waktu (massed practice / cramming).
 *
 * 3. Aturan Transisi Kotak:
 *    - Jawaban Benar : Promosi kotak (+1 level), hingga batas maksimal Kotak 5.
 *    - Jawaban Salah : Demosi penuh (reset kembali ke Kotak 1) untuk penanganan remedial segera.
 */

export interface LeitnerTransitionResult {
  previousBox: number;
  nextBox: number;
  intervalDays: number;
  nextReviewAt: Date;
  action: 'promoted' | 'max_level_maintained' | 'reset_to_box_1';
}

export interface ReviewScheduleItem {
  id?: string;
  userId: string;
  questionId: string;
  box: number;
  nextReviewAt: Date | string;
}

/**
 * Mengambil durasi jeda hari untuk nomor kotak tertentu.
 */
export function getIntervalDaysForBox(box: number): number {
  const clampedBox = Math.max(
    LEITNER_CONFIG.MIN_BOX,
    Math.min(LEITNER_CONFIG.MAX_BOX, Math.floor(box))
  );
  // Index array dimulai dari 0 (Box 1 -> index 0)
  return LEITNER_CONFIG.BOX_INTERVALS_DAYS[clampedBox - 1];
}

/**
 * Menghitung tanggal review berikutnya dari kotak dan tanggal acuan.
 */
export function calculateNextReviewDate(
  box: number,
  fromDate: Date | string | number = new Date()
): Date {
  const baseTime = new Date(fromDate).getTime();
  const validBaseTime = isNaN(baseTime) ? Date.now() : baseTime;
  const intervalDays = getIntervalDaysForBox(box);
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;

  return new Date(validBaseTime + intervalMs);
}

/**
 * Menghitung level kotak berikutnya berdasarkan status kebenaran jawaban.
 */
export function calculateNextBox(currentBox: number, isCorrect: boolean): number {
  const safeCurrent = Math.max(
    LEITNER_CONFIG.MIN_BOX,
    Math.min(LEITNER_CONFIG.MAX_BOX, Math.floor(currentBox || 1))
  );

  if (!isCorrect) {
    // Reset kembali ke Kotak 1 jika salah
    return LEITNER_CONFIG.MIN_BOX;
  }

  // Naik 1 kotak jika benar, dibatasi Kotak 5
  return Math.min(LEITNER_CONFIG.MAX_BOX, safeCurrent + 1);
}

/**
 * Fungsi Murni: Memproses hasil evaluasi review dan menghasilkan jadwal berikutnya.
 */
export function processReviewOutcome(
  currentBox: number,
  isCorrect: boolean,
  reviewTime: Date | string | number = new Date()
): LeitnerTransitionResult {
  const previousBox = Math.max(
    LEITNER_CONFIG.MIN_BOX,
    Math.min(LEITNER_CONFIG.MAX_BOX, Math.floor(currentBox || 1))
  );

  const nextBox = calculateNextBox(previousBox, isCorrect);
  const intervalDays = getIntervalDaysForBox(nextBox);
  const nextReviewAt = calculateNextReviewDate(nextBox, reviewTime);

  let action: 'promoted' | 'max_level_maintained' | 'reset_to_box_1';
  if (!isCorrect) {
    action = 'reset_to_box_1';
  } else if (previousBox === LEITNER_CONFIG.MAX_BOX) {
    action = 'max_level_maintained';
  } else {
    action = 'promoted';
  }

  return {
    previousBox,
    nextBox,
    intervalDays,
    nextReviewAt,
    action,
  };
}

/**
 * Memeriksa apakah suatu butir soal telah jatuh tempo untuk di-review.
 */
export function isReviewDue(
  nextReviewAt: Date | string | number,
  currentTime: Date | string | number = new Date()
): boolean {
  const reviewTime = new Date(nextReviewAt).getTime();
  const now = new Date(currentTime).getTime();

  if (isNaN(reviewTime) || isNaN(now)) return false;
  return reviewTime <= now;
}

/**
 * Memfilter daftar jadwal review yang telah jatuh tempo (due) pada waktu `now`.
 */
export function filterDueReviews<T extends { nextReviewAt: Date | string }>(
  schedules: T[],
  now: Date | string | number = new Date()
): T[] {
  return schedules.filter((item) => isReviewDue(item.nextReviewAt, now));
}
