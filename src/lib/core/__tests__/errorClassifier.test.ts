import { describe, it, expect } from 'vitest';
import {
  classifyError,
  calculateLevenshteinDistance,
  normalizeText,
  tokenizeWords,
} from '../errorClassifier';

describe('Error Classifier Engine (Cognitive Diagnosis)', () => {
  describe('Levenshtein & Normalization Utilities', () => {
    it('calculates correct Levenshtein distance for insertions, deletions, substitutions', () => {
      expect(calculateLevenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(calculateLevenshteinDistance('apple', 'aple')).toBe(1); // Deletion
      expect(calculateLevenshteinDistance('book', 'books')).toBe(1); // Insertion
      expect(calculateLevenshteinDistance('cat', 'bat')).toBe(1);    // Substitution
      expect(calculateLevenshteinDistance('same', 'same')).toBe(0);
    });

    it('normalizes casing, punctuations, and whitespace', () => {
      expect(normalizeText('  Hello, World!  ')).toBe('hello world');
      expect(normalizeText("What's your name?")).toBe('whats your name');
      expect(tokenizeWords('  She eats   an apple.  ')).toEqual(['she', 'eats', 'an', 'apple']);
    });
  });

  describe('Linguistic Error Classification (10+ Required Test Cases)', () => {
    // Kasus 1: Jawaban Tepat (Ignorasi Huruf Besar & Tanda Baca)
    it('Case 1: correctly identifies exact match with punctuation/casing variations', () => {
      const res = classifyError('I am eating an apple.', 'i am eating an apple', 'fill_blank');
      expect(res.isCorrect).toBe(true);
      expect(res.errorType).toBeNull();
      expect(res.similarityScore).toBe(1.0);
    });

    // Kasus 2: Typo 1 huruf pada kosakata tunggal
    it('Case 2: detects single-letter deletion typo on single word', () => {
      const res = classifyError('aple', 'apple', 'fill_blank');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('typo');
      expect(res.detail).toContain('Typo pada kata "aple"');
    });

    // Kasus 3: Typo 2 huruf (transposisi/substitusi) pada kosakata tunggal
    it('Case 3: detects 2-letter distance typo on single word', () => {
      const res = classifyError('wter', 'water', 'fill_blank');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('typo');
    });

    // Kasus 4: Word Order (Urutan kata terbalik, himpunan kata identik)
    it('Case 4: detects word order error when all tokens exist but scrambled', () => {
      const res = classifyError('apple an eat I', 'I eat an apple', 'word_order');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('word_order');
      expect(res.detail).toContain('urutan kalimatnya terbalik');
    });

    // Kasus 5: Typo dalam konteks kalimat lengkap
    it('Case 5: detects typo inside a full sentence', () => {
      const res = classifyError('She eats an aple', 'She eats an apple', 'fill_blank');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('typo');
    });

    // Kasus 6: Missing Word (Hilang auxiliary verb "is")
    it('Case 6: detects missing auxiliary verb in progressive tense', () => {
      const res = classifyError('She eating lunch', 'She is eating lunch', 'fill_blank');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('missing_word');
      expect(res.detail).toContain('kurang 1 kata');
    });

    // Kasus 7: Missing Word (Hilang preposisi "to")
    it('Case 7: detects missing preposition in destination sentence', () => {
      const res = classifyError('I go school', 'I go to school', 'fill_blank');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('missing_word');
    });

    // Kasus 8: Extra Word (Redundansi kata)
    it('Case 8: detects redundant duplicated word', () => {
      const res = classifyError('She is is eating lunch', 'She is eating lunch', 'fill_blank');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('extra_word');
      expect(res.detail).toContain('kelebihan 1 kata');
    });

    // Kasus 9: Extra Word (Interferensi L1 "am agree")
    it('Case 9: detects extra word addition in Indonesian L1 transfer error', () => {
      const res = classifyError('I am agree with you', 'I agree with you', 'fill_blank');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('extra_word');
    });

    // Kasus 10: Wrong Word (Substitusi leksikal kata yang keliru)
    it('Case 10: detects lexical mistake (wrong word replacement)', () => {
      const res = classifyError('He drank a pizza', 'He ate a pizza', 'fill_blank');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('wrong_word');
    });

    // Kasus 11: Pilihan Ganda (Wrong Choice)
    it('Case 11: flags incorrect multiple choice selection as wrong_choice', () => {
      const res = classifyError('Past Continuous', 'Simple Past', 'multiple_choice');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('wrong_choice');
      expect(res.similarityScore).toBe(0.0);
    });

    // Kasus 12: Listening Error (Kesalahan dengar yang bukan typo)
    it('Case 12: categorizes acoustic listening comprehension errors', () => {
      const res = classifyError('They will arrive tomorrow', 'They were arriving yesterday', 'listeningQuiz');
      expect(res.isCorrect).toBe(false);
      expect(res.errorType).toBe('listening_error');
    });
  });
});
