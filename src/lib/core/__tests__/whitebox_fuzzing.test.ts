import { describe, it, expect } from 'vitest';
import { calculateSusScore } from '../sus';
import { calculatePairedTTest, calculateMean, calculateSampleSD } from '../statistics';
import { safeGetStorage, safeSetStorage } from '../storage';
import { checkRateLimit, resetRateLimiter } from '@/lib/server/rateLimiter';

describe('Whitebox Fuzzing & Stress Testing: Core Mathematical & Storage Engines', () => {
  describe('calculateSusScore (SUS Usability Fuzzing)', () => {
    it('menolak array dengan panjang bukan 10', () => {
      expect(() => calculateSusScore([1, 2, 3] as any)).toThrow();
      expect(() => calculateSusScore(null as any)).toThrow();
      expect(() => calculateSusScore(new Array(15).fill(3) as any)).toThrow();
    });

    it('menangani input non-numeric dan NaN secara tangguh tanpa menghasilkan NaN', () => {
      const fuzzedResponses = [NaN, '5', null, undefined, -10, 100, {}, [], 3.4, 'invalid'] as any;
      const result = calculateSusScore(fuzzedResponses);

      expect(Number.isFinite(result.score)).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.grade).toBeDefined();
    });

    it('menghasilkan skor 100 untuk respons ideal (semua ganjil=5, semua genap=1)', () => {
      const ideal = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1];
      const result = calculateSusScore(ideal);
      expect(result.score).toBe(100);
      expect(result.grade).toBe('A+');
      expect(result.isAboveAverage).toBe(true);
    });

    it('menghasilkan skor 0 untuk respons terburuk (semua ganjil=1, semua genap=5)', () => {
      const worst = [1, 5, 1, 5, 1, 5, 1, 5, 1, 5];
      const result = calculateSusScore(worst);
      expect(result.score).toBe(0);
      expect(result.grade).toBe('F');
      expect(result.isAboveAverage).toBe(false);
    });
  });

  describe('calculatePairedTTest & Statistics (Inferential Boundary Fuzzing)', () => {
    it('menangani sampel dengan varians nol (seluruh nilai pre dan post sama persis)', () => {
      const pre = [60, 60, 60, 60];
      const post = [60, 60, 60, 60];

      const result = calculatePairedTTest(pre, post);
      expect(Number.isFinite(result.tStatistic)).toBe(true);
      expect(result.tStatistic).toBe(0);
      expect(result.meanDiff).toBe(0);
      expect(result.cohensD).toBe(0);
      expect(result.isSignificant).toBe(false);
      expect(result.apaNarrativeIndonesian).toContain('t(3) = 0.00');
    });

    it('menangani input dengan nilai NaN secara graceful tanpa melempar exception fatal', () => {
      const pre = [50, NaN, 55, 60];
      const post = [70, 75, NaN, 80];

      const result = calculatePairedTTest(pre, post);
      expect(Number.isFinite(result.meanPre)).toBe(true);
      expect(Number.isFinite(result.meanPost)).toBe(true);
      expect(Number.isFinite(result.tStatistic)).toBe(true);
      expect(Number.isFinite(result.pValue)).toBe(true);
    });

    it('menolak dataset dengan jumlah pasangan < 2 atau ukuran pre dan post tidak seimbang', () => {
      expect(() => calculatePairedTTest([50], [70])).toThrow('minimal 2 pasang');
      expect(() => calculatePairedTTest([50, 60], [70])).toThrow('sama persis');
    });

    it('menghitung varians dan standard deviasi dengan benar pada array tunggal atau kosong', () => {
      expect(calculateMean([])).toBe(0);
      expect(calculateSampleSD([])).toBe(0);
      expect(calculateSampleSD([42])).toBe(0);
    });
  });

  describe('SafeStorage Resilience (Data State & Crash Resilience)', () => {
    it('menangani objek bersarang dan mengembalikan fallback saat data corrupt', () => {
      safeSetStorage('test_nested', { user: 'Alex', levels: [1, 2, 3] });
      const retrieved = safeGetStorage('test_nested', null);
      expect(retrieved).toEqual({ user: 'Alex', levels: [1, 2, 3] });

      // Simulasikan string corrupt di storage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('test_corrupt', '{unclosed_json_string:::');
      }
      const fallbackResult = safeGetStorage('test_corrupt', { default: true });
      expect(fallbackResult).toEqual({ default: true });
    });

    it('menangani objek sirkular (circular reference) tanpa melempar exception tak tertangani', () => {
      const circularObj: any = { name: 'cyclic' };
      circularObj.self = circularObj;

      // Tidak boleh throw error
      expect(() => {
        safeSetStorage('test_circular', circularObj);
      }).not.toThrow();
    });
  });

  describe('checkRateLimit Sliding Window Fuzzing', () => {
    it('mengisolasi kuota antar IP yang berbeda secara independen', () => {
      resetRateLimiter();
      const ipA = '1.1.1.1';
      const ipB = '2.2.2.2';

      // IP A memakai 5 request
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ipA, 5, 10000);
      }
      expect(checkRateLimit(ipA, 5, 10000).isAllowed).toBe(false);

      // IP B masih memiliki kuota penuh
      const resB = checkRateLimit(ipB, 5, 10000);
      expect(resB.isAllowed).toBe(true);
      expect(resB.remaining).toBe(4);
    });
  });
});
