import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  getUserPreferences,
  saveUserPreferences,
  calculateDailyGoalProgress,
  getEffectiveVoiceGender,
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

  it('menentukan gender suara secara otomatis sesuai maskot aktif', () => {
    // Default mascot 'boy' (Arthur) -> male
    expect(getUserPreferences().mascot).toBe('boy');
    expect(getUserPreferences().voiceGender).toBe('auto');

    // Lily / girl -> female
    saveUserPreferences({ mascot: 'lily', voiceGender: 'auto' });
    expect(getEffectiveVoiceGender()).toBe('female');

    // Arthur / boy -> male
    saveUserPreferences({ mascot: 'arthur', voiceGender: 'auto' });
    expect(getEffectiveVoiceGender()).toBe('male');

    // Manual override to female despite male mascot
    saveUserPreferences({ mascot: 'arthur', voiceGender: 'female' });
    expect(getEffectiveVoiceGender()).toBe('female');
  });
});
