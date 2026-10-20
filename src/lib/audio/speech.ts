// ============================================================================
// AUDIO & SPEECH SYNTHESIS ENGINE (Natural Bilingual Indonesian & English TTS)
// ============================================================================

/**
 * Memainkan suara "pop" ringan saat memilih/mengetuk kata atau huruf.
 */
export function playBubblePop() {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

// ============================================================================
// VOICE MANAGEMENT & CACHING
// ============================================================================

let cachedEnglishVoice: SpeechSynthesisVoice | null = null;
let cachedIndonesianVoice: SpeechSynthesisVoice | null = null;

export function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedEnglishVoice) return cachedEnglishVoice;

  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

  const preferredVoice =
    englishVoices.find(
      (v) =>
        v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Jenny') ||
        v.name.includes('Guy') ||
        v.name.includes('Aria') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel')
    ) || englishVoices[0];

  if (preferredVoice) cachedEnglishVoice = preferredVoice;
  return preferredVoice || null;
}

export function getIndonesianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedIndonesianVoice) return cachedIndonesianVoice;

  const voices = window.speechSynthesis.getVoices();
  const indonesianVoices = voices.filter(
    (v) =>
      v.lang.startsWith('id') ||
      v.lang.includes('ID') ||
      v.name.toLowerCase().includes('indonesia')
  );

  const preferredVoice =
    indonesianVoices.find(
      (v) =>
        v.name.includes('Gadis') ||
        v.name.includes('Ardi') ||
        v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Damayanti') ||
        v.name.includes('Andika')
    ) || indonesianVoices[0];

  if (preferredVoice) cachedIndonesianVoice = preferredVoice;
  return preferredVoice || null;
}

// Inisialisasi daftar voice saat siap di browser
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedEnglishVoice = null;
    cachedIndonesianVoice = null;
    getEnglishVoice();
    getIndonesianVoice();
  };
}

// ============================================================================
// LINGUISTIC LANGUAGE DETECTION
// ============================================================================

const INDONESIAN_KEYWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'untuk', 'pada', 'adalah',
  'dengan', 'kamu', 'saya', 'arti', 'bagus', 'kata', 'kalimat', 'pilihan',
  'benar', 'salah', 'pertahankan', 'hari', 'anda', 'dengarkan', 'sesuai',
  'berarti', 'lancar', 'fasih', 'bawah', 'silakan', 'apa', 'dalam', 'tidak',
  'sudah', 'bisa', 'kita', 'mereka', 'sangat', 'belajar', 'menggunakan',
  'pilihlah', 'ketik', 'terjemahkan', 'susun', 'berikut', 'menjadi',
  'penjelasan', 'kaidah', 'jawaban', 'tata', 'bahasa', 'subjek', 'bentuk',
  'lampau', 'sekarang', 'tunggal', 'jamak', 'akhiran', 'karena', 'oleh',
  'mengapa', 'bagaimana', 'struktur', 'predikat', 'objek', 'waktu', 'kemarin',
  'besok', 'halo', 'jangan', 'cermati', 'pembahasannya', 'perhatikan', 'contoh',
  'tanya', 'negatif', 'positif', 'fakta', 'umum', 'pasangkan', 'titik', 'lemah',
  'salam', 'mari', 'bedah', 'presisi', 'tetap', 'konsisten', 'petualangan',
  'petunjuk', 'lengkapilah', 'ubah'
]);

const ENGLISH_KEYWORDS = new Set([
  'the', 'is', 'are', 'was', 'were', 'at', 'which', 'on', 'and', 'a', 'an',
  'in', 'to', 'for', 'of', 'with', 'she', 'he', 'they', 'we', 'you', 'it',
  'my', 'your', 'our', 'their', 'this', 'that', 'have', 'has', 'had', 'do',
  'does', 'did', 'will', 'would', 'can', 'could', 'not', 'but', 'or', 'so',
  'because', 'from', 'by', 'about', 'went', 'drank', 'drinks', 'coffee', 'school',
  'morning', 'food', 'breakfast', 'spicy', 'earth', 'sun', 'sky', 'water',
  'awesome', 'job', 'streak', 'fire', 'practice', 'makes', 'perfect', 'effort',
  'focus', 'great', 'during', 'pull', 'request', 'review', 'code', 'quality',
  'revolves', 'around', 'rarely', 'goes', 'bed', 'before', 'midnight'
]);

/**
 * Mendeteksi apakah teks cenderung merupakan bahasa Indonesia ('id') atau bahasa Inggris ('en').
 */
