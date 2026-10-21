import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectLanguage,
  splitBilingualSegments,
  extractEnglishTarget,
  getEnglishVoice,
  getIndonesianVoice,
  getAvailableVoicesGrouped,
  synthesizeVibeVoiceAudio,
  stopVibeVoiceAudio,
  detectVoiceGender,
} from '../speech';

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

  describe('splitBilingualSegments() with Adaptive Code-Switching', () => {
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
      const enSegments = segments.filter((s) => s.lang.startsWith('en'));
      const idSegments = segments.filter((s) => s.lang === 'id-ID');

      expect(enSegments.length).toBeGreaterThan(0);
      expect(idSegments.length).toBeGreaterThan(0);
      expect(enSegments.some((s) => s.text === 'Go' || s.text === 'went')).toBe(true);
    });

    it('adapts to parentheses containing English keywords', () => {
      const text = 'Subjek tunggal (she/he/it) membutuhkan akhiran -s pada verb dasar.';
      const segments = splitBilingualSegments(text);

      expect(segments.length).toBeGreaterThanOrEqual(2);
      const en = segments.find((s) => s.text.includes('she/he/it') || s.text.includes('she'));
      expect(en?.lang).toMatch(/^en/);
    });

    it('adapts to unquoted code-switched English words in Indonesian explanations', () => {
      const text = 'Contoh kalimat dengan kata went adalah bentuk lampau dari go.';
      const segments = splitBilingualSegments(text);

      expect(segments.length).toBeGreaterThan(1);
      const enSegments = segments.filter((s) => s.lang.startsWith('en'));
      expect(enSegments.length).toBeGreaterThan(0);
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

  describe('Accent & Voice Customization Engine', () => {
    const mockVoices = [
      { name: 'Microsoft Jenny Online (Natural) - English (United States)', lang: 'en-US' },
      { name: 'Google US English', lang: 'en-US' },
      { name: 'Microsoft Sonia Online (Natural) - English (United Kingdom)', lang: 'en-GB' },
      { name: 'Google UK English Female', lang: 'en-GB' },
      { name: 'Microsoft Natasha Online (Natural) - English (Australia)', lang: 'en-AU' },
      { name: 'Microsoft Gadis Online (Natural) - Indonesian (Indonesia)', lang: 'id-ID' },
      { name: 'Microsoft Ardi Online (Natural) - Indonesian (Indonesia)', lang: 'id-ID' },
      { name: 'Google Bahasa Indonesia', lang: 'id-ID' },
    ] as unknown as SpeechSynthesisVoice[];

    beforeEach(() => {
      const synth = {
        getVoices: () => mockVoices,
        onvoiceschanged: null,
        cancel: vi.fn(),
        speak: vi.fn(),
      };
      vi.stubGlobal('speechSynthesis', synth);
      if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'speechSynthesis', {
          value: synth,
          writable: true,
          configurable: true,
        });
      }
    });

    it('groups voices into Indonesian, US, UK, and AU accents', () => {
      const grouped = getAvailableVoicesGrouped();
      expect(grouped.indonesian.length).toBe(3);
      expect(grouped.englishUS.length).toBe(2);
      expect(grouped.englishUK.length).toBe(2);
      expect(grouped.englishAU.length).toBe(1);
    });

    it('selects UK accent voice when preferredAccent is uk', () => {
      const voice = getEnglishVoice('uk');
      expect(voice?.lang).toBe('en-GB');
      expect(voice?.name).toContain('Sonia');
    });

    it('selects AU accent voice when preferredAccent is au', () => {
      const voice = getEnglishVoice('au');
      expect(voice?.lang).toBe('en-AU');
      expect(voice?.name).toContain('Natasha');
    });

    it('selects US accent voice when preferredAccent is us', () => {
      const voice = getEnglishVoice('us');
      expect(voice?.lang).toBe('en-US');
    });

    it('selects specific custom voice name if requested', () => {
      const voice = getEnglishVoice(undefined, 'Google UK English Female');
      expect(voice?.name).toBe('Google UK English Female');

      const idVoice = getIndonesianVoice('Microsoft Ardi Online (Natural) - Indonesian (Indonesia)');
      expect(idVoice?.name).toContain('Ardi');
    });

    it('selects male voice for male mascot and female voice for female mascot', () => {
      const maleVoice = mockVoices.find((v) => v.name.includes('Ardi'))!;
      const femaleVoice = mockVoices.find((v) => v.name.includes('Gadis'))!;
      expect(detectVoiceGender(maleVoice)).toBe('male');
      expect(detectVoiceGender(femaleVoice)).toBe('female');

      // Test Indonesian voice with male vs female target
      const idMale = getIndonesianVoice(undefined, 'male');
      expect(idMale?.name).toContain('Ardi');

      const idFemale = getIndonesianVoice(undefined, 'female');
      expect(idFemale?.name).toContain('Gadis');
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

  describe('VibeVoice Integration', () => {
    it('synthesizeVibeVoiceAudio returns false when VibeVoice is not enabled', async () => {
      const res = await synthesizeVibeVoiceAudio('Hello test');
      expect(res).toBe(false);
    });

    it('stopVibeVoiceAudio can be called safely without throwing', () => {
      expect(() => stopVibeVoiceAudio()).not.toThrow();
    });
  });
});
