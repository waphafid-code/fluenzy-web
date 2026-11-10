import { describe, it, expect } from 'vitest';
import {
  calculateMean,
  calculateSampleSD,
  calculateTDistributionPValue,
  calculatePairedTTest,
} from '../statistics';

describe('Inferential Statistics Engine for Thesis (Bab 4)', () => {
  it('menghitung rata-rata (mean) dan standar deviasi sampel (SD) dengan benar', () => {
    const data = [10, 20, 30, 40, 50];
    const mean = calculateMean(data);
    expect(mean).toBe(30);

    const sd = calculateSampleSD(data, mean);
    // SD sampel untuk [10,20,30,40,50]: variance = 1000/4 = 250 -> sqrt(250) ≈ 15.81
    expect(Number(sd.toFixed(2))).toBe(15.81);
  });

  it('menghitung paired samples t-test, Cohen d, dan Hake Gain pada data eksperimen intervensi', () => {
    // Simulasi 10 responden sebelum dan setelah menggunakan Fluenzy
    const preScores = [55, 60, 50, 65, 58, 62, 53, 59, 61, 57]; // mean ≈ 58.0
    const postScores = [82, 85, 78, 88, 84, 86, 80, 85, 87, 83]; // mean ≈ 83.8

    const result = calculatePairedTTest(preScores, postScores);

    expect(result.n).toBe(10);
    expect(result.df).toBe(9);
    expect(result.meanPre).toBe(58);
    expect(result.meanPost).toBe(83.8);
    expect(result.meanDiff).toBeGreaterThan(20);
    expect(result.tStatistic).toBeGreaterThan(10); // perbedaan sangat signifikan
    expect(result.pValue).toBeLessThan(0.01);
    expect(result.isSignificant).toBe(true);
    expect(result.pValueFormatted).toBe('p < .001');

    // Cohen's d harus berada pada kategori Large (d >= 0.8)
    expect(result.cohensD).toBeGreaterThan(0.8);
    expect(result.cohensDInterpretation).toBe('Large');

    // Hake Gain harus Medium atau High (0.3 - 0.7+)
    expect(result.hakeGain).toBeGreaterThanOrEqual(0.5);
    expect(result.apaNarrativeIndonesian).toContain('t(9) =');
    expect(result.apaNarrativeIndonesian).toContain('p < .001');
    expect(result.apaNarrativeIndonesian).toContain('Cohen\'s d');
  });

  it('melempar error jika panjang array pre dan post tidak seimbang', () => {
    expect(() => calculatePairedTTest([50, 60], [70])).toThrow();
  });
});
