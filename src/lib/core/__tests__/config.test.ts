import { describe, it, expect } from 'vitest';
import {
  GAMIFICATION_CONFIG,
  ERROR_CLASSIFIER_CONFIG,
  MASTERY_CONFIG,
  LEITNER_CONFIG,
  QUESTION_SELECTOR_CONFIG,
} from '../config';

describe('Configuration Constants Integrity Tests', () => {
  it('defines valid XP and gamification constants conforming to formulas', () => {
    expect(GAMIFICATION_CONFIG.XP_PER_CORRECT_ANSWER).toBe(10);
    expect(GAMIFICATION_CONFIG.XP_PERFECT_LESSON_BONUS).toBe(5);
    expect(GAMIFICATION_CONFIG.XP_WEAK_SKILL_BONUS).toBe(3);
    expect(GAMIFICATION_CONFIG.DEFAULT_DAILY_GOAL_XP).toBe(30);
    expect(GAMIFICATION_CONFIG.GEMS_PER_LESSON_COMPLETION).toBe(10);
  });

  it('defines balanced hearts mechanics and lazy regeneration interval', () => {
    expect(GAMIFICATION_CONFIG.MAX_HEARTS).toBe(5);
    expect(GAMIFICATION_CONFIG.HEARTS_LOST_PER_INCORRECT).toBe(1);
    expect(GAMIFICATION_CONFIG.HEART_REGEN_MINUTES).toBe(30);
    expect(GAMIFICATION_CONFIG.HEART_REGEN_INTERVAL_MS).toBe(30 * 60 * 1000);
    expect(GAMIFICATION_CONFIG.STREAK_FREEZE_COST_GEMS).toBe(100);
  });

  it('configures default Indonesian timezone', () => {
    expect(GAMIFICATION_CONFIG.DEFAULT_TIMEZONE).toBe('Asia/Jakarta');
  });

  it('establishes structured Leitner 5-box intervals [1, 2, 4, 8, 16] days', () => {
    expect(LEITNER_CONFIG.BOX_INTERVALS_DAYS).toEqual([1, 2, 4, 8, 16]);
    expect(LEITNER_CONFIG.MIN_BOX).toBe(1);
    expect(LEITNER_CONFIG.MAX_BOX).toBe(5);
  });

  it('defines valid Mastery parameters for EMA and decay', () => {
    expect(MASTERY_CONFIG.INITIAL_MASTERY).toBe(0.5);
    expect(MASTERY_CONFIG.ALPHA_BASE).toBe(0.25);
    expect(MASTERY_CONFIG.ALPHA_DIFFICULT).toBe(0.35);
    expect(MASTERY_CONFIG.DIFFICULTY_THRESHOLD_FOR_HIGH_ALPHA).toBe(4);
    expect(MASTERY_CONFIG.RESULT_CORRECT_NO_HINT).toBe(1.0);
    expect(MASTERY_CONFIG.RESULT_CORRECT_WITH_HINT).toBe(0.6);
    expect(MASTERY_CONFIG.RESULT_INCORRECT).toBe(0.0);
    expect(MASTERY_CONFIG.DECAY_INACTIVITY_DAYS_THRESHOLD).toBe(7);
  });

  it('defines valid Adaptive Question Selector distribution ratios', () => {
    const totalRatio =
      QUESTION_SELECTOR_CONFIG.CURRENT_LESSON_RATIO +
      QUESTION_SELECTOR_CONFIG.WEAKEST_SKILL_RATIO +
      QUESTION_SELECTOR_CONFIG.DUE_REVIEW_RATIO;
    expect(Math.round(totalRatio * 100) / 100).toBe(1.0);
    expect(QUESTION_SELECTOR_CONFIG.STREAK_TO_INCREASE_DIFFICULTY).toBe(3);
    expect(QUESTION_SELECTOR_CONFIG.STREAK_TO_DECREASE_DIFFICULTY).toBe(2);
  });

  it('defines error classifier Levenshtein thresholds', () => {
    expect(ERROR_CLASSIFIER_CONFIG.MAX_LEVENSHTEIN_TYPO).toBe(2);
    expect(ERROR_CLASSIFIER_CONFIG.MAX_LENGTH_DIFF_TYPO).toBe(2);
  });
});
