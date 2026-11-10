/**
 * DIAGNOSTIC.TS - Modul Pengujian Diagnostik CEFR & Instrumen Pre-Test / Post-Test
 *
 * DASAR METODOLOGI:
 * 1. CEFR Standardized Linguistic Benchmarking (Council of Europe, 2020)
 *    Menilai penguasaan fonetik, ritme, dan kluster konsonan dari tingkat A1 hingga B1.
 * 2. Richard Hake (1998) Normalized Gain <g>
 *    Formula: g = (PostTest - PreTest) / (100 - PreTest)
 *    Kategori: High (g >= 0.70), Medium (0.30 <= g < 0.70), Low (g < 0.30)
 */

import { UserProficiencyTier } from './preferences';
import { evaluatePronunciation, PronunciationResult, detectCriticalPhonemeIssues } from '../audio/pronunciation';
import { safeGetStorage, safeSetStorage, safeRemoveStorage } from './storage';

export interface DiagnosticPrompt {
  id: string;
  tierTarget: UserProficiencyTier;
  title: string;
  targetSentence: string;
  phoneticFocus: string;
  context: string;
  l1Challenge: string;
}

export const DIAGNOSTIC_PROMPTS: DiagnosticPrompt[] = [
  {
    id: 'diag-a1',
    tierTarget: 'A1',
    title: 'Tahap 1: Fondasi Vokal & Kelancaran Diri (A1)',
    targetSentence: 'Hello, my name is Alex and I want to improve my speaking skills.',
    phoneticFocus: 'Kejelasan vokal santai pada "improve" /ɪmˈpruːv/ dan akhiran desis /s/ pada "skills".',
    context: 'Menguji artikulasi vokal dasar, ritme pengenalan diri, dan kejelasan kata sambung fungsional.',
    l1Challenge: 'Penutur Indonesia kerap melemahkan bunyi /s/ di akhir kata "skills" atau mengeraskan /v/ menjadi /p/.',
  },
  {
    id: 'diag-a2',
    tierTarget: 'A2',
    title: 'Tahap 2: Kluster Konsonan & Huruf Bisu (A2)',
    targetSentence: 'Could you please review my pull request by tomorrow afternoon?',
    phoneticFocus: 'Huruf bisu "l" pada "could" /kʊd/, frikatif lembut /v/ pada "review", dan kluster /st/ pada "request".',
    context: 'Menguji penguasaan instruksi formal di tempat kerja atau interaksi akademis umum.',
    l1Challenge: 'Kecenderungan membaca huruf "l" pada "could" atau melewatkan letupan /t/ pada "request".',
  },
  {
    id: 'diag-b1',
    tierTarget: 'B1',
    title: 'Tahap 3: Dental Fricative & Connected Speech (B1)',
    targetSentence: 'I think the engineering team should collaborate to solve the bottleneck.',
    phoneticFocus: 'Dental fricative /θ/ pada "think", penekanan suku kata pada "collaborate", dan ritme cepat "bottleneck".',
    context: 'Menguji kelancaran diskusi profesional dan pemecahan masalah teknis mandiri.',
    l1Challenge: 'Kecenderungan melafalkan /θ/ pada "think" menjadi "tink" atau "sink".',
  },
];

export interface DiagnosticItemResult {
  promptId: string;
  tierTarget: UserProficiencyTier;
  targetSentence: string;
  userTranscript: string;
  score: number;
  evaluation: PronunciationResult;
}

export interface DiagnosticEvaluationResult {
  overallScore: number; // 0 - 100
  calibratedTier: UserProficiencyTier;
  itemResults: DiagnosticItemResult[];
  weakPhonemes: string[];
  summaryId: string;
  recommendedAction: string;
  timestamp: string;
}

export interface HakeGainResult {
  gain: number;
  category: 'High' | 'Medium' | 'Low' | 'Negative / No Gain';
  preScore: number;
  postScore: number;
  explanationId: string;
}

const PRETEST_STORAGE_KEY = 'fluenzy_diagnostic_pretest_v1';
const POSTTEST_STORAGE_KEY = 'fluenzy_diagnostic_posttest_v1';

// In-memory fallback for SSR and testing environments
let memoryPretestStore: DiagnosticEvaluationResult | null = null;
let memoryPosttestStore: DiagnosticEvaluationResult | null = null;

/**
 * Menghitung evaluasi komprehensif dari sesi diagnostik
 */
