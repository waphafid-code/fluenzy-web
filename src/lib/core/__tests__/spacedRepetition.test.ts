import { describe, it, expect } from 'vitest';
import {
  getIntervalDaysForBox,
  calculateNextBox,
  calculateNextReviewDate,
  processReviewOutcome,
  isReviewDue,
  filterDueReviews,
} from '../spacedRepetition';

describe('Spaced Repetition System (Leitner 5-Box Model)', () => {
  describe('Interval Mapping & Clamping', () => {
    it('maps boxes 1 to 5 to exact Leitner intervals [1, 2, 4, 8, 16] days', () => {
      expect(getIntervalDaysForBox(1)).toBe(1);
      expect(getIntervalDaysForBox(2)).toBe(2);
      expect(getIntervalDaysForBox(3)).toBe(4);
      expect(getIntervalDaysForBox(4)).toBe(8);
      expect(getIntervalDaysForBox(5)).toBe(16);
    });

    it('clamps values below Box 1 and above Box 5 safely', () => {
      expect(getIntervalDaysForBox(0)).toBe(1);
      expect(getIntervalDaysForBox(-5)).toBe(1);
      expect(getIntervalDaysForBox(6)).toBe(16);
      expect(getIntervalDaysForBox(99)).toBe(16);
    });
  });

  describe('Box Progression & Reset Logic', () => {
    it('promotes user to next box upon answering correctly (capped at Box 5)', () => {
      expect(calculateNextBox(1, true)).toBe(2);
      expect(calculateNextBox(2, true)).toBe(3);
      expect(calculateNextBox(3, true)).toBe(4);
      expect(calculateNextBox(4, true)).toBe(5);
      expect(calculateNextBox(5, true)).toBe(5); // Capped at 5
    });

    it('immediately resets box to 1 upon answering incorrectly', () => {
      expect(calculateNextBox(1, false)).toBe(1);
      expect(calculateNextBox(2, false)).toBe(1);
      expect(calculateNextBox(3, false)).toBe(1);
      expect(calculateNextBox(4, false)).toBe(1);
      expect(calculateNextBox(5, false)).toBe(1);
    });
  });

  describe('Schedule Processing & Outcomes', () => {
    it('calculates future review dates based on box interval', () => {
      const base = new Date('2026-04-01T08:00:00Z');
      const reviewDateBox2 = calculateNextReviewDate(2, base); // 2 days
      expect(reviewDateBox2.toISOString()).toBe('2026-04-03T08:00:00.000Z');

      const reviewDateBox5 = calculateNextReviewDate(5, base); // 16 days
      expect(reviewDateBox5.toISOString()).toBe('2026-04-17T08:00:00.000Z');
    });

    it('processes successful review promotion with detailed outcome payload', () => {
      const base = new Date('2026-05-10T12:00:00Z');
      const outcome = processReviewOutcome(2, true, base);

      expect(outcome.previousBox).toBe(2);
      expect(outcome.nextBox).toBe(3);
      expect(outcome.intervalDays).toBe(4);
      expect(outcome.nextReviewAt.toISOString()).toBe('2026-05-14T12:00:00.000Z');
      expect(outcome.action).toBe('promoted');
    });

    it('maintains Box 5 when already at maximum proficiency', () => {
      const base = new Date('2026-05-10T12:00:00Z');
      const outcome = processReviewOutcome(5, true, base);

      expect(outcome.previousBox).toBe(5);
      expect(outcome.nextBox).toBe(5);
      expect(outcome.intervalDays).toBe(16);
      expect(outcome.action).toBe('max_level_maintained');
    });

    it('resets to Box 1 when user fails a review item', () => {
      const base = new Date('2026-05-10T12:00:00Z');
      const outcome = processReviewOutcome(4, false, base);

      expect(outcome.previousBox).toBe(4);
      expect(outcome.nextBox).toBe(1);
      expect(outcome.intervalDays).toBe(1);
      expect(outcome.nextReviewAt.toISOString()).toBe('2026-05-11T12:00:00.000Z');
      expect(outcome.action).toBe('reset_to_box_1');
    });
  });

  describe('Due Review Filtering', () => {
    it('determines whether a review is due based on comparison with current time', () => {
      const now = new Date('2026-06-15T10:00:00Z');
      const overdue = new Date('2026-06-14T10:00:00Z');
      const future = new Date('2026-06-16T10:00:00Z');

      expect(isReviewDue(overdue, now)).toBe(true);
      expect(isReviewDue(now, now)).toBe(true);
      expect(isReviewDue(future, now)).toBe(false);
    });

    it('filters only due review items from schedule lists', () => {
      const now = new Date('2026-06-20T10:00:00Z');
      const list = [
        { id: '1', nextReviewAt: new Date('2026-06-19T00:00:00Z') }, // due
        { id: '2', nextReviewAt: new Date('2026-06-20T09:59:00Z') }, // due
        { id: '3', nextReviewAt: new Date('2026-06-21T00:00:00Z') }, // not due
      ];

      const due = filterDueReviews(list, now);
      expect(due).toHaveLength(2);
      expect(due.map((d) => d.id)).toEqual(['1', '2']);
    });
  });
});
