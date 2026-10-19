import { describe, it, expect } from 'vitest';
import {
  getAlphaForDifficulty,
  getPerformanceScore,
  classifyMasteryLevel,
  calculateMasteryUpdate,
  calculateDecayedMastery,
  calculateSkillStatsUpdate,
} from '../mastery';

describe('Skill Mastery Engine (EMA & Decay)', () => {
  describe('Mathematical Parameters & Thresholds', () => {
    it('selects base alpha (0.25) for regular difficulty (1-3) and high alpha (0.35) for difficult questions (4-5)', () => {
      expect(getAlphaForDifficulty(1)).toBe(0.25);
      expect(getAlphaForDifficulty(2)).toBe(0.25);
      expect(getAlphaForDifficulty(3)).toBe(0.25);
      expect(getAlphaForDifficulty(4)).toBe(0.35);
      expect(getAlphaForDifficulty(5)).toBe(0.35);
    });

    it('assigns correct performance score based on scaffolding / hint usage', () => {
      expect(getPerformanceScore(true, false)).toBe(1.0);  // Benar mandiri
      expect(getPerformanceScore(true, true)).toBe(0.6);   // Benar dengan bantuan hint
      expect(getPerformanceScore(false, false)).toBe(0.0); // Salah tanpa hint
      expect(getPerformanceScore(false, true)).toBe(0.0);  // Salah meski memakai hint
    });

    it('classifies mastery levels accurately into weak (<0.5), medium (0.5-0.8), and strong (>0.8)', () => {
      expect(classifyMasteryLevel(0.0)).toBe('weak');
      expect(classifyMasteryLevel(0.49)).toBe('weak');
      expect(classifyMasteryLevel(0.5)).toBe('medium');
      expect(classifyMasteryLevel(0.65)).toBe('medium');
      expect(classifyMasteryLevel(0.8)).toBe('medium');
      expect(classifyMasteryLevel(0.81)).toBe('strong');
      expect(classifyMasteryLevel(1.0)).toBe('strong');
    });
  });

  describe('Exponential Moving Average (EMA) Updates', () => {
    it('uses initial mastery of 0.5 when currentMastery is omitted', () => {
      const res = calculateMasteryUpdate({ isCorrect: true, difficulty: 2 });
      expect(res.previousMastery).toBe(0.5);
      // 0.5 + 0.25 * (1.0 - 0.5) = 0.625
      expect(res.newMastery).toBe(0.625);
      expect(res.alpha).toBe(0.25);
      expect(res.resultScore).toBe(1.0);
      expect(res.delta).toBe(0.125);
      expect(res.level).toBe('medium');
    });

    it('calculates correct update for correct answer with hint (scaffolding score 0.6)', () => {
      const res = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        usedHint: true,
        difficulty: 2,
      });
      // 0.5 + 0.25 * (0.6 - 0.5) = 0.525
      expect(res.newMastery).toBe(0.525);
      expect(res.delta).toBe(0.025);
    });

    it('penalizes incorrect answer appropriately with base alpha', () => {
      const res = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: false,
        difficulty: 2,
      });
      // 0.5 + 0.25 * (0.0 - 0.5) = 0.375
      expect(res.newMastery).toBe(0.375);
      expect(res.delta).toBe(-0.125);
      expect(res.level).toBe('weak');
    });

    it('amplifies learning rate (alpha 0.35) for high difficulty questions (>=4)', () => {
      const correctHigh = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        difficulty: 4,
      });
      // 0.5 + 0.35 * (1.0 - 0.5) = 0.675
      expect(correctHigh.alpha).toBe(0.35);
      expect(correctHigh.newMastery).toBe(0.675);

      const incorrectHigh = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: false,
        difficulty: 5,
      });
      // 0.5 + 0.35 * (0.0 - 0.5) = 0.325
      expect(incorrectHigh.alpha).toBe(0.35);
      expect(incorrectHigh.newMastery).toBe(0.325);
    });

    it('clamps mastery value strictly within [0.0, 1.0] range', () => {
      const high = calculateMasteryUpdate({
        currentMastery: 1.0,
        isCorrect: true,
        difficulty: 5,
      });
      expect(high.newMastery).toBe(1.0);

      const low = calculateMasteryUpdate({
        currentMastery: 0.0,
        isCorrect: false,
        difficulty: 5,
      });
      expect(low.newMastery).toBe(0.0);
    });
  });

  describe('Ebbinghaus Forgetting Curve & Decay Calculation', () => {
    it('does not decay mastery if practiced within 7 days', () => {
      const now = new Date('2026-03-10T10:00:00Z');
      const practiced5DaysAgo = new Date('2026-03-05T10:00:00Z');

      const res = calculateDecayedMastery(0.85, practiced5DaysAgo, now);
      expect(res.decayApplied).toBe(0);
      expect(res.decayedMastery).toBe(0.85);
      expect(res.level).toBe('strong');
    });

    it('decays mastery by 0.05 per week of inactivity past the 7-day threshold', () => {
      const now = new Date('2026-03-24T10:00:00Z'); // 14 hari kemudian (1 minggu melebihi threshold 7 hari)
      const practiced14DaysAgo = new Date('2026-03-10T10:00:00Z');

      const res = calculateDecayedMastery(0.80, practiced14DaysAgo, now);
      // 14 hari - 7 hari threshold = 7 hari lewat = 1 minggu -> decay 0.05
      // 0.80 - 0.05 = 0.75
      expect(res.daysInactive).toBe(14);
      expect(res.decayApplied).toBe(0.05);
      expect(res.decayedMastery).toBe(0.75);
      expect(res.level).toBe('medium');
    });

    it('applies proportional 2-week decay (0.10) for 21 days of inactivity', () => {
      const now = new Date('2026-03-31T10:00:00Z'); // 21 hari kemudian (2 minggu lewat)
      const practiced21DaysAgo = new Date('2026-03-10T10:00:00Z');

      const res = calculateDecayedMastery(0.50, practiced21DaysAgo, now);
      // 21 - 7 = 14 hari = 2 minggu -> decay 0.10
      // 0.50 - 0.10 = 0.40
      expect(res.decayApplied).toBe(0.10);
      expect(res.decayedMastery).toBe(0.40);
      expect(res.level).toBe('weak');
    });

    it('never decays mastery below zero', () => {
      const now = new Date('2027-01-01T00:00:00Z');
      const practicedLongAgo = new Date('2026-01-01T00:00:00Z');

      const res = calculateDecayedMastery(0.20, practicedLongAgo, now);
      expect(res.decayedMastery).toBe(0);
    });
  });

  describe('Skill Stats & Response Time Aggregation', () => {
    it('correctly increments attempts, correctCount and calculates cumulative weighted average response time', () => {
      // Sesi 1: 1 attempt, benar, 3000ms
      const s1 = calculateSkillStatsUpdate({
        currentAttempts: 0,
        currentCorrectCount: 0,
        currentAvgResponseTimeMs: 0,
        isCorrect: true,
        responseTimeMs: 3000,
      });
      expect(s1.attempts).toBe(1);
      expect(s1.correctCount).toBe(1);
      expect(s1.avgResponseTimeMs).toBe(3000);

      // Sesi 2: attempt ke-2, salah, 5000ms -> rata-rata: (3000 + 5000) / 2 = 4000ms
      const s2 = calculateSkillStatsUpdate({
        currentAttempts: s1.attempts,
        currentCorrectCount: s1.correctCount,
        currentAvgResponseTimeMs: s1.avgResponseTimeMs,
        isCorrect: false,
        responseTimeMs: 5000,
      });
      expect(s2.attempts).toBe(2);
      expect(s2.correctCount).toBe(1);
      expect(s2.avgResponseTimeMs).toBe(4000);
    });
  });
});
