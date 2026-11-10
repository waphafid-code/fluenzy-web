import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCompanionInfo, saveUserPreferences, getUserPreferences } from '../preferences';
import { NAV_TABS } from '@/components/Navigation';

describe('Gamification 4-Tab Navigation & Companion Architecture', () => {
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

  it('memastikan 4 Tab Inti Tahap 2 terdefinisi dengan lengkap', () => {
    expect(NAV_TABS).toHaveLength(4);
    const tabIds = NAV_TABS.map((t) => t.id);
    expect(tabIds).toEqual(['roadmap', 'arena', 'insights', 'profile']);

    const roadmapTab = NAV_TABS.find((t) => t.id === 'roadmap');
    expect(roadmapTab?.label).toBe('Roadmap');
    expect(roadmapTab?.href).toBe('/roadmap');

    const arenaTab = NAV_TABS.find((t) => t.id === 'arena');
    expect(arenaTab?.label).toBe('Arena');
    expect(arenaTab?.href).toBe('/arena');

    const insightsTab = NAV_TABS.find((t) => t.id === 'insights');
    expect(insightsTab?.label).toBe('Insights');
    expect(insightsTab?.href).toBe('/dashboard');

    const profileTab = NAV_TABS.find((t) => t.id === 'profile');
    expect(profileTab?.label).toBe('Profile');
    expect(profileTab?.href).toBe('/profile');
  });

  it('memvalidasi metadata Karakter Pendamping (Arthur & Leo)', () => {
    const arthur = getCompanionInfo('arthur');
    expect(arthur.name).toContain('Arthur');
    expect(arthur.gender).toBe('male');
    expect(arthur.role).toBe('Tech Lead & Diagnostic Mentor');
    expect(arthur.avatar).toBe('/mascot/arthur_head_circle.png');
    expect(arthur.specialty).toContain('Diagnostic Tests');

    const boy = getCompanionInfo('boy');
    expect(boy.name).toBe('Leo');
    expect(boy.gender).toBe('male');
    expect(boy.role).toBe('Tech Lead & Diagnostic Mentor');
  });

  it('mendukung pergantian preferensi companion ke lily atau arthur', () => {
    saveUserPreferences({ mascot: 'lily' });
    expect(getUserPreferences().mascot).toBe('lily');

    saveUserPreferences({ mascot: 'arthur' });
    expect(getUserPreferences().mascot).toBe('arthur');
  });
});
