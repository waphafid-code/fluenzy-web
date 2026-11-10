import { describe, it, expect } from 'vitest';
import {
  MINIMAL_PAIRS_CATALOG,
  getMinimalPairsByCategory,
  MinimalPair,
} from '../minimalPairs';

describe('Minimal Pairs Linguistic Catalog', () => {
  it('memiliki katalog pasangan minimal untuk 6 kategori interferensi fonologis L1 Indonesia', () => {
    expect(MINIMAL_PAIRS_CATALOG.length).toBeGreaterThanOrEqual(6);

    const categories = new Set(MINIMAL_PAIRS_CATALOG.map((m) => m.categoryCode));
    expect(categories.has('theta')).toBe(true);
    expect(categories.has('v_f')).toBe(true);
    expect(categories.has('vowel_length')).toBe(true);
    expect(categories.has('eth')).toBe(true);
    expect(categories.has('cluster')).toBe(true);
  });

  it('memastikan setiap pasangan minimal memiliki petunjuk artikulasi mulut/lidah dan kalimat contoh', () => {
    MINIMAL_PAIRS_CATALOG.forEach((mp: MinimalPair) => {
      expect(mp.wordA.word).toBeDefined();
      expect(mp.wordB.word).toBeDefined();
      expect(mp.wordA.ipa).toMatch(/^\/.*\/$/);
      expect(mp.wordB.ipa).toMatch(/^\/.*\/$/);
      expect(mp.wordA.articulatoryTipId.length).toBeGreaterThan(15);
      expect(mp.wordB.articulatoryTipId.length).toBeGreaterThan(15);
      expect(mp.wordA.sampleSentence.toLowerCase()).toContain(mp.wordA.word.toLowerCase());
      expect(mp.wordB.sampleSentence.toLowerCase()).toContain(mp.wordB.word.toLowerCase());
    });
  });

  it('dapat memfilter pasangan minimal berdasarkan kode kategori', () => {
    const thetaPairs = getMinimalPairsByCategory('theta');
    expect(thetaPairs.length).toBeGreaterThan(0);
    expect(thetaPairs.every((p) => p.categoryCode === 'theta')).toBe(true);

    const allPairs = getMinimalPairsByCategory('all');
    expect(allPairs.length).toBe(MINIMAL_PAIRS_CATALOG.length);
  });
});
