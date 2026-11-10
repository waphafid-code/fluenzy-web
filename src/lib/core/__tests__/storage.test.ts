import { describe, it, expect, beforeEach } from 'vitest';
import {
  safeGetStorage,
  safeSetStorage,
  safeRemoveStorage,
  isLocalStorageAvailable,
  clearInMemoryStorage,
} from '../storage';

describe('SafeStorage Core Utility', () => {
  beforeEach(() => {
    clearInMemoryStorage();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('stores and retrieves primitive values and objects safely', () => {
    const payload = { tier: 'A2', goal: 'career', streak: 5 };
    const success = safeSetStorage('test_key_1', payload);
    expect(success).toBe(true);

    const retrieved = safeGetStorage('test_key_1', { tier: 'A1', goal: 'social', streak: 0 });
    expect(retrieved).toEqual(payload);
  });

  it('returns fallback value if key does not exist', () => {
    const fallback = { status: 'default' };
    const result = safeGetStorage('non_existent_key', fallback);
    expect(result).toEqual(fallback);
  });

  it('auto-heals and returns fallback if corrupted JSON exists in storage', () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('corrupted_key', '{ invalid json [ syntax');
    }
    const fallback = { restored: true };
    const result = safeGetStorage('corrupted_key', fallback);
    expect(result).toEqual(fallback);

    // Verify key was removed during auto-healing
    if (typeof window !== 'undefined' && window.localStorage) {
      expect(window.localStorage.getItem('corrupted_key')).toBeNull();
    }
  });

  it('removes item safely without throwing', () => {
    safeSetStorage('to_remove', { active: true });
    safeRemoveStorage('to_remove');
    const result = safeGetStorage('to_remove', null);
    expect(result).toBeNull();
  });
});

