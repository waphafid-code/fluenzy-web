import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  getUserPreferences,
  saveUserPreferences,
  calculateDailyGoalProgress,
} from '../preferences';

describe('User Preferences & Personalization Engine', () => {
  beforeEach(() => {
    let store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      clear: () => {
        store = {};
      },
    });
    vi.stubGlobal('dispatchEvent', vi.fn());
  });

  it('mengembalikan default preferences jika storage kosong', () => {
    const prefs = getUserPreferences();
    expect(prefs.mascot).toBe('boy');
    expect(prefs.dailyGoalXp).toBe(50);
    expect(prefs.audioSpeed).toBe(0.95);
    expect(prefs.learningFocus).toBe('balanced');
  });

  it('menyimpan dan memperbarui preferensi maskot dan target belajar', () => {
    const updated = saveUserPreferences({
      mascot: 'girl',
      dailyGoalXp: 100,
      learningFocus: 'grammar',
    });
    expect(updated.mascot).toBe('girl');
    expect(updated.dailyGoalXp).toBe(100);
    expect(updated.learningFocus).toBe('grammar');

    const loaded = getUserPreferences();
    expect(loaded.mascot).toBe('girl');
    expect(loaded.dailyGoalXp).toBe(100);
  });

  it('menghitung progres target harian dengan benar', () => {
    const p1 = calculateDailyGoalProgress(25, 50);
    expect(p1.percentage).toBe(50);
    expect(p1.isAchieved).toBe(false);
    expect(p1.remainingXp).toBe(25);

    const p2 = calculateDailyGoalProgress(60, 50);
    expect(p2.percentage).toBe(100);
    expect(p2.isAchieved).toBe(true);
    expect(p2.remainingXp).toBe(0);
  });
});
