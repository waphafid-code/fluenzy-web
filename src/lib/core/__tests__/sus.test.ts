import { describe, it, expect } from 'vitest';
import { calculateSusScore } from '../sus';

describe('System Usability Scale (SUS) Calculator', () => {
  it('calculates perfect 100 score when all positive items are 5 and negative items are 1', () => {
    // Ganjil: 5, Genap: 1
    const perfectResponses = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1];
    const res = calculateSusScore(perfectResponses);
    expect(res.score).toBe(100);
    expect(res.grade).toBe('A+');
    expect(res.isAboveAverage).toBe(true);
  });

  it('calculates worst score (0) when all positive items are 1 and negative items are 5', () => {
    // Ganjil: 1, Genap: 5
    const worstResponses = [1, 5, 1, 5, 1, 5, 1, 5, 1, 5];
    const res = calculateSusScore(worstResponses);
    expect(res.score).toBe(0);
    expect(res.grade).toBe('F');
    expect(res.isAboveAverage).toBe(false);
  });

  it('calculates standard neutral benchmark of 68+ for typical good feedback', () => {
    // Nilai campuran dengan kecenderungan positif (rata-rata 4 pada ganjil, 2 pada genap)
    const goodResponses = [4, 2, 4, 2, 4, 2, 4, 2, 4, 2];
    const res = calculateSusScore(goodResponses);
    // ( (3 + 3) * 5 ) * 2.5 = 30 * 2.5 = 75
    expect(res.score).toBe(75);
    expect(res.grade).toBe('B');
    expect(res.isAboveAverage).toBe(true);
  });

  it('throws an error if responses count is not exactly 10', () => {
    expect(() => calculateSusScore([5, 4, 3])).toThrow();
  });
});
