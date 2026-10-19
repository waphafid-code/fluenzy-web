import { describe, it, expect } from 'vitest';
import {
  adjustDifficulty,
  calculateSessionQuotas,
  findWeakestSkills,
  selectAdaptiveQuestions,
  QuestionSummary,
} from '../questionSelector';

describe('Adaptive Question Selector Engine', () => {
  describe('Dynamic Difficulty Adjustment (Flow State)', () => {
    it('increases difficulty by 1 after 3 consecutive correct answers', () => {
      const res = adjustDifficulty(2, 3, 0);
      expect(res.nextDifficulty).toBe(3);
      expect(res.adjusted).toBe(true);
      expect(res.reason).toBe('increased_on_streak');
    });

    it('caps difficulty increase at maximum level 5', () => {
      const res = adjustDifficulty(5, 4, 0);
      expect(res.nextDifficulty).toBe(5);
      expect(res.adjusted).toBe(false);
      expect(res.reason).toBe('increased_on_streak');
    });

    it('decreases difficulty by 1 after 2 consecutive incorrect answers', () => {
      const res = adjustDifficulty(3, 0, 2);
      expect(res.nextDifficulty).toBe(2);
      expect(res.adjusted).toBe(true);
      expect(res.reason).toBe('decreased_on_errors');
    });

    it('caps difficulty decrease at minimum level 1', () => {
      const res = adjustDifficulty(1, 0, 3);
      expect(res.nextDifficulty).toBe(1);
      expect(res.adjusted).toBe(false);
      expect(res.reason).toBe('decreased_on_errors');
    });

    it('maintains current difficulty when streak criteria are not met', () => {
      const res = adjustDifficulty(3, 2, 1);
      expect(res.nextDifficulty).toBe(3);
      expect(res.adjusted).toBe(false);
      expect(res.reason).toBe('maintained');
    });
  });

  describe('Session Question Quotas & Ratios (60% / 25% / 15%)', () => {
    it('calculates 6 current, 2 weakest, 2 review for standard 10-question session', () => {
      const quotas = calculateSessionQuotas(10);
      expect(quotas.total).toBe(10);
      expect(quotas.currentLessonCount).toBe(6); // 60%
      expect(quotas.weakestSkillCount).toBe(2);  // 25%
      expect(quotas.dueReviewCount).toBe(2);     // 15%
      expect(quotas.currentLessonCount + quotas.weakestSkillCount + quotas.dueReviewCount).toBe(10);
    });

    it('calculates correct integer distribution for 8-question session', () => {
      const quotas = calculateSessionQuotas(8);
      expect(quotas.total).toBe(8);
      expect(quotas.currentLessonCount + quotas.weakestSkillCount + quotas.dueReviewCount).toBe(8);
    });
  });

  describe('Weakest Skills Identification', () => {
    it('identifies top 3 weakest skills in ascending order of mastery', () => {
      const masteries = [
        { skillId: 'verb-tense', mastery: 0.85 },
        { skillId: 'prepositions', mastery: 0.25 },
        { skillId: 'articles', mastery: 0.40 },
        { skillId: 'pronouns', mastery: 0.90 },
        { skillId: 'vocab-food', mastery: 0.30 },
      ];

      const weakest = findWeakestSkills(masteries, 3);
      expect(weakest).toEqual(['prepositions', 'vocab-food', 'articles']);
    });
  });

  describe('Adaptive Question Selection & Graceful Fallback', () => {
    const makeQuestions = (prefix: string, count: number, diff = 2): QuestionSummary[] =>
      Array.from({ length: count }, (_, i) => ({
        id: `${prefix}-${i + 1}`,
        skillId: `skill-${prefix}`,
        difficulty: diff,
      }));

    it('selects exactly 60% current, 25% weak, 15% review when all pools are fully stocked', () => {
      const current = makeQuestions('current', 10);
      const weak = makeQuestions('weak', 5);
      const review = makeQuestions('review', 5);

      const res = selectAdaptiveQuestions({
        currentLessonQuestions: current,
        weakestSkillQuestions: weak,
        dueReviewQuestions: review,
        totalQuestions: 10,
      });

      expect(res.totalSelected).toBe(10);
      expect(res.sourceBreakdown.currentLesson).toBe(6);
      expect(res.sourceBreakdown.weakestSkill).toBe(2);
      expect(res.sourceBreakdown.dueReview).toBe(2);
    });

    it('gracefully falls back to current pool if due review pool is empty (e.g. brand new user)', () => {
      const current = makeQuestions('current', 15);
      const weak = makeQuestions('weak', 5);
      const review: QuestionSummary[] = []; // Kosong!

      const res = selectAdaptiveQuestions({
        currentLessonQuestions: current,
        weakestSkillQuestions: weak,
        dueReviewQuestions: review,
        totalQuestions: 10,
      });

      // Tetap menghasilkan 10 butir soal lengkap
      expect(res.totalSelected).toBe(10);
      expect(res.sourceBreakdown.dueReview).toBe(0);
      expect(res.sourceBreakdown.currentLesson).toBe(8); // 6 + 2 fallback
      expect(res.sourceBreakdown.weakestSkill).toBe(2);
    });

    it('never produces duplicate question IDs in the session', () => {
      const sharedQuestion = { id: 'shared-1', skillId: 's1', difficulty: 2 };
      const current = [sharedQuestion, ...makeQuestions('curr', 8)];
      const weak = [sharedQuestion, ...makeQuestions('wk', 4)];

      const res = selectAdaptiveQuestions({
        currentLessonQuestions: current,
        weakestSkillQuestions: weak,
        totalQuestions: 8,
      });

      const ids = res.selectedQuestions.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