export function detectLanguage(text: string): 'id' | 'en' {
  if (!text || !text.trim()) return 'en';
  const clean = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  let idScore = 0;
  let enScore = 0;

  for (const w of words) {
    if (INDONESIAN_KEYWORDS.has(w)) idScore += 2;
    if (ENGLISH_KEYWORDS.has(w)) enScore += 2;
    // Deteksi afiks morfologi bahasa Indonesia
    if (w.startsWith('meng') || w.startsWith('ber') || w.startsWith('ter') || w.startsWith('per')) {
      idScore += 1;
    }
    if (w.endsWith('kan') || w.endsWith('nya') || w.endsWith('lah')) {
      idScore += 1;
    }
  }

  if (idScore > enScore) return 'id';
  if (enScore > idScore) return 'en';

  const lower = text.toLowerCase();
  if (
    lower.includes(' meng') ||
    lower.includes('kan ') ||
    lower.includes(' nya') ||
    lower.includes(' ber') ||
    lower.includes(' di ')
  ) {
    return 'id';
  }

  return 'en';
}

// ============================================================================
// BILINGUAL SEGMENTATION & EXTRACTION
// ============================================================================

export interface SpeechSegment {
  text: string;
  lang: 'id-ID' | 'en-US';
}

/**
 * Memecah kalimat penjelasan / petunjuk bilingual menjadi segmen-segmen
 * bahasa yang terpisah (id-ID vs en-US) sehingga browser menggunakan aksen
 * yang tepat untuk masing-masing bagian.
 */
