/**
 * ============================================================================
 * REAL-TIME F0 PITCH DETECTION & INTONATION CONTOUR ANALYSIS
 * ============================================================================
 * Algoritma Ekstraksi Fundamental Frequency (F0) berbasis Normalized Autocorrelation
 * dengan interpolasi parabolik untuk mendeteksi variasi nada (intonation dynamics)
 * dan mendiagnosis aksen monoton (Indonesian L1 Syllable-timed interference).
 */

export interface PitchAnalysisResult {
  meanPitchHz: number;
  minPitchHz: number;
  maxPitchHz: number;
  pitchRangeHz: number;
  isMonotone: boolean;
  dynamicScore: number; // 0 - 100
  diagnosticHint: string;
}

/**
 * Mendeteksi frekuensi fundamental (F0 dalam Hz) dari buffer audio domain-waktu (PCM Float32)
 * Rentang vokal manusia standar: 75 Hz (pria rendah) s/d 500 Hz (wanita/anak-anak tinggi).
 */
export function detectPitchAutocorrelation(
  buffer: Float32Array,
  sampleRate: number = 44100
): number | null {
  const SIZE = buffer.length;

  // 1. Hitung RMS Energy (Root Mean Square) untuk filter keheningan / noise rendah
  let sumSquares = 0;
  for (let i = 0; i < SIZE; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSquares / SIZE);
  if (rms < 0.015) {
    // Terlalu hening (unvoiced atau jeda nafas)
    return null;
  }

  // 2. Tentukan batas periode lag tau untuk frekuensi 75 Hz s/d 500 Hz
  const minPeriod = Math.floor(sampleRate / 500); // ~88 samples pada 44.1kHz
  const maxPeriod = Math.floor(sampleRate / 75); // ~588 samples pada 44.1kHz

  let bestLag = -1;
  let maxCorr = -Infinity;

  // 3. Autokorelasi ternormalisasi
  for (let lag = minPeriod; lag <= maxPeriod && lag < SIZE; lag++) {
    let corr = 0;
    for (let i = 0; i < SIZE - lag; i++) {
      corr += buffer[i] * buffer[i + lag];
    }

    if (corr > maxCorr) {
      maxCorr = corr;
      bestLag = lag;
    }
  }

  if (bestLag <= 0 || maxCorr <= 0) {
    return null;
  }

  // 4. Parabolic interpolation di sekitar puncak lag untuk presisi sub-sample
  let refinedLag = bestLag;
  if (bestLag > minPeriod && bestLag < maxPeriod) {
    let cPrev = 0;
    let cNext = 0;
    for (let i = 0; i < SIZE - bestLag - 1; i++) {
      cPrev += buffer[i] * buffer[i + (bestLag - 1)];
      cNext += buffer[i] * buffer[i + (bestLag + 1)];
    }
    const delta = (cNext - cPrev) / (2 * (2 * maxCorr - cPrev - cNext) || 1);
    if (Math.abs(delta) < 1) {
      refinedLag += delta;
    }
  }

  const pitchHz = sampleRate / refinedLag;
  if (pitchHz >= 70 && pitchHz <= 550) {
    return Math.round(pitchHz * 10) / 10;
  }

  return null;
}

/**
 * Menghasilkan kontur pitch kurva acuan (Reference Native Speaker Envelope)
 * berdasarkan jenis kalimat (pertanyaan yes/no: rising intonation, pernyataan: falling, Wh-question: falling).
 */
export function generateReferencePitchContour(
  sentence: string,
  pointCount: number = 40
): number[] {
  const trimmed = (sentence || '').trim();
  const isQuestion = trimmed.endsWith('?');
  const isYesNoQuestion =
    isQuestion &&
    /^(is|are|do|does|did|can|could|would|will|have|has|should)\b/i.test(trimmed);

  const points: number[] = [];

  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1); // 0.0 s/d 1.0

    let baseFreqNorm: number;
    if (isYesNoQuestion) {
      // Yes/No Question: Rising Intonation di akhir kalimat
      baseFreqNorm = 0.45 + 0.1 * Math.sin(t * Math.PI) + 0.35 * Math.pow(t, 2);
    } else if (isQuestion) {
      // Wh- Question: Sedikit naik di awal, lalu menurun stabil di akhir
      baseFreqNorm = 0.65 - 0.25 * t + 0.08 * Math.sin(t * Math.PI * 2);
    } else {
      // Deklaratif / Pernyataan: Pitch tinggi di awal/tengah penekanan, melandai turun di akhir (terminal fall)
      baseFreqNorm = 0.55 + 0.18 * Math.sin(t * Math.PI * 0.8) - 0.25 * t;
    }

    // Normalisasi rentang 0.15 s/d 0.85
    const clamped = Math.max(0.15, Math.min(0.85, baseFreqNorm));
    points.push(Math.round(clamped * 100) / 100);
  }

  return points;
}

/**
 * Menganalisis sekelompok titik nada pengguna untuk mendeteksi apakah bicaranya monoton
 * (khas pembelajar Indonesia yang belum menerapkan stress-timing).
 */
export function analyzePitchIntonation(pitchSamples: number[]): PitchAnalysisResult {
  const validPitches = pitchSamples.filter((p) => p > 0 && !isNaN(p));

  if (validPitches.length < 5) {
    return {
      meanPitchHz: 150,
      minPitchHz: 140,
      maxPitchHz: 160,
      pitchRangeHz: 20,
      isMonotone: true,
      dynamicScore: 50,
      diagnosticHint: 'Kumpulkan lebih banyak sampel audio untuk mengukur dinamika intonasi kalimat.',
    };
  }

  const sum = validPitches.reduce((a, b) => a + b, 0);
  const mean = sum / validPitches.length;
  const min = Math.min(...validPitches);
  const max = Math.max(...validPitches);
  const range = max - min;

  // Rentang intonasi native normal pada kalimat penuh adalah > 45 Hz.
  // Jika range < 30 Hz, nada bicara dikategorikan monoton.
  const isMonotone = range < 32;

  // Skor dinamika 0 - 100
  let dynamicScore = Math.min(100, Math.round((range / 65) * 100));
  dynamicScore = Math.max(25, dynamicScore);

  let hint: string;
  if (isMonotone) {
    hint =
      'Intonasi Anda cenderung datar (monotone). Naikkan nada suara Anda pada kata-kata penting (content words) dan turunkan di akhir kalimat untuk menghasilkan ritme bahasa Inggris yang natural.';
  } else if (dynamicScore >= 80) {
    hint =
      'Variasi intonasi sangat ekspresif dan berirama native! Puncak tekanan kata Anda terdengar natural dan hidup.';
  } else {
    hint =
      'Intonasi cukup baik. Coba beri tekanan vokal lebih dinamis pada suku kata yang ditekankan untuk ritme yang lebih luwes.';
  }

  return {
    meanPitchHz: Math.round(mean),
    minPitchHz: Math.round(min),
    maxPitchHz: Math.round(max),
    pitchRangeHz: Math.round(range),
    isMonotone,
    dynamicScore,
    diagnosticHint: hint,
  };
}

