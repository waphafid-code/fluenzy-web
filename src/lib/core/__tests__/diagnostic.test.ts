import { describe, it, expect, beforeEach } from 'vitest';
import {
  DIAGNOSTIC_PROMPTS,
  evaluateDiagnosticSession,
  calculateHakeGain,
  saveDiagnosticSession,
  getStoredDiagnosticSession,
  clearDiagnosticMemory,
} from '../diagnostic';

describe('Diagnostic Evaluation & Hake Gain Engine', () => {
  beforeEach(() => {
    clearDiagnosticMemory();
  });

  it('contains exactly 3 standardized prompts spanning A1, A2, and B1', () => {
    expect(DIAGNOSTIC_PROMPTS.length).toBe(3);
    const tiers = DIAGNOSTIC_PROMPTS.map((p) => p.tierTarget);
    expect(tiers).toContain('A1');
    expect(tiers).toContain('A2');
    expect(tiers).toContain('B1');
  });

  it('evaluates near-perfect speech and calibrates to Tier B1', () => {
    const submissions = [
      {
        promptId: 'diag-a1',
        userTranscript: 'Hello my name is Alex and I want to improve my speaking skills',
      },
      {
        promptId: 'diag-a2',
        userTranscript: 'Could you please review my pull request by tomorrow afternoon',
      },
      {
        promptId: 'diag-b1',
        userTranscript: 'I think the engineering team should collaborate to solve the bottleneck',
      },
    ];

    const result = evaluateDiagnosticSession(submissions);
    expect(result.overallScore).toBeGreaterThanOrEqual(83);
    expect(result.calibratedTier).toBe('B1');
    expect(result.itemResults.length).toBe(3);
  });

  it('evaluates moderate speech and calibrates to Tier A2', () => {
    const submissions = [
      {
        promptId: 'diag-a1',
        userTranscript: 'Hello my name is Alex and I want to improve my speaking skills',
      },
      {
        promptId: 'diag-a2',
        // partial match
        userTranscript: 'Can you review my request tomorrow',
      },
      {
        promptId: 'diag-b1',
        // partial match with accent gaps
        userTranscript: 'I think the team collaborate',
      },
    ];

    const result = evaluateDiagnosticSession(submissions);
    expect(result.overallScore).toBeGreaterThanOrEqual(60);
    expect(result.overallScore).toBeLessThan(83);
    expect(result.calibratedTier).toBe('A2');
  });

  it('correctly calculates Richard Hake (1998) normalized gain across all categories', () => {
    // High gain: g >= 0.70
    // pre = 40, post = 82 -> g = (82 - 40) / 60 = 0.70
    const high = calculateHakeGain(40, 82);
    expect(high.gain).toBe(0.7);
    expect(high.category).toBe('High');

    // Medium gain: 0.30 <= g < 0.70
    // pre = 50, post = 75 -> g = (75 - 50) / 50 = 0.50
    const med = calculateHakeGain(50, 75);
    expect(med.gain).toBe(0.5);
    expect(med.category).toBe('Medium');

    // Low gain: 0 < g < 0.30
    // pre = 50, post = 60 -> g = (60 - 50) / 50 = 0.20
    const low = calculateHakeGain(50, 60);
    expect(low.gain).toBe(0.2);
    expect(low.category).toBe('Low');

    // Negative / No Gain
    const neg = calculateHakeGain(70, 65);
    expect(neg.gain).toBeLessThan(0);
    expect(neg.category).toBe('Negative / No Gain');
  });

  it('persists and retrieves pre-test and post-test diagnostic sessions via localStorage', () => {
    const mockResult = evaluateDiagnosticSession([
      {
        promptId: 'diag-a1',
        userTranscript: 'Hello my name is Alex and I want to improve my speaking skills',
      },
    ]);

    saveDiagnosticSession('pre', mockResult);
    const retrievedPre = getStoredDiagnosticSession('pre');
    expect(retrievedPre).not.toBeNull();
    expect(retrievedPre?.overallScore).toBe(mockResult.overallScore);

    const retrievedPost = getStoredDiagnosticSession('post');
    expect(retrievedPost).toBeNull();
  });
});
