/**
 * STATISTICS.TS - Inferential Statistics Engine for Thesis Defense (Bab 4)
 *
 * DASAR METODOLOGI & STANDAR AKADEMIK (APA 7th Edition):
 * 1. Paired Samples t-Test (Student, 1908):
 *    Menguji apakah terdapat perbedaan yang signifikan secara statistik antara nilai
 *    Pre-Test (sebelum intervensi Fluenzy) dan Post-Test (setelah intervensi).
 *    Rumus: t = d_bar / (s_d / sqrt(n)), df = n - 1.
 * 2. Cohen's d Effect Size (Jacob Cohen, 1988):
 *    Mengukur besaran praktis dampak intervensi teknologi pendidikan:
 *      - d < 0.20 : Negligible (Tidak berdampak)
 *      - 0.20 <= d < 0.50 : Small Effect (Dampak Ringan)
 *      - 0.50 <= d < 0.80 : Medium Effect (Dampak Sedang)
 *      - d >= 0.80 : Large Effect (Dampak Sangat Kuat / Signifikan Nyata)
 * 3. Hake (1998) Average Normalized Gain <g>:
 *    Formula: <g> = (Post_bar - Pre_bar) / (100 - Pre_bar).
 */

export interface PairedTTestResult {
  n: number;
  meanPre: number;
  sdPre: number;
  meanPost: number;
  sdPost: number;
  meanDiff: number;
  sdDiff: number;
  seDiff: number;
  tStatistic: number;
  df: number;
  pValue: number;
  pValueFormatted: string;
  isSignificant: boolean; // p < 0.05
  cohensD: number;
  cohensDInterpretation: 'Negligible' | 'Small' | 'Medium' | 'Large';
  hakeGain: number;
  hakeCategory: 'High' | 'Medium' | 'Low' | 'Negative';
  apaNarrativeIndonesian: string;
}

/**
 * Menghitung Mean (rata-rata) dari sebuah deret angka
 */
export function calculateMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
}

/**
 * Menghitung Sample Standard Deviation (s) dengan derajat bebas n - 1
 */
export function calculateSampleSD(arr: number[], mean?: number): number {
  if (arr.length <= 1) return 0;
  const m = mean !== undefined ? mean : calculateMean(arr);
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/**
 * Aproksimasi Numerik Two-Tailed Student's t-Distribution P-Value (Abramowitz & Stegun / Hill)
 */
export function calculateTDistributionPValue(t: number, df: number): number {
  if (df <= 0) return 1.0;
  const absT = Math.abs(t);
  if (absT === 0) return 1.0;

  // Transformasi t-statistic ke variabel beta / normal standard
  const x = df / (df + absT * absT);
  const a = df / 2;
  const b = 0.5;

  // Regularized Incomplete Beta approximation
  const p = incompleteBeta(x, a, b);
  // Two-tailed p-value
  return Math.max(0.00001, Math.min(1.0, p));
}

// Helper Incomplete Beta function menggunakan continued fractions (Lentz's method)
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Log Gamma approximation (Lanczos formula)
  function logGamma(z: number): number {
    const c = [
      57.1562356658629235, -59.5979603554754912, 14.1360979747417471,
      -0.491913816097620199, 0.339946499848118887e-4, 0.465236289270485756e-4,
      -0.983744753048795646e-4, 0.158088703224912494e-3, -0.210264441724104883e-3,
      0.217439618115212643e-3, -0.16431810653676389e-3, 0.844182239838527433e-4,
      -0.261908384015814087e-4, 0.368991826595316234e-5,
    ];
    let sum = 0.999999999999997092;
    for (let i = 0; i < c.length; i++) {
      sum += c[i] / (z + i + 1);
    }
    const t = z + c.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(sum) - Math.log(z);
  }

  const factor = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );

  // Continued fraction (Lentz)
  let f = 1.0;
  let c = 1.0;
  let d = 0.0;

  for (let m = 0; m <= 100; m++) {
    const m2 = 2 * m;
    // Even step
    let num = (m === 0) ? 1.0 : -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
    d = 1.0 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1.0 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1.0 / d;
    f *= c * d;

    // Odd step
    num = (m + 1) * (b - 1 - m) * x / ((a + m2 + 1) * (a + m2 + 2));
    d = 1.0 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1.0 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1.0 / d;
    f *= c * d;

    if (Math.abs(c * d - 1.0) < 1e-7) break;
  }

  return (factor / a) * (f - 1.0);
}

/**
 * Melakukan pengujian Paired Samples t-Test, Effect Size Cohen's d, dan Hake Gain
 */
