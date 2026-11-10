import { describe, it, expect } from 'vitest';
import {
  detectPitchAutocorrelation,
  generateReferencePitchContour,
  analyzePitchIntonation,
} from '../pitchDetection';

describe('Real-time F0 Pitch Detection & Intonation Engine', () => {
  it('mengembalikan null jika buffer hening atau di bawah ambang RMS', () => {
    const silence = new Float32Array(1024).fill(0.001);
    const result = detectPitchAutocorrelation(silence, 44100);
    expect(result).toBeNull();
  });

  it('mendeteksi frekuensi gelombang sinus vokal 220 Hz dengan presisi', () => {
    const sampleRate = 44100;
    const frequency = 220; // Nada A3 vokal manusia
    const buffer = new Float32Array(2048);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = 0.5 * Math.sin((2 * Math.PI * frequency * i) / sampleRate);
    }

    const detected = detectPitchAutocorrelation(buffer, sampleRate);
    expect(detected).not.toBeNull();
    expect(detected).toBeGreaterThan(215);
    expect(detected).toBeLessThan(225);
  });

  it('mendeteksi frekuensi gelombang sinus vokal 130 Hz (suara pria rendah)', () => {
    const sampleRate = 44100;
    const frequency = 130;
    const buffer = new Float32Array(2048);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = 0.6 * Math.sin((2 * Math.PI * frequency * i) / sampleRate);
    }

    const detected = detectPitchAutocorrelation(buffer, sampleRate);
    expect(detected).not.toBeNull();
    expect(detected).toBeGreaterThan(125);
    expect(detected).toBeLessThan(135);
  });

  it('menghasilkan kontur acuan intonasi rising untuk pertanyaan Yes/No', () => {
    const contour = generateReferencePitchContour('Are you ready for the meeting?', 20);
    expect(contour.length).toBe(20);
    // Pertanyaan Yes/No harus naik di akhir kalimat
    const startPoint = contour[0];
    const endPoint = contour[contour.length - 1];
    expect(endPoint).toBeGreaterThan(startPoint);
  });

  it('menghasilkan kontur acuan intonasi falling untuk kalimat deklaratif', () => {
    const contour = generateReferencePitchContour('We deployed the service to production.', 20);
    expect(contour.length).toBe(20);
    // Kalimat deklaratif harus melandai turun di akhir (terminal fall)
    const midPoint = contour[10];
    const endPoint = contour[contour.length - 1];
    expect(midPoint).toBeGreaterThan(endPoint);
  });

  it('mendiagnosis gaya bicara monoton bila variasi rentang Hz sangat sempit', () => {
    // Sampel pitch dengan rentang hanya 15 Hz (monotone)
    const flatSamples = [140, 142, 141, 143, 142, 144, 140, 141, 142, 143];
    const analysis = analyzePitchIntonation(flatSamples);
    expect(analysis.isMonotone).toBe(true);
    expect(analysis.pitchRangeHz).toBeLessThan(32);
    expect(analysis.diagnosticHint).toContain('monotone');
  });

  it('mendiagnosis gaya bicara dinamis bila variasi rentang Hz luas', () => {
    // Sampel pitch dinamis dengan rentang 70 Hz (120 Hz s/d 190 Hz)
    const dynamicSamples = [120, 135, 160, 185, 190, 170, 150, 130, 125];
    const analysis = analyzePitchIntonation(dynamicSamples);
    expect(analysis.isMonotone).toBe(false);
    expect(analysis.dynamicScore).toBeGreaterThanOrEqual(80);
    expect(analysis.pitchRangeHz).toBeGreaterThan(50);
  });
});

