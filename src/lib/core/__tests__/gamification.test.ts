import { describe, it, expect } from 'vitest';
import {
  calculateLazyHearts,
  deductHeartOnIncorrect,
  calculateQuestionXp,
  calculateLessonRewards,
  evaluateDailyStreak,
} from '../gamification';

describe('Gamification & Hearts Engine', () => {
  describe('Lazy Hearts Regeneration (Cron-Free)', () => {
    it('returns 5 hearts and null nextRegenSeconds when hearts are at maximum capacity', () => {
      const res = calculateLazyHearts(5, new Date());
      expect(res.hearts).toBe(5);
      expect(res.heartsRegenerated).toBe(0);
      expect(res.nextRegenSeconds).toBeNull();
    });

    it('reports pending regeneration time when less than 30 minutes have elapsed', () => {
      const base = new Date('2026-07-01T10:00:00Z');
      const tenMinsLater = new Date('2026-07-01T10:10:00Z'); // 10 menit berlalu

      const res = calculateLazyHearts(3, base, tenMinsLater);
      expect(res.hearts).toBe(3);
      expect(res.heartsRegenerated).toBe(0);
      // Sisa 20 menit = 1200 detik
      expect(res.nextRegenSeconds).toBe(1200);
    });

    it('regenerates exactly 1 heart after 30 minutes of inactivity', () => {
      const base = new Date('2026-07-01T10:00:00Z');
      const thirtyMinsLater = new Date('2026-07-01T10:30:00Z');

      const res = calculateLazyHearts(3, base, thirtyMinsLater);
      expect(res.hearts).toBe(4);
      expect(res.heartsRegenerated).toBe(1);
      // Sisa 30 menit untuk hati berikutnya
      expect(res.nextRegenSeconds).toBe(1800);
    });

    it('regenerates multiple hearts and caps strictly at MAX_HEARTS (5)', () => {
      const base = new Date('2026-07-01T10:00:00Z');
      const fiveHoursLater = new Date('2026-07-01T15:00:00Z'); // 300 menit (10 interval)

      const res = calculateLazyHearts(1, base, fiveHoursLater);
      expect(res.hearts).toBe(5);
      expect(res.heartsRegenerated).toBe(4);
      expect(res.nextRegenSeconds).toBeNull();
    });
  });

  describe('Heart Deduction on Incorrect Answer', () => {
    it('deducts 1 heart and allows session to continue if hearts remain', () => {
      const now = new Date('2026-07-01T10:00:00Z');
      const res = deductHeartOnIncorrect(4, now, now);
      expect(res.hearts).toBe(3);
      expect(res.canContinueSession).toBe(true);
    });

    it('halts session (canContinueSession = false) when last heart is lost', () => {
      const now = new Date('2026-07-01T10:00:00Z');
      const res = deductHeartOnIncorrect(1, now, now);
      expect(res.hearts).toBe(0);
      expect(res.canContinueSession).toBe(false);
    });
  });

  describe('XP Weighting & Incentives for Weak Skills', () => {
    it('awards 10 XP for standard correct answer', () => {
      const res = calculateQuestionXp(true, false);
      expect(res.baseXp).toBe(10);
      expect(res.weakSkillBonus).toBe(0);
      expect(res.totalXp).toBe(10);
    });

    it('awards +3 bonus XP (total 13 XP) when practicing identified weak skills', () => {
      const res = calculateQuestionXp(true, true);
      expect(res.baseXp).toBe(10);
      expect(res.weakSkillBonus).toBe(3);
      expect(res.totalXp).toBe(13);
    });

    it('awards 0 XP for incorrect answer regardless of skill priority', () => {
      const res = calculateQuestionXp(false, true);
      expect(res.totalXp).toBe(0);
    });
  });

  describe('Lesson Completion & Daily Goal Rewards', () => {
    it('awards 10 gems and 5 bonus XP for a perfect lesson completion', () => {
      const res = calculateLessonRewards(true, 10, 50, 100);
      expect(res.lessonXpBonus).toBe(5);
      expect(res.gemsEarned).toBe(10);
      expect(res.dailyGoalReached).toBe(false);
    });

    it('triggers +20 gems bonus when user reaches daily goal XP threshold', () => {
      // Prior XP 20, Lesson XP 15 -> Total 35 (Melewati target 30)
      const res = calculateLessonRewards(false, 20, 15, 30);
      expect(res.dailyGoalReached).toBe(true);
      expect(res.dailyGoalGemsBonus).toBe(20);
      expect(res.totalGemsEarned).toBe(30); // 10 base + 20 goal bonus
    });
  });

  describe('Streak Maintenance & Streak Freeze Protection', () => {
    it('increments streak on consecutive day activity', () => {
      const res = evaluateDailyStreak('2026-08-01', '2026-08-02', 5, 1);
      expect(res.newStreak).toBe(6);
      expect(res.freezeUsed).toBe(false);
      expect(res.status).toBe('incremented');
    });

    it('maintains streak if already practiced today', () => {
      const res = evaluateDailyStreak('2026-08-02', '2026-08-02', 6, 1);
      expect(res.newStreak).toBe(6);
      expect(res.status).toBe('maintained');
    });

    it('protects streak when missing 1 day if user possesses a Streak Freeze', () => {
      // Bolos pada 2026-08-03, kembali pada 2026-08-04 (selisih 2 hari)
      const res = evaluateDailyStreak('2026-08-02', '2026-08-04', 10, 1);
      expect(res.newStreak).toBe(11);
      expect(res.freezeUsed).toBe(true);
      expect(res.remainingFreezeCount).toBe(0);
      expect(res.status).toBe('protected_by_freeze');
    });

    it('resets streak to 1 when missing days without Streak Freeze', () => {
      const res = evaluateDailyStreak('2026-08-02', '2026-08-04', 10, 0);
      expect(res.newStreak).toBe(1);
      expect(res.freezeUsed).toBe(false);
      expect(res.status).toBe('reset');
    });
  });
});
