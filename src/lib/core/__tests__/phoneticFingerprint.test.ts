import { describe, it, expect, beforeEach } from 'vitest';
import {
  CRITICAL_L1_PHONEMES,
  calculatePhoneticFingerprint,
} from '../phoneticFingerprint';

describe('Phonetic Fingerprint Engine (Scope 7)', () => {
  it('covers all 6 critical Indonesian L1 interference sound classes', () => {
    expect(CRITICAL_L1_PHONEMES.length).toBe(6);
    const codes = CRITICAL_L1_PHONEMES.map((p) => p.code);
    expect(codes).toContain('dental_voiceless');
    expect(codes).toContain('dental_voiced');
    expect(codes).toContain('labiodental_v');
    expect(codes).toContain('silent_letters');
    expect(codes).toContain('consonant_clusters');
    expect(codes).toContain('vowel_length');
  });

  it('calculates mastery percentages and assigns proper competency statuses', () => {
    const custom = {
      dental_voiceless: 85, // Mastered
      dental_voiced: 62, // Needs Practice
      labiodental_v: 75, // Developing
    };

    const fingerprint = calculatePhoneticFingerprint(custom);
    expect(fingerprint.length).toBe(6);

    const voiceless = fingerprint.find((f) => f.code === 'dental_voiceless');
    expect(voiceless?.status).toBe('Mastered');
    expect(voiceless?.masteryPercent).toBe(85);

    const voiced = fingerprint.find((f) => f.code === 'dental_voiced');
    expect(voiced?.status).toBe('Needs Practice');
    expect(voiced?.masteryPercent).toBe(62);

    const labio = fingerprint.find((f) => f.code === 'labiodental_v');
    expect(labio?.status).toBe('Developing');
  });
});

