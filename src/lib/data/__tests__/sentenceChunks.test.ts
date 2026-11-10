import { describe, it, expect } from 'vitest';
import {
  SENTENCE_CHUNKS,
  getSentenceChunksByFilter,
  assembleChunkSentence,
} from '../sentenceChunks';

describe('Sentence Chunks Bank & Assembler (Scope 2)', () => {
  it('contains sentence chunks across all three CEFR tiers (A1, A2, B1)', () => {
    const a1Chunks = SENTENCE_CHUNKS.filter((c) => c.tier === 'A1');
    const a2Chunks = SENTENCE_CHUNKS.filter((c) => c.tier === 'A2');
    const b1Chunks = SENTENCE_CHUNKS.filter((c) => c.tier === 'B1');

    expect(a1Chunks.length).toBeGreaterThanOrEqual(4);
    expect(a2Chunks.length).toBeGreaterThanOrEqual(5);
    expect(b1Chunks.length).toBeGreaterThanOrEqual(4);
    expect(SENTENCE_CHUNKS.length).toBeGreaterThanOrEqual(14);
  });

  it('contains sentence chunks covering all 4 learning goals (career, academic, travel, social)', () => {
    const career = SENTENCE_CHUNKS.filter((c) => c.goal === 'career');
    const academic = SENTENCE_CHUNKS.filter((c) => c.goal === 'academic');
    const travel = SENTENCE_CHUNKS.filter((c) => c.goal === 'travel');
    const social = SENTENCE_CHUNKS.filter((c) => c.goal === 'social');

    expect(career.length).toBeGreaterThan(0);
    expect(academic.length).toBeGreaterThan(0);
    expect(travel.length).toBeGreaterThan(0);
    expect(social.length).toBeGreaterThan(0);
  });

  it('guarantees each chunk has at least 3 slot variations and a valid defaultSlotId', () => {
    for (const chunk of SENTENCE_CHUNKS) {
      expect(chunk.variations.length).toBeGreaterThanOrEqual(3);
      expect(chunk.patternTemplate).toContain('{SLOT}');
      const defaultVar = chunk.variations.find((v) => v.id === chunk.defaultSlotId);
      expect(defaultVar).toBeDefined();
      expect(chunk.pedagogicalTipId.length).toBeGreaterThan(10);
      expect(chunk.contextSituationId.length).toBeGreaterThan(10);
    }
  });

  it('filters chunks accurately with getSentenceChunksByFilter', () => {
    const a1Career = getSentenceChunksByFilter('A1', 'career');
    expect(a1Career.every((c) => c.tier === 'A1' && c.goal === 'career')).toBe(true);

    const b1All = getSentenceChunksByFilter('B1', 'all');
    expect(b1All.every((c) => c.tier === 'B1')).toBe(true);

    const allTravel = getSentenceChunksByFilter('all', 'travel');
    expect(allTravel.every((c) => c.goal === 'travel')).toBe(true);
  });

  it('assembles full sentences accurately via assembleChunkSentence', () => {
    const sample = SENTENCE_CHUNKS[0];
    const firstVar = sample.variations[0];
    const assembled = assembleChunkSentence(sample, firstVar.id);

    expect(assembled.sentence).toBe(firstVar.exampleFullSentence);
    expect(assembled.variation.id).toBe(firstVar.id);
  });
});