export function splitBilingualSegments(text: string): SpeechSegment[] {
  const clean = text.replace(/[*#]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  // Tangkap teks di dalam tanda kutip (quotes): "...", '...', “...”, ‘...’, `...`
  const quoteRegex = /["'“‘`]([^"'”’`]+)["'”’`]/g;
  const segments: SpeechSegment[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = quoteRegex.exec(clean)) !== null) {
    const beforeText = clean.substring(lastIndex, match.index).trim();
    const quotedText = match[1].trim();

    if (beforeText) {
      const sanitizedBefore = beforeText.replace(/[:\-–—]+$/, '').trim();
      if (sanitizedBefore) {
        const lang = detectLanguage(sanitizedBefore) === 'id' ? 'id-ID' : 'en-US';
        segments.push({ text: sanitizedBefore, lang });
      }
    }

    if (quotedText) {
      // Hilangkan simbol blank underscore (misal: "She _____ coffee" -> "She coffee")
      const sanitizedQuoted = quotedText.replace(/_+/g, '').replace(/\s+/g, ' ').trim();
      if (sanitizedQuoted) {
        const lang = detectLanguage(sanitizedQuoted) === 'id' ? 'id-ID' : 'en-US';
        segments.push({ text: sanitizedQuoted, lang });
      }
    }

    lastIndex = quoteRegex.lastIndex;
  }

  const remaining = clean.substring(lastIndex).trim();
  if (remaining) {
    const sanitizedRemaining = remaining.replace(/^[:\-–—]+/, '').trim();
    if (sanitizedRemaining) {
      const lang = detectLanguage(sanitizedRemaining) === 'id' ? 'id-ID' : 'en-US';
      segments.push({ text: sanitizedRemaining, lang });
    }
  }

  // Jika tidak ditemukan tanda kutip, periksa pemisah titik dua (colon)
  if (segments.length === 0) {
    if (clean.includes(':')) {
      const parts = clean.split(':');
      const p1 = parts[0].trim();
      const p2 = parts.slice(1).join(':').trim();
      if (p1 && p2) {
        segments.push({
          text: p1,
          lang: detectLanguage(p1) === 'id' ? 'id-ID' : 'en-US',
        });
        segments.push({
          text: p2.replace(/_+/g, '').replace(/\s+/g, ' ').trim(),
          lang: detectLanguage(p2) === 'id' ? 'id-ID' : 'en-US',
        });
        return segments;
      }
    }

    // Teks satu bahasa
    const lang = detectLanguage(clean) === 'id' ? 'id-ID' : 'en-US';
    segments.push({ text: clean, lang });
  }

  return segments;
}

/**
 * Ekstraksi kalimat target bahasa Inggris murni dari prompt soal,
 * opsional mengisi titik-titik (blank) dengan jawaban yang benar.
 */
export function extractEnglishTarget(prompt: string, fillBlankAnswer?: string): string | null {
  if (!prompt || !prompt.trim()) return null;

  // Cari teks di dalam kutipan
  const match = /["'“‘`]([^"'”’`]+)["'”’`]/.exec(prompt);
  if (match && match[1]) {
    let englishText = match[1].trim();
    if (fillBlankAnswer && englishText.includes('_')) {
      englishText = englishText.replace(/_+/, fillBlankAnswer);
    } else {
      englishText = englishText.replace(/_+/g, '').replace(/\s+/g, ' ').trim();
    }
    // Jika format word order dipisah garis miring (school / they / to / walk)
    if (englishText.includes('/')) {
      englishText = englishText.split('/').map((s) => s.trim()).join(' ');
    }
    return englishText;
  }

  // Jika tidak ada kutipan dan prompt berbahasa Inggris murni
  if (detectLanguage(prompt) === 'en') {
    return prompt.replace(/_+/g, fillBlankAnswer || '').trim();
  }

  return null;
}

// ============================================================================
// SYNTHESIS EXECUTION (SPEAKING API)
// ============================================================================

export interface SpeechOptions {
  lang?: 'en-US' | 'id-ID' | 'auto';
  rate?: number; // Kecepatan suara: 0.6x (turtle) sampai 1.2x
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Hentikan pemutaran audio yang sedang aktif.
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Mengucapkan teks bilingual dengan antrean bergantian:
 * Bagian bahasa Indonesia diucapkan dengan suara id-ID alami,
 * dan bagian bahasa Inggris diucapkan dengan suara en-US native.
 */
export function speakBilingualText(text: string, options: SpeechOptions = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onStart) options.onStart();
    setTimeout(() => {
      if (options.onEnd) options.onEnd();
    }, 1000);
    return;
  }

  stopSpeech();

  const segments = splitBilingualSegments(text);
  if (segments.length === 0) {
    options.onEnd?.();
    return;
  }

  let started = false;

  segments.forEach((seg, index) => {
    const isFirst = index === 0;
    const isLast = index === segments.length - 1;

    const utterance = new SpeechSynthesisUtterance(seg.text);
    utterance.lang = seg.lang;
    utterance.rate = options.rate ?? (seg.lang === 'id-ID' ? 1.0 : 0.95);
    utterance.pitch = options.pitch ?? 1.0;

    if (seg.lang === 'id-ID') {
      const idVoice = getIndonesianVoice();
      if (idVoice) utterance.voice = idVoice;
    } else {
      const enVoice = getEnglishVoice();
      if (enVoice) utterance.voice = enVoice;
    }

    if (isFirst) {
      utterance.onstart = () => {
        if (!started) {
          started = true;
          options.onStart?.();
        }
      };
    }

    if (isLast) {
      utterance.onend = () => {
        options.onEnd?.();
      };
      utterance.onerror = () => {
        options.onEnd?.();
      };
    }

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Fungsi utama pengucap suara (TTS):
 * Secara otomatis mendeteksi bahasa teks dan memilih suara asli (native)
 * bahasa Indonesia atau bahasa Inggris tanpa memaksakan aksen asing.
 */
export function speakText(text: string, options: SpeechOptions = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onStart) options.onStart();
    setTimeout(() => {
      if (options.onEnd) options.onEnd();
    }, 1000);
    return;
  }

  // Jika bahasa ditentukan secara eksplisit
  if (options.lang === 'en-US' || options.lang === 'id-ID') {
    stopSpeech();
    const cleanText = text.replace(/[*#]/g, ' ').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.lang;
    utterance.rate = options.rate ?? (options.lang === 'id-ID' ? 1.0 : 0.95);
    utterance.pitch = options.pitch ?? 1.0;

    const voice = options.lang === 'id-ID' ? getIndonesianVoice() : getEnglishVoice();
    if (voice) utterance.voice = voice;

    if (options.onStart) utterance.onstart = () => options.onStart?.();
    if (options.onEnd) {
      utterance.onend = () => options.onEnd?.();
      utterance.onerror = () => options.onEnd?.();
    }

    window.speechSynthesis.speak(utterance);
    return;
  }

  // Mode Auto: gunakan pembagian segmen bilingual cerdas
  speakBilingualText(text, options);
}

/**
 * Mengucapkan satu kata saat chip kata diklik (bergaya Duolingo word bubble)
 */
export function speakWord(
  word: string,
  rate: number = 0.9,
  onStart?: () => void,
  onEnd?: () => void
) {
  playBubblePop();
  speakText(word, { lang: 'en-US', rate, onStart, onEnd });
}

/**
 * Mengeja huruf secara individual (mis. A, B, C...)
 */
export function speakLetter(char: string, onStart?: () => void, onEnd?: () => void) {
  playBubblePop();
  speakText(char, { lang: 'en-US', rate: 0.8, pitch: 1.1, onStart, onEnd });
}

/**
 * Mengucapkan teks dengan turtle mode (kecepatan lambat 0.65x untuk kejelasan artikulasi)
 */
export function speakTurtleMode(text: string, options: SpeechOptions = {}) {
  speakText(text, { rate: 0.65, ...options });
}
