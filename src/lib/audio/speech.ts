// ============================================================================
// AUDIO & SPEECH SYNTHESIS ENGINE (Duolingo-style TTS & UI Sound Effects)
// ============================================================================

/**
 * Memainkan suara "pop" ringan saat memilih/mengetuk kata atau huruf.
 */
export function playBubblePop() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // browser audio autoplay restrictions ignored
  }
}

/**
 * Memainkan efek suara perayaan kemenangan/jawaban benar.
 */
export function playCelebrationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
    });
  } catch {
    // ignored
  }
}

/**
 * Konfigurasi suara Web Speech API
 */
let cachedVoice: SpeechSynthesisVoice | null = null;

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  // Prioritas voice bahasa Inggris berkualitas tinggi
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
  const preferredVoice =
    englishVoices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) ||
    englishVoices[0];

  if (preferredVoice) cachedVoice = preferredVoice;
  return preferredVoice || null;
}

// Inisialisasi daftar voice saat siap di browser
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    getEnglishVoice();
  };
}

export interface SpeechOptions {
  rate?: number; // Kecepatan suara: 0.6x (turtle) sampai 1.2x
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Mengucapkan teks/kalimat dalam bahasa Inggris menggunakan Web Speech API
 */
export function speakText(text: string, options: SpeechOptions = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onStart) options.onStart();
    setTimeout(() => {
      if (options.onEnd) options.onEnd();
    }, 1000);
    return;
  }

  try {
    // Hentikan suara yang sedang berjalan agar tidak bertumpuk
    window.speechSynthesis.cancel();

    // Bersihkan karakter aneh atau tag
    const cleanText = text.replace(/[_*#]/g, ' ').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.05;

    const voice = getEnglishVoice();
    if (voice) utterance.voice = voice;

    if (options.onStart) {
      utterance.onstart = () => options.onStart?.();
    }

    utterance.onend = () => {
      options.onEnd?.();
    };

    utterance.onerror = () => {
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    if (options.onEnd) options.onEnd();
  }
}

/**
 * Mengucapkan satu kata saat chip kata diklik
 */
export function speakWord(word: string, rate: number = 0.9, onStart?: () => void, onEnd?: () => void) {
  playBubblePop();
  speakText(word, { rate, onStart, onEnd });
}

/**
 * Mengeja huruf secara individual (mis. A, B, C...)
 */
export function speakLetter(char: string, onStart?: () => void, onEnd?: () => void) {
  playBubblePop();
  speakText(char, { rate: 0.8, pitch: 1.1, onStart, onEnd });
}
