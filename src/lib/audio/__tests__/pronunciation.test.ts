import { describe, it, expect } from 'vitest';
import {
  evaluatePronunciation,
  calculateLevenshteinDistance,
  getPhoneticRepresentation,
  detectCriticalPhonemeIssues,
  getWordStressGuidance,
  WordScore,
} from '../pronunciation';

describe('ELSA-Style Pronunciation Evaluation Engine', () => {
  it('menghitung jarak Levenshtein dengan akurat', () => {
    expect(calculateLevenshteinDistance('schedule', 'schedule')).toBe(0);
    expect(calculateLevenshteinDistance('discuss', 'discus')).toBe(1);
    expect(calculateLevenshteinDistance('cat', 'hat')).toBe(1);
    expect(calculateLevenshteinDistance('', 'test')).toBe(4);
  });

  it('memberikan skor hijau (green) dan nilai tinggi untuk pengucapan sempurna', () => {
    const target = 'I would like to discuss the next steps';
    const spoken = 'I would like to discuss the next steps';

    const result = evaluatePronunciation(target, spoken);
    expect(result.overallScore).toBeGreaterThanOrEqual(95);
    expect(result.nativeCadenceTier).toBe('Native / Advanced');
    expect(result.wordScores.every((w: WordScore) => w.status === 'green')).toBe(true);
  });

  it('mendeteksi kata yang salah ucap dan memberi warna kuning atau merah', () => {
    const target = 'I would like to discuss the next steps';
    const spoken = 'I would like to discos the nex steps'; // "discuss" -> "discos", "next" -> "nex"

    const result = evaluatePronunciation(target, spoken);
    expect(result.overallScore).toBeLessThan(92);

    const discussWord = result.wordScores.find((w: WordScore) => w.word.toLowerCase() === 'discuss');
    expect(discussWord?.status).not.toBe('green');

    const nextWord = result.wordScores.find((w: WordScore) => w.word.toLowerCase() === 'next');
    expect(nextWord?.status).not.toBe('green');
  });

  it('memberikan representasi IPA untuk kosakata teknis', () => {
    const ipa = getPhoneticRepresentation('architecture');
    expect(ipa).toBeDefined();
    expect(ipa.length).toBeGreaterThan(0);
  });

  it('mendeteksi substitusi fonem kritis umum pembelajar Indonesia (th -> s/t, v -> f)', () => {
    const issues = detectCriticalPhonemeIssues('I think this approach is very good', 'I sink dis approach is fery good');
    expect(issues.length).toBeGreaterThanOrEqual(2);

    const thIssue = issues.find((i) => i.targetWord === 'think');
    expect(thIssue).toBeDefined();
    expect(thIssue?.expectedPhoneme).toBe('/θ/');

    const vIssue = issues.find((i) => i.targetWord === 'very');
    expect(vIssue).toBeDefined();
    expect(vIssue?.expectedPhoneme).toBe('/v/');
  });

  it('menghitung metrik kelancaran temporal (WPM & CEFR Speed Tier) saat durasi audio diberikan', () => {
    const target = 'Hello my name is Alex and I am learning English';
    const spoken = 'Hello my name is Alex and I am learning English'; // 10 kata

    // Durasi 6 detik -> WPM = (10 / 6) * 60 = 100 WPM (B1 Target: 95-135 WPM)
    const result = evaluatePronunciation(target, spoken, 6);
    expect(result.temporalMetrics).toBeDefined();
    expect(result.temporalMetrics?.wordsPerMinute).toBe(100);
    expect(result.temporalMetrics?.cefrSpeedTier).toBe('B1 Target');
    expect(result.temporalMetrics?.durationSeconds).toBe(6);

    // Durasi 20 detik untuk 10 kata -> WPM = 30 WPM (Too Slow)
    const slowResult = evaluatePronunciation(target, spoken, 20);
    expect(slowResult.temporalMetrics?.wordsPerMinute).toBe(30);
    expect(slowResult.temporalMetrics?.cefrSpeedTier).toBe('Too Slow');
    expect(slowResult.fluencyScore).toBeLessThan(result.fluencyScore);
  });

  it('memberikan panduan tekanan suku kata (syllable stress) untuk kata-kata kritis', () => {
    const guide = getWordStressGuidance('architecture');
    expect(guide).not.toBeNull();
    expect(guide?.syllables).toBe('AR-ki-tek-cher');
    expect(guide?.stressedSyllable).toBe('AR');
    expect(guide?.stressedIndex).toBe(0);

    const discussGuide = getWordStressGuidance('discuss!');
    expect(discussGuide?.stressedSyllable).toBe('SKAS');
    expect(discussGuide?.stressedIndex).toBe(1);

    expect(getWordStressGuidance('unknownword123')).toBeNull();
    expect(getWordStressGuidance('')).toBeNull();
  });
});
