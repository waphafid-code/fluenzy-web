/**
 * SUS.TS - Mesin Evaluasi System Usability Scale (SUS)
 *
 * DASAR AKADEMIS:
 * John Brooke (1996) - SUS: A 'quick and dirty' usability scale.
 * 10 butir pertanyaan baku dengan skala Likert 1 (Sangat Tidak Setuju) sampai 5 (Sangat Setuju).
 *
 * FORMULA PERHITUNGAN SKOR:
 * 1. Untuk butir bernomor ganjil (1, 3, 5, 7, 9):
 *    skor_kontribusi = nilai_jawaban - 1
 * 2. Untuk butir bernomor genap (2, 4, 6, 8, 10):
 *    skor_kontribusi = 5 - nilai_jawaban
 * 3. Total Skor SUS:
 *    total = (jumlah_seluruh_kontribusi) * 2.5
 *    (Rentang skor 0 hingga 100).
 *
 * BENCHMARK INTERPRETASI (Bangor, Kortum, & Miller, 2008):
 * - >= 85 : Best Imaginable (Grade A+)
 * - 80.3 - 84.9 : Excellent (Grade A)
 * - 68.0 - 80.2 : Good (Grade B) -> 68 adalah ambang standar industri rata-rata
 * - 51.0 - 67.9 : OK / Marginal (Grade C/D)
 * - < 51.0 : Poor / Unacceptable (Grade F)
 */

export interface SusCalculationResult {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  adjectiveRating: string;
  isAboveAverage: boolean;
}

export const SUS_QUESTIONS = [
  'Saya rasa saya akan sering menggunakan aplikasi Fluenzy ini.',
  'Saya merasa sistem aplikasi ini terlalu rumit untuk digunakan.',
  'Saya rasa aplikasi ini sangat mudah digunakan.',
  'Saya rasa saya membutuhkan bantuan orang lain atau teknisi untuk dapat menggunakan sistem ini.',
  'Saya menemukan bahwa fitur-fitur dan materi dalam aplikasi ini terintegrasi dengan sangat baik.',
  'Saya rasa ada terlalu banyak inkonsistensi dalam sistem aplikasi ini.',
  'Saya membayangkan bahwa kebanyakan orang akan dapat mempelajari aplikasi ini dengan sangat cepat.',
  'Saya merasa aplikasi ini sangat janggal atau membingungkan untuk digunakan.',
  'Saya merasa sangat percaya diri menggunakan sistem pembelajaran mandiri ini.',
  'Saya perlu membiasakan diri terlebih dahulu sebelum saya dapat menguasai sistem ini sepenuhnya.',
] as const;

/**
 * Menghitung skor SUS murni dari array 10 jawaban Likert (1 - 5).
 */
export function calculateSusScore(responses: number[]): SusCalculationResult {
  if (!responses || responses.length !== 10) {
    throw new Error('Penilaian SUS memerlukan tepat 10 butir jawaban.');
  }

  let totalContribution = 0;

  for (let i = 0; i < 10; i++) {
    const rawVal = Math.max(1, Math.min(5, Math.round(responses[i])));
    const itemNumber = i + 1;

    if (itemNumber % 2 !== 0) {
      // Butir ganjil: skor - 1
      totalContribution += rawVal - 1;
    } else {
      // Butir genap: 5 - skor
      totalContribution += 5 - rawVal;
    }
  }

  const score = Number((totalContribution * 2.5).toFixed(1));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
  let adjectiveRating = 'OK';

  if (score >= 85) {
    grade = 'A+';
    adjectiveRating = 'Best Imaginable (Luar Biasa Unggul)';
  } else if (score >= 80.3) {
    grade = 'A';
    adjectiveRating = 'Excellent (Sangat Memuaskan)';
  } else if (score >= 68.0) {
    grade = 'B';
    adjectiveRating = 'Good (Baik & Di Atas Rata-rata Industri)';
  } else if (score >= 51.0) {
    grade = 'C';
    adjectiveRating = 'OK / Marginal';
  } else {
    grade = 'F';
    adjectiveRating = 'Poor / Unacceptable';
  }

  return {
    score,
    grade,
    adjectiveRating,
    isAboveAverage: score >= 68.0,
  };
}