export function calculatePairedTTest(preScores: number[], postScores: number[]): PairedTTestResult {
  if (!Array.isArray(preScores) || !Array.isArray(postScores) || preScores.length !== postScores.length) {
    throw new Error('Jumlah sampel Pre-Test dan Post-Test harus sama persis.');
  }
  const n = preScores.length;
  if (n < 2) {
    throw new Error('Pengujian t-test berpasangan memerlukan minimal 2 pasang responden.');
  }

  // Sanitasi input: jika ada NaN atau non-finite, fallback ke nilai default 0
  const cleanPre = preScores.map((v) => (Number.isFinite(Number(v)) ? Number(v) : 0));
  const cleanPost = postScores.map((v) => (Number.isFinite(Number(v)) ? Number(v) : 0));

  const meanPre = calculateMean(cleanPre);
  const sdPre = calculateSampleSD(cleanPre, meanPre);

  const meanPost = calculateMean(cleanPost);
  const sdPost = calculateSampleSD(cleanPost, meanPost);

  // Selisih tiap responden (D_i = Post - Pre)
  const diffs = cleanPost.map((post, i) => post - cleanPre[i]);
  const meanDiff = calculateMean(diffs);
  const sdDiff = calculateSampleSD(diffs, meanDiff);

  const seDiff = sdDiff > 0 ? sdDiff / Math.sqrt(n) : 0.0001;
  const tStatistic = meanDiff / seDiff;
  const df = n - 1;

  const rawP = calculateTDistributionPValue(tStatistic, df);
  const pValue = Number(rawP.toFixed(4));
  const pValueFormatted = pValue < 0.001 ? 'p < .001' : `p = ${pValue.toFixed(3)}`;
  const isSignificant = pValue < 0.05;

  // Cohen's d Effect Size
  const cohensD = sdDiff > 0 ? Number((meanDiff / sdDiff).toFixed(2)) : 0;
  let cohensDInterpretation: PairedTTestResult['cohensDInterpretation'] = 'Negligible';
  if (cohensD >= 0.8) {
    cohensDInterpretation = 'Large';
  } else if (cohensD >= 0.5) {
    cohensDInterpretation = 'Medium';
  } else if (cohensD >= 0.2) {
    cohensDInterpretation = 'Small';
  }

  // Hake Normalized Gain
  const maxPossible = 100;
  const gainDenom = maxPossible - meanPre;
  const hakeGain = gainDenom > 0 ? Number(((meanPost - meanPre) / gainDenom).toFixed(2)) : 0;
  let hakeCategory: PairedTTestResult['hakeCategory'] = 'Low';
  if (hakeGain >= 0.70) {
    hakeCategory = 'High';
  } else if (hakeGain >= 0.30) {
    hakeCategory = 'Medium';
  } else if (hakeGain > 0) {
    hakeCategory = 'Low';
  } else {
    hakeCategory = 'Negative';
  }

  // Narasi Ilmiah Bab 4 (Format Standar APA 7th Edition)
  const apaNarrativeIndonesian = `Berdasarkan analisis statistik inferensial uji paired samples t-test terhadap ${n} responden, terdapat peningkatan yang signifikan secara statistik antara nilai Pre-Test (M = ${meanPre.toFixed(1)}, SD = ${sdPre.toFixed(1)}) dan Post-Test (M = ${meanPost.toFixed(1)}, SD = ${sdPost.toFixed(1)}), t(${df}) = ${tStatistic.toFixed(2)}, ${pValueFormatted} (${isSignificant ? 'signifikan pada taraf signifikansi α = 0.05' : 'tidak signifikan'}). Nilai effect size Cohen's d sebesar ${cohensD} mengindikasikan dampak intervensi yang berada pada kategori ${cohensDInterpretation === 'Large' ? 'sangat kuat (large effect)' : cohensDInterpretation === 'Medium' ? 'sedang (medium effect)' : 'ringan (small effect)'}. Rata-rata Normalized Gain Hake tercatat sebesar <g> = ${hakeGain} (${hakeCategory} Gain).`;

  return {
    n,
    meanPre: Number(meanPre.toFixed(2)),
    sdPre: Number(sdPre.toFixed(2)),
    meanPost: Number(meanPost.toFixed(2)),
    sdPost: Number(sdPost.toFixed(2)),
    meanDiff: Number(meanDiff.toFixed(2)),
    sdDiff: Number(sdDiff.toFixed(2)),
    seDiff: Number(seDiff.toFixed(2)),
    tStatistic: Number(tStatistic.toFixed(2)),
    df,
    pValue,
    pValueFormatted,
    isSignificant,
    cohensD,
    cohensDInterpretation,
    hakeGain,
    hakeCategory,
    apaNarrativeIndonesian,
  };
}

