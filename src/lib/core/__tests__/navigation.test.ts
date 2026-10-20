import { describe, it, expect, beforeEach, vi } from 'vitest';
import { COMPANIONS, getCompanionInfo, saveUserPreferences, getUserPreferences } from '../preferences';
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

  it('memvalidasi metadata 2 Karakter 3D (Lily & Arthur)', () => {
    const lily = getCompanionInfo('lily');
    expect(lily.name).toContain('Lily');
    expect(lily.role).toBe('AI Peer & Speaking Coach');
    expect(lily.avatar).toBe('/mascot/lily_head_circle.png');
    expect(lily.specialty).toContain('Speaking Drill');

    const arthur = getCompanionInfo('arthur');
    expect(arthur.name).toBe('Arthur');
    expect(arthur.role).toBe('Tech Lead & Diagnostic Mentor');
    expect(arthur.avatar).toBe('/mascot/arthur_head_circle.png');
    expect(arthur.specialty).toContain('Weekly Boss Battle');
  });

  it('mendukung pergantian preferensi companion ke lily atau arthur', () => {
    saveUserPreferences({ mascot: 'lily' });
    expect(getUserPreferences().mascot).toBe('lily');

    saveUserPreferences({ mascot: 'arthur' });
    expect(getUserPreferences().mascot).toBe('arthur');
  });
});
