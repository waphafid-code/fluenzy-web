import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDailyHabitProgress,
  recordPracticeSession,
  ingestSpokenMistake,
  getDueWarmupItems,
  recordWarmupReviewOutcome,
  getWarmupStats,
} from '../habitLoop';

describe('Habit Loop & Adaptive Leitner Warmup (Scope 4)', () => {
  beforeEach(() => {
    // Clear storage if present
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('tracks daily habit progress and calculates goal completion milestone', () => {
    const initial = getDailyHabitProgress();
    expect(initial.targetSessionsPerDay).toBe(1);
    expect(initial.sessionsCompletedToday).toBe(0);
    expect(initial.isGoalAchieved).toBe(false);

    // Record one 3-minute session earning 30 XP
    const result = recordPracticeSession(3, 30);
    expect(result.progress.sessionsCompletedToday).toBe(1);
    expect(result.progress.minutesSpentToday).toBe(3);
    expect(result.progress.xpEarnedToday).toBe(30);
    expect(result.progress.isGoalAchieved).toBe(true);
    expect(result.milestoneAchieved).toBe(true);
  });

  it('ingests mispronounced words into Leitner Box 1 with proper articulatory tips', () => {
    const item = ingestSpokenMistake({
      word: 'determination',
      targetSentence: 'Success requires patience and determination.',
      ipa: '/dɪˌtɜː.mɪˈneɪ.ʃən/',
      articulatoryHint: 'Tekanan ada di suku kata ke-4: de-ter-mi-NAI-shun.',
    });

    expect(item.word).toBe('determination');
    expect(item.box).toBe(1);
    expect(item.mistakeCount).toBe(1);
    expect(item.articulatoryHint).toContain('de-ter-mi-NAI-shun');

    // Ingest the same word again -> increments mistake count and resets to Box 1
    const secondIngest = ingestSpokenMistake({
      word: 'determination',
      targetSentence: 'Success requires patience and determination.',
      ipa: '/dɪˌtɜː.mɪˈneɪ.ʃən/',
    });
    expect(secondIngest.mistakeCount).toBe(2);
    expect(secondIngest.box).toBe(1);
  });

  it('retrieves due warmup items capped at 3 for a 60-second micro-drill', () => {
    const dueItems = getDueWarmupItems(3);
    expect(dueItems.length).toBeLessThanOrEqual(3);
    expect(dueItems.length).toBeGreaterThan(0);
  });

  it('promotes warmup item to Box 2 upon successful pronunciation practice', () => {
    const item = ingestSpokenMistake({
      word: 'architecture',
      targetSentence: 'We need to discuss the architecture trade offs.',
      ipa: '/ˈɑː.kɪ.tek.tʃər/',
    });

    const outcome = recordWarmupReviewOutcome(item.id, true);
    expect(outcome).not.toBeNull();
    expect(outcome!.item.box).toBe(2);
    expect(outcome!.transition.action).toBe('promoted');
    expect(outcome!.item.masteryStreak).toBe(1);
  });

  it('calculates comprehensive warmup stats across boxes', () => {
    const stats = getWarmupStats();
    expect(stats.totalItems).toBeGreaterThan(0);
    expect(stats.boxCounts[1]).toBeDefined();
    expect(typeof stats.dueCount).toBe('number');
  });
});