export function evaluateDiagnosticSession(
  submissions: { promptId: string; userTranscript: string }[]
): DiagnosticEvaluationResult {
  if (!submissions || submissions.length === 0) {
    throw new Error('Sesi diagnostik memerlukan setidaknya 1 respons rekaman suara.');
  }

  const itemResults: DiagnosticItemResult[] = [];
  let totalScore = 0;
  const detectedWeaknesses: Set<string> = new Set();

  submissions.forEach((sub) => {
    const prompt = DIAGNOSTIC_PROMPTS.find((p) => p.id === sub.promptId);
    if (!prompt) return;

    const evalResult = evaluatePronunciation(prompt.targetSentence, sub.userTranscript);
    totalScore += evalResult.overallScore;

    // Kumpulkan titik lemah fonetik dari kalimat target vs ucapan pengguna
    const issues = detectCriticalPhonemeIssues(prompt.targetSentence, sub.userTranscript);
    issues.forEach((iss) => detectedWeaknesses.add(iss.expectedPhoneme));

    itemResults.push({
      promptId: prompt.id,
      tierTarget: prompt.tierTarget,
      targetSentence: prompt.targetSentence,
      userTranscript: sub.userTranscript,
      score: evalResult.overallScore,
      evaluation: evalResult,
    });
  });

  const count = itemResults.length > 0 ? itemResults.length : 1;
  const overallScore = Math.round(totalScore / count);

  // Penentuan Kalibrasi CEFR berdasarkan performa akustik
  let calibratedTier: UserProficiencyTier = 'A1';
  let summaryId = '';
  let recommendedAction = '';

  if (overallScore < 65) {
    calibratedTier = 'A1';
    summaryId = 'Fondasi Pemula (CEFR A1) — Penguatan Vokal & Kosakata Sehari-hari.';
    recommendedAction =
      'Mulai dengan rasio bimbingan 70% Bahasa Indonesia / 30% English dan latih pola kalimat survival di Studio Chunks.';
  } else if (overallScore < 83) {
    calibratedTier = 'A2';
    summaryId = 'Tingkat Menengah Awal (CEFR A2) — Komunikasi Kerja & Frasa Kontekstual.';
    recommendedAction =
      'Fokus pada kluster konsonan dan pelafalan /v/ serta /f/ dengan rasio 45% Bahasa Indonesia / 55% English.';
  } else {
    calibratedTier = 'B1';
    summaryId = 'Pra-Mandiri (CEFR B1) — Diskusi Bebas, Presentasi & Connected Speech.';
    recommendedAction =
      'Tingkatkan kelancaran intonasi dan penguasaan dental fricative /θ/ & /ð/ dengan rasio 20% Bahasa Indonesia / 80% English.';
  }

  return {
    overallScore,
    calibratedTier,
    itemResults,
    weakPhonemes: Array.from(detectedWeaknesses),
    summaryId,
    recommendedAction,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Formula Richard Hake (1998): Normalized Gain <g>
 * g = (PostTest - PreTest) / (100 - PreTest)
 */
export function calculateHakeGain(preScore: number, postScore: number): HakeGainResult {
  const clampedPre = Math.max(0, Math.min(100, preScore));
  const clampedPost = Math.max(0, Math.min(100, postScore));

  const denominator = 100 - clampedPre;
  let gain = 0;

  if (denominator <= 0) {
    gain = clampedPost >= 100 ? 1.0 : 0.0;
  } else {
    gain = Number(((clampedPost - clampedPre) / denominator).toFixed(4));
  }

  let category: 'High' | 'Medium' | 'Low' | 'Negative / No Gain' = 'Low';
  let explanationId = '';

  if (gain >= 0.70) {
    category = 'High';
    explanationId = 'Peningkatan Sangat Tinggi (High Gain): Intervensi pembelajaran terbukti sangat efektif.';
  } else if (gain >= 0.30) {
    category = 'Medium';
    explanationId = 'Peningkatan Sedang (Medium Gain): Terdapat peningkatan nyata pada kemampuan berbicara.';
  } else if (gain > 0) {
    category = 'Low';
    explanationId = 'Peningkatan Rendah (Low Gain): Diperlukan latihan lebih intensif pada modul pengulangan.';
  } else {
    category = 'Negative / No Gain';
    explanationId = 'Tidak Ada Peningkatan: Skor post-test sama atau lebih rendah dari pre-test baseline.';
  }

  return {
    gain,
    category,
    preScore: clampedPre,
    postScore: clampedPost,
    explanationId,
  };
}

/**
 * Penyimpanan lokal status Pre-Test dan Post-Test
 */
export function saveDiagnosticSession(
  type: 'pre' | 'post',
  result: DiagnosticEvaluationResult
): void {
  if (type === 'pre') {
    memoryPretestStore = result;
  } else {
    memoryPosttestStore = result;
  }

  const key = type === 'pre' ? PRETEST_STORAGE_KEY : POSTTEST_STORAGE_KEY;
  safeSetStorage(key, result);
}

export function getStoredDiagnosticSession(
  type: 'pre' | 'post'
): DiagnosticEvaluationResult | null {
  const key = type === 'pre' ? PRETEST_STORAGE_KEY : POSTTEST_STORAGE_KEY;
  const memoryFallback = type === 'pre' ? memoryPretestStore : memoryPosttestStore;
  return safeGetStorage<DiagnosticEvaluationResult | null>(key, memoryFallback);
}

export function clearDiagnosticMemory(): void {
  memoryPretestStore = null;
  memoryPosttestStore = null;
  safeRemoveStorage(PRETEST_STORAGE_KEY);
  safeRemoveStorage(POSTTEST_STORAGE_KEY);
}
