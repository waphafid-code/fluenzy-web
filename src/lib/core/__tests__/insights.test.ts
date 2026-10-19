import { describe, it, expect } from 'vitest';
import {
  calculateErrorTypeDistribution,
  generatePedagogicalInsights,
  formatDailyXpChartData,
  calculateStreakCalendar,
} from '../insights';

describe('Pedagogical Insights & Self-Awareness Engine', () => {
  describe('Error Type Distribution Aggregator', () => {
    it('aggregates error counts and calculates exact percentages for errors within 30 days', () => {
      const now = new Date('2026-10-20T10:00:00Z');
      const logs = [
        { errorType: 'typo', createdAt: '2026-10-19T00:00:00Z' },
        { errorType: 'typo', createdAt: '2026-10-18T00:00:00Z' },
        { errorType: 'word_order', createdAt: '2026-10-17T00:00:00Z' },
        { errorType: 'missing_word', createdAt: '2026-10-16T00:00:00Z' },
        // Log lebih dari 30 hari lalu (diabaikan)
        { errorType: 'wrong_word', createdAt: '2026-08-01T00:00:00Z' },
        // Log tanpa error (jawaban benar)
        { errorType: null, createdAt: '2026-10-19T00:00:00Z' },
      ];

      const res = calculateErrorTypeDistribution(logs, 30, now);
      // Total error dalam 30 hari = 4 (2 typo, 1 word_order, 1 missing_word)
      expect(res).toHaveLength(3);
      expect(res[0].type).toBe('typo');
      expect(res[0].count).toBe(2);
      expect(res[0].percentage).toBe(50.0);

      expect(res[1].count).toBe(1);
      expect(res[1].percentage).toBe(25.0);
    });

    it('returns empty array when there are no errors', () => {
      const res = calculateErrorTypeDistribution([]);
      expect(res).toEqual([]);
    });
  });

  describe('Rule-Based Pedagogical Insights Generation', () => {
    it('generates specific targeted advice when a specific skill error dominates', () => {
      const insights = generatePedagogicalInsights({
        weakSkills: [{ skillName: 'Simple Past Tense', mastery: 0.38 }],
        errorDistribution: [{ type: 'word_order', label: 'Urutan Kata Terbalik', count: 4, percentage: 60 }],
        dominantSkillError: {
          skillName: 'Simple Past Tense',
          errorType: 'word_order',
          count: 3,
        },
      });

      expect(insights).toHaveLength(2);
      expect(insights[0]).toContain('Simple Past Tense');
      expect(insights[0]).toContain('urutan kata terbalik');
      expect(insights[1]).toContain('tingkat penguasaan terendah (38%)');
    });

    it('generates syntactical structure guidance when word order is the overall dominant error', () => {
      const insights = generatePedagogicalInsights({
        weakSkills: [{ skillName: 'Prepositions', mastery: 0.45 }],
        errorDistribution: [{ type: 'word_order', label: 'Urutan Kata', count: 5, percentage: 55.5 }],
      });

      expect(insights[0]).toContain('susunan kata (word order)');
      expect(insights[0]).toContain('S-V-O');
    });

    it('generates praise when no weak skills exist', () => {
      const insights = generatePedagogicalInsights({
        weakSkills: [],
        errorDistribution: [],
      });

      expect(insights[0]).toContain('Luar biasa');
    });
  });

  describe('XP Chart Formatter & Streak Calendar', () => {
    it('formats 7-day XP history and fills 0 for inactive dates', () => {
      const refDate = new Date('2026-10-19T12:00:00Z');
      const activities = [
        { date: '2026-10-19', xpEarned: 40, lessonsCompleted: 2 },
        { date: '2026-10-17', xpEarned: 20, lessonsCompleted: 1 },
      ];

      const chartData = formatDailyXpChartData(activities, 7, refDate);
      expect(chartData).toHaveLength(7);
      expect(chartData[6].date).toBe('2026-10-19');
      expect(chartData[6].xp).toBe(40);
      expect(chartData[5].date).toBe('2026-10-18');
      expect(chartData[5].xp).toBe(0); // Inaktif terisi 0
      expect(chartData[4].date).toBe('2026-10-17');
      expect(chartData[4].xp).toBe(20);
    });

    it('builds calendar days for a given month with activity flags', () => {
      const activities = [
        { date: '2026-10-01', xpEarned: 15, lessonsCompleted: 1 },
        { date: '2026-10-05', xpEarned: 30, lessonsCompleted: 2 },
      ];

      const cal = calculateStreakCalendar(activities, 2026, 10);
      expect(cal).toHaveLength(31); // Oktober ada 31 hari
      expect(cal[0].day).toBe(1);
      expect(cal[0].active).toBe(true);
      expect(cal[1].day).toBe(2);
      expect(cal[1].active).toBe(false);
      expect(cal[4].day).toBe(5);
      expect(cal[4].active).toBe(true);
    });
  });
});
