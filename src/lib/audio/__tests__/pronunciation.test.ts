import { describe, it, expect } from 'vitest';
import {
  evaluatePronunciation,
  calculateLevenshteinDistance,
  getPhoneticRepresentation,
  detectCriticalPhonemeIssues,
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
});
