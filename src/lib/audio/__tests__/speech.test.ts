import { describe, it, expect } from 'vitest';
import { detectLanguage, splitBilingualSegments, extractEnglishTarget } from '../speech';

describe('Speech Synthesis Bilingual Routing Engine', () => {
  describe('detectLanguage()', () => {
    it('accurately detects pure Indonesian sentences and phrases', () => {
      expect(detectLanguage('Halo! Saya Lily, AI Peer dan Speaking Coach kamu.')).toBe('id');
      expect(detectLanguage('Belajar setiap hari membuatmu makin lancar!')).toBe('id');
      expect(detectLanguage('Pilihlah bentuk kata kerja yang tepat')).toBe('id');
      expect(detectLanguage('Subjek tunggal orang ketiga membutuhkan akhiran -s pada verb dasar.')).toBe('id');
      expect(detectLanguage('Ketik terjemahan bahasa Inggris dari')).toBe('id');
      expect(detectLanguage('Susun kata-kata berikut menjadi kalimat yang benar')).toBe('id');
      expect(detectLanguage('Jangan khawatir! Cermati pembahasannya ya.')).toBe('id');
    });

    it('accurately detects pure English sentences and phrases', () => {
      expect(detectLanguage('She drinks coffee every morning.')).toBe('en');
      expect(detectLanguage('Awesome job! You got this!')).toBe('en');
      expect(detectLanguage("Practice makes perfect! Let's go!")).toBe('en');
      expect(detectLanguage('Good morning team. During our pull request review, we must check code quality.')).toBe('en');
      expect(detectLanguage('What time do you have breakfast?')).toBe('en');
      expect(detectLanguage('The earth revolves around the sun.')).toBe('en');
    });
  });

  describe('splitBilingualSegments()', () => {
    it('splits question prompts with Indonesian instructions and English quotes', () => {
      const prompt = 'Pilihlah bentuk kata kerja yang tepat: "She _____ coffee every morning."';
      const segments = splitBilingualSegments(prompt);

      expect(segments.length).toBe(2);
      expect(segments[0].lang).toBe('id-ID');
      expect(segments[0].text).toContain('Pilihlah bentuk kata kerja yang tepat');
      expect(segments[1].lang).toBe('en-US');
      expect(segments[1].text).toContain('She coffee every morning.');
    });

    it('splits explanations with embedded English keywords correctly', () => {
      const explanation = '"Go" adalah irregular verb. Bentuk lampaunya (Past Tense) adalah "went".';
      const segments = splitBilingualSegments(explanation);

      expect(segments.length).toBeGreaterThanOrEqual(2);
      const enSegments = segments.filter((s) => s.lang === 'en-US');
      const idSegments = segments.filter((s) => s.lang === 'id-ID');

      expect(enSegments.length).toBeGreaterThan(0);
      expect(idSegments.length).toBeGreaterThan(0);
      expect(enSegments.some((s) => s.text === 'Go' || s.text === 'went')).toBe(true);
    });

    it('returns a single Indonesian segment for mascot greetings', () => {
      const text = 'Ayo lanjutkan petualangan belajarmu hari ini!';
      const segments = splitBilingualSegments(text);

      expect(segments.length).toBe(1);
      expect(segments[0].lang).toBe('id-ID');
      expect(segments[0].text).toBe(text);
    });

    it('returns a single English segment for English sentences', () => {
      const text = 'Keep it up! Your streak is on fire!';
      const segments = splitBilingualSegments(text);

      expect(segments.length).toBe(1);
      expect(segments[0].lang).toBe('en-US');
      expect(segments[0].text).toBe(text);
    });
  });

  describe('extractEnglishTarget()', () => {
    it('extracts English sentence from a quoted prompt', () => {
      const prompt = 'Pilihlah bentuk kata kerja yang tepat: "She _____ coffee every morning."';
      const target = extractEnglishTarget(prompt, 'drinks');
      expect(target).toBe('She drinks coffee every morning.');
    });

    it('extracts English target from word order prompts', () => {
      const prompt = 'Susun kata-kata berikut menjadi kalimat: "school / they / to / walk / always"';
      const target = extractEnglishTarget(prompt);
      expect(target).toBe('school they to walk always');
    });

    it('returns null or target if prompt itself is already in English', () => {
      const prompt = 'The earth revolves around the sun.';
      const target = extractEnglishTarget(prompt);
      expect(target).toBe('The earth revolves around the sun.');
    });
  });
});
