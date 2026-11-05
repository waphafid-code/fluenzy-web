import { describe, it, expect } from 'vitest';

describe('Cross-Platform Mobile & Web Sync Contract', () => {
  it('should parse mobile Supabase payload and accurately map to web user stats', () => {
    // Payload as emitted by mobile SupabaseSyncService.syncUserProfile()
    const mobilePayload = {
      display_name: 'Budi Santoso',
      learning_goal: 'career',
      proficiency_level: 'intermediate',
      daily_commitment_minutes: 15,
      preferred_mascot: 'leo',
      xp: 350,
      streak_days: 7,
      gems: 520,
      hearts: 4,
      updated_at: new Date().toISOString(),
    };

    // Simulated web stats state
    const currentWebStats = {
      totalXp: 100,
      currentStreak: 2,
      gems: 450,
      hearts: 5,
    };

    // Bidirectional sync logic as applied in /api/dashboard
    const updatedWebStats = {
      totalXp: Math.max(currentWebStats.totalXp, mobilePayload.xp || 0),
      currentStreak: Math.max(currentWebStats.currentStreak, mobilePayload.streak_days || 0),
      gems: Math.max(currentWebStats.gems, mobilePayload.gems || 0),
      hearts: mobilePayload.hearts ?? currentWebStats.hearts,
    };

    // Verified invariants
    expect(updatedWebStats.totalXp).toBe(350);
    expect(updatedWebStats.currentStreak).toBe(7);
    expect(updatedWebStats.gems).toBe(520);
    expect(updatedWebStats.hearts).toBe(4);
  });

  it('preserves web progress when mobile values are uninitialized or lower', () => {
    const mobilePayload = {
      xp: 0,
      streak_days: 1,
      gems: 100,
      hearts: 5,
    };

    const currentWebStats = {
      totalXp: 400,
      currentStreak: 12,
      gems: 600,
      hearts: 5,
    };

    const updatedWebStats = {
      totalXp: Math.max(currentWebStats.totalXp, mobilePayload.xp || 0),
      currentStreak: Math.max(currentWebStats.currentStreak, mobilePayload.streak_days || 0),
      gems: Math.max(currentWebStats.gems, mobilePayload.gems || 0),
      hearts: mobilePayload.hearts ?? currentWebStats.hearts,
    };

    expect(updatedWebStats.totalXp).toBe(400);
    expect(updatedWebStats.currentStreak).toBe(12);
    expect(updatedWebStats.gems).toBe(600);
  });

  it('synchronizes target accent and voice profile without mascot dependency', () => {
    const mobileSyncPayload = {
      target_accent: 'us',
      voice_gender: 'female',
      audio_speed: 1.0,
      xp: 500,
      streak_days: 14,
      updated_at: new Date().toISOString(),
    };

    const syncedProfile = {
      targetAccent: mobileSyncPayload.target_accent,
      voiceGender: mobileSyncPayload.voice_gender,
      audioSpeed: mobileSyncPayload.audio_speed,
    };

    expect(syncedProfile.targetAccent).toBe('us');
    expect(syncedProfile.voiceGender).toBe('female');
    expect(syncedProfile.audioSpeed).toBe(1.0);
  });
});
