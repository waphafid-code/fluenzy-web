import { describe, it, expect } from 'vitest';
import {
  generateEmpatheticFeedback,
  buildEmpatheticCoachSystemPrompt,
} from '../empatheticFeedback';
import { PronunciationResult } from '../pronunciation';

describe('Empathetic Feedback Engine (Scope 3)', () => {
  const mockLowResult: PronunciationResult = {
    overallScore: 55,
    nativeCadenceTier: 'Needs Practice',
    fluencyScore: 50,
    pronunciationScore: 55,
    intonationScore: 60,
    generalFeedback: 'Needs practice',
    tips: [],
    wordScores: [
      { word: 'Thank', ipa: '/θæŋk/', score: 40, status: 'red' },
      { word: 'you', ipa: '/juː/', score: 90, status: 'green' },
      { word: 'for', ipa: '/fɔːr/', score: 95, status: 'green' },
      { word: 'this', ipa: '/ðɪs/', score: 45, status: 'red' },
      { word: 'reservation', ipa: '/ˌrez.əˈveɪ.ʃən/', score: 50, status: 'red' },
    ],
  };

  const mockHighScore: PronunciationResult = {
    overallScore: 92,
    nativeCadenceTier: 'Native / Advanced',
    fluencyScore: 95,
    pronunciationScore: 90,
    intonationScore: 92,
    generalFeedback: 'Excellent',
    tips: [],
    wordScores: [
      { word: 'Hello', ipa: '/həˈləʊ/', score: 95, status: 'green' },
      { word: 'world', ipa: '/wɜːld/', score: 90, status: 'green' },
    ],
  };

  it('generates 3-part structured empathetic feedback without technical jargon', () => {
    const feedback = generateEmpatheticFeedback({
      result: mockLowResult,
      tier: 'A1',
      goal: 'travel',
      targetSentence: 'Thank you for this reservation',
      spokenText: 'Tenk you for dis reserfasion',
    });

    expect(feedback.appreciation).toBeDefined();
    expect(feedback.appreciation.length).toBeGreaterThan(10);
    expect(feedback.mouthPositionTips.length).toBeGreaterThan(0);
    expect(feedback.nextTryChallenge).toBeDefined();
    expect(feedback.sandwichSummary).toContain('70% Bimbingan Bahasa Indonesia');

    // Pastikan tidak ada jargon linguistik rumit
    const allTips = feedback.mouthPositionTips.join(' ');
    expect(allTips).not.toContain('velar plosive');
    expect(allTips).not.toContain('fricative');
    expect(allTips).not.toContain('alveolar ridge');

    // Memuat instruksi fisik bibir/gigi ramah
    expect(allTips).toContain('gigi');
    expect(allTips).toContain('lidah');
  });

  it('adapts appreciation style across different proficiency tiers (A1 vs B1)', () => {
    const a1Feedback = generateEmpatheticFeedback({
      result: mockHighScore,
      tier: 'A1',
      goal: 'social',
      targetSentence: 'Hello world',
    });
    expect(a1Feedback.appreciation).toContain('Keren banget');

    const b1Feedback = generateEmpatheticFeedback({
      result: mockHighScore,
      tier: 'B1',
      goal: 'career',
      targetSentence: 'Hello world',
    });
    expect(b1Feedback.appreciation).toContain('articulation');
  });

  it('builds system prompt incorporating Tier ratio and strict zero-jargon policy', () => {
    const promptA1 = buildEmpatheticCoachSystemPrompt('A1', 'travel');
    expect(promptA1).toContain('70% Indonesian');
    expect(promptA1).toContain('NEVER use abstract linguistic terminology');
    expect(promptA1).toContain('/θ/');

    const promptB1 = buildEmpatheticCoachSystemPrompt('B1', 'career');
    expect(promptB1).toContain('20% Indonesian');
    expect(promptB1).toContain('B1');
  });
});

