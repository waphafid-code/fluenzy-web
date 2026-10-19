/**
 * INSIGHTS.TS - Mesin Analisis Wawasan & Diagnosis Mandiri Siswa
 *
 * DASAR AKADEMIS & METODOLOGI:
 * 1. Self-Regulated Learning (SRL) (Zimmerman, 2002):
 *    Penyajian metakognitif (pola kesalahan dan visualisasi radar kompetensi)
 *    memungkinkan siswa merefleksikan kelemahan spesifik dan merencanakan perbaikan terarah.
 * 2. Rule-Based Expert Pedagogical System:
 *    Menghasilkan kalimat rekomendasi yang dapat ditindaklanjuti (actionable feedback)
 *    secara deterministik tanpa halusinasi LLM/AI.
 * 3. Analisis Frekuensi Kesalahan (Surface Strategy Error Breakdown):
 *    Menghitung distribusi persentase kemunculan tipe kesalahan (typo, word order, omission, addition, lexical).
 */

export interface AnswerLogRecord {
  id?: string;
  skillId?: string;
  skillName?: string;
  errorType: string | null;
  isCorrect?: boolean;
  createdAt: Date | string;
}

export interface ErrorTypeDistributionItem {
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface SkillMasteryItem {
  skillId: string;
  skillName: string;
  mastery: number;
  level: 'weak' | 'medium' | 'strong';
  attempts?: number;
  correctCount?: number;
}

export interface DailyActivityItem {
  date: string; // YYYY-MM-DD
  xpEarned: number;
  lessonsCompleted: number;
}

export interface PedagogicalInsightInput {
  weakSkills: { skillName: string; mastery: number }[];
  errorDistribution: ErrorTypeDistributionItem[];
  dominantSkillError?: { skillName: string; errorType: string; count: number };
}

export const ERROR_TYPE_LABELS: Record<string, string> = {
  typo: 'Salah Ketik (Typo)',
  word_order: 'Urutan Kata Terbalik',
  missing_word: 'Kurang Kata (Omission)',
  extra_word: 'Kelebihan Kata (Addition)',
  wrong_word: 'Pilihan Kata Keliru (Lexical)',
  wrong_choice: 'Pilihan Kurang Tepat',
  listening_error: 'Kesalahan Pendengaran',
};

/**
 * Menghitung distribusi frekuensi dan persentase setiap tipe kesalahan dalam rentang hari tertentu.
 */
export function calculateErrorTypeDistribution(
  logs: AnswerLogRecord[],
  daysThreshold: number = 30,
  now: Date | string | number = new Date()
): ErrorTypeDistributionItem[] {
  const currentTime = new Date(now).getTime();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;

  // Filter hanya log jawaban salah dalam rentang waktu yang ditentukan
  const recentErrors = logs.filter((log) => {
    if (!log.errorType) return false;
    const logTime = new Date(log.createdAt).getTime();
    if (isNaN(logTime)) return false;
    return currentTime - logTime <= thresholdMs;
  });

  const totalErrors = recentErrors.length;
  if (totalErrors === 0) return [];

  const counts: Record<string, number> = {};
  for (const err of recentErrors) {
    const type = err.errorType || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([type, count]) => ({
      type,
      label: ERROR_TYPE_LABELS[type] || type,
      count,
      percentage: Number(((count / totalErrors) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Menghasilkan kalimat wawasan otomatis berbasis aturan tanpa dependensi AI luar.
 */
export function generatePedagogicalInsights(input: PedagogicalInsightInput): string[] {
  const insights: string[] = [];

  // 1. Wawasan Dominan Pola Kesalahan
  if (input.dominantSkillError && input.dominantSkillError.count >= 2) {
    const errorLabel = ERROR_TYPE_LABELS[input.dominantSkillError.errorType] || input.dominantSkillError.errorType;
    insights.push(
      `Kamu sering salah pada ${errorLabel.toLowerCase()} di materi "${input.dominantSkillError.skillName}". Coba lakukan 5 soal latihan untuk memperkuat pola ini.`
    );
  } else if (input.errorDistribution.length > 0) {
    const topError = input.errorDistribution[0];
    if (topError.type === 'word_order') {
      insights.push(
        `Sebagian besar kekeliruanmu (${topError.percentage}%) terletak pada susunan kata (word order). Perhatikan posisi Subjek - Kata Kerja - Objek (S-V-O).`
      );
    } else if (topError.type === 'typo') {
      insights.push(
        `Kekeliruan terbesarmu adalah salah ketik (${topError.percentage}%). Pemahaman kosakatamu sudah baik, luangkan 2 detik ekstra untuk memeriksa ejaan sebelum submit.`
      );
    } else if (topError.type === 'missing_word') {
      insights.push(
        `Kamu sering melewatkan auxiliary verb atau kata depan (${topError.percentage}%). Cermati kelengkapan struktur kalimat bahasa Inggris.`
      );
    } else if (topError.type === 'wrong_word' || topError.type === 'wrong_choice') {
      insights.push(
        `Kekeliruan leksikal (${topError.percentage}%) mendominasi sesi belajarmu. Perkaya perbendaharaan kata melalui sesi Latihan Titik Lemah.`
      );
    }
  }

  // 2. Wawasan Tingkat Penguasaan Terlemah
  if (input.weakSkills.length > 0) {
    const weakest = input.weakSkills[0];
    const percentage = Math.round(weakest.mastery * 100);
    insights.push(
      `Materi "${weakest.skillName}" saat ini memiliki tingkat penguasaan terendah (${percentage}%). Klik "Latihan Titik Lemah" untuk menaikkannya ke level stabil.`
    );
  } else {
    insights.push('Luar biasa! Semua kemampuanmu berada di zona penguasaan yang kokoh.');
  }

  return insights;
}

/**
 * Memformat riwayat perolehan XP harian untuk grafik visual (7 hari atau 30 hari terakhir).
 */
export function formatDailyXpChartData(
  activities: DailyActivityItem[],
  daysCount: number = 7,
  referenceDate: Date | string = new Date()
): { date: string; xp: number; label: string }[] {
  const result: { date: string; xp: number; label: string }[] = [];
  const refTime = new Date(referenceDate).getTime();
  const activityMap = new Map<string, number>();

  for (const act of activities) {
    activityMap.set(act.date, act.xpEarned);
  }

  for (let i = daysCount - 1; i >= 0; i--) {
    const targetDate = new Date(refTime - i * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Label pendek (misal: "Sen", "Sel" atau "19/10")
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const label = `${dayNames[targetDate.getDay()]} ${targetDate.getDate()}`;

    result.push({
      date: dateStr,
      xp: activityMap.get(dateStr) || 0,
      label,
    });
  }

  return result;
}

/**
 * Menyusun data kalender keaktifan streak untuk visualisasi bulanan.
 */
export function calculateStreakCalendar(
  activities: DailyActivityItem[],
  year: number,
  month: number // 1 - 12
): { date: string; day: number; active: boolean; xp: number }[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const activityMap = new Map<string, DailyActivityItem>();

  for (const act of activities) {
    activityMap.set(act.date, act);
  }

  const result: { date: string; day: number; active: boolean; xp: number }[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const act = activityMap.get(dateStr);
    const active = !!(act && (act.lessonsCompleted > 0 || act.xpEarned > 0));

    result.push({
      date: dateStr,
      day,
      active,
      xp: act?.xpEarned || 0,
    });
  }

  return result;
}
