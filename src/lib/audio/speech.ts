// ============================================================================
// AUDIO & SPEECH SYNTHESIS ENGINE (Natural Bilingual Indonesian & English TTS)
// Supports Customizable Accents (US, UK, AU), Indonesian Voices, & Code-Switching
// ============================================================================

import { getUserPreferences, EnglishAccentChoice } from '@/lib/core/preferences';

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
// VOICE MANAGEMENT & ACCENT FILTERING
// ============================================================================

export interface GroupedVoices {
  indonesian: SpeechSynthesisVoice[];
  englishUS: SpeechSynthesisVoice[];
  englishUK: SpeechSynthesisVoice[];
  englishAU: SpeechSynthesisVoice[];
  allEnglish: SpeechSynthesisVoice[];
}

export function getSpeechSynth(): SpeechSynthesis | null {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    return window.speechSynthesis;
  }
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as unknown as { speechSynthesis?: SpeechSynthesis }).speechSynthesis
  ) {
    return (globalThis as unknown as { speechSynthesis: SpeechSynthesis }).speechSynthesis;
  }
  return null;
}

/**
 * Mengelompokkan seluruh suara yang tersedia di browser pengguna berdasarkan aksen & bahasa.
 */
export function getAvailableVoicesGrouped(): GroupedVoices {
  const synth = getSpeechSynth();
  if (!synth) {
    return {
      indonesian: [],
      englishUS: [],
      englishUK: [],
      englishAU: [],
      allEnglish: [],
    };
  }

  const voices = synth.getVoices();
  const indonesian = voices.filter(
    (v) =>
      v.lang.startsWith('id') ||
      v.lang.includes('ID') ||
      v.name.toLowerCase().includes('indonesia')
  );

  const allEnglish = voices.filter((v) => v.lang.startsWith('en'));
  const englishUS = allEnglish.filter(
    (v) => v.lang === 'en-US' || v.lang.toLowerCase().includes('us') || v.name.toLowerCase().includes('united states')
  );
  const englishUK = allEnglish.filter(
    (v) =>
      v.lang === 'en-GB' ||
      v.lang.toLowerCase().includes('gb') ||
      v.lang.toLowerCase().includes('uk') ||
      v.name.toLowerCase().includes('united kingdom')
  );
  const englishAU = allEnglish.filter(
    (v) => v.lang === 'en-AU' || v.lang.toLowerCase().includes('au') || v.name.toLowerCase().includes('australia')
  );

  return {
    indonesian,
    englishUS,
    englishUK,
    englishAU,
    allEnglish,
  };
}

/**
 * Mendeteksi gender suara (pria / wanita) berdasarkan nama suara dan metadata persona.
 */
export function detectVoiceGender(v: SpeechSynthesisVoice): 'male' | 'female' | 'unknown' {
  const name = v.name.toLowerCase();

  // Keyword langsung
  if (name.includes('female') || name.includes('perempuan') || name.includes('wanita') || name.includes('woman') || name.includes('girl')) {
    return 'female';
  }
  if (name.includes('male') || name.includes('laki') || name.includes('pria') || name.includes('man') || name.includes('boy')) {
    return 'male';
  }

  // Persona wanita umum pada OS & browser
  const femalePersonas = [
    'jenny', 'aria', 'michelle', 'sonia', 'natasha', 'libby', 'neerja', 'ava',
    'samantha', 'victoria', 'karen', 'fiona', 'moira', 'tessa', 'zira', 'lily',
    'gadis', 'damayanti', 'siti', 'ayu', 'linda', 'sarah', 'emily', 'clara',
    'anna', 'susan', 'cathy', 'alice', 'zoe', 'helena', 'catherine'
  ];
  for (const p of femalePersonas) {
    if (name.includes(p)) return 'female';
  }

  // Persona pria umum pada OS & browser
  const malePersonas = [
    'guy', 'christopher', 'ryan', 'andrew', 'brian', 'oliver', 'steffan', 'eric',
    'daniel', 'david', 'mark', 'george', 'james', 'tom', 'alex', 'fred', 'arthur',
    'ardi', 'andika', 'budi', 'reza', 'michael', 'john', 'william', 'richard', 'davis'
  ];
  for (const p of malePersonas) {
    if (name.includes(p)) return 'male';
  }

  return 'unknown';
}

/**
 * Memilih suara bahasa Inggris terbaik berdasarkan preferensi aksen (US, UK, AU),
 * nama suara kustom pengguna, dan gender maskot (pria/wanita).
 */
export function getEnglishVoice(
  preferredAccent?: EnglishAccentChoice,
  customVoiceName?: string,
  targetGender?: 'male' | 'female'
): SpeechSynthesisVoice | null {
  const synth = getSpeechSynth();
  if (!synth) return null;

  const voices = synth.getVoices();
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
  if (englishVoices.length === 0) return null;

  let prefs = null;
  try {
    prefs = getUserPreferences();
  } catch {
    // fallback if outside browser storage
  }

  const targetVoiceName = customVoiceName || prefs?.customEnglishVoice;
  const accent = preferredAccent || prefs?.englishAccent || 'auto';
  const effectiveGender = targetGender || (prefs ? (prefs.voiceGender === 'auto' ? (prefs.mascot === 'girl' || prefs.mascot === 'lily' ? 'female' : 'male') : prefs.voiceGender) : 'male');

  // 1. Jika pengguna memilih nama suara spesifik
  if (targetVoiceName && targetVoiceName !== 'auto') {
    const matched = englishVoices.find((v) => v.name === targetVoiceName);
    if (matched) return matched;
  }

  // 2. Filter pool kandidat berdasarkan aksen
  let candidatePool = englishVoices;
  if (accent === 'uk') {
    const ukPool = englishVoices.filter(
      (v) =>
        v.lang === 'en-GB' ||
        v.lang.toLowerCase().includes('gb') ||
        v.lang.toLowerCase().includes('uk') ||
        v.name.toLowerCase().includes('united kingdom')
    );
    if (ukPool.length > 0) candidatePool = ukPool;
  } else if (accent === 'au') {
    const auPool = englishVoices.filter(
      (v) =>
        v.lang === 'en-AU' ||
        v.lang.toLowerCase().includes('au') ||
        v.name.toLowerCase().includes('australia')
    );
    if (auPool.length > 0) candidatePool = auPool;
  } else if (accent === 'us') {
    const usPool = englishVoices.filter(
      (v) =>
        v.lang === 'en-US' ||
        v.lang.toLowerCase().includes('us') ||
        v.name.toLowerCase().includes('united states')
    );
    if (usPool.length > 0) candidatePool = usPool;
  }

  // 3. Prioritaskan suara natural neural berkualitas tinggi dan sesuaikan dengan gender maskot
  const sorted = [...candidatePool].sort(
    (a, b) => rankEnglishVoice(b, effectiveGender) - rankEnglishVoice(a, effectiveGender)
  );
  return sorted[0] || englishVoices[0];
}

export function rankEnglishVoice(v: SpeechSynthesisVoice, targetGender?: 'male' | 'female'): number {
  let score = 0;
  const name = v.name.toLowerCase();
  const voiceGender = detectVoiceGender(v);

  // Filter Gender: Utamakan suara yang cocok dengan maskot (cowok -> male, cewek -> female)
  if (targetGender === 'male') {
    if (voiceGender === 'male') score += 180;
    else if (voiceGender === 'female') score -= 250; // Penalti kuat agar maskot cowok tidak bersuara cewek
  } else if (targetGender === 'female') {
    if (voiceGender === 'female') score += 180;
    else if (voiceGender === 'male') score -= 250; // Penalti kuat agar maskot cewek tidak bersuara cowok
  }

  // Tier 1: Modern Neural Online Natural voices (Edge, Azure, Chrome)
  if (name.includes('online (natural)')) score += 150;
  else if (name.includes('natural')) score += 120;
  else if (name.includes('neural')) score += 110;

  // Tier 2: Premium Browser & OS Neural engines
  if (name.includes('google')) score += 80;
  if (name.includes('enhanced') || name.includes('premium')) score += 75;

  // Tier 3: Known high-fidelity personas
  if (
    name.includes('jenny') ||
    name.includes('guy') ||
    name.includes('aria') ||
    name.includes('sonia') ||
    name.includes('ryan') ||
    name.includes('samantha') ||
    name.includes('daniel') ||
    name.includes('ava') ||
    name.includes('oliver') ||
    name.includes('christopher')
  ) {
    score += 50;
  }

  // Heavy penalty untuk suara sintesis robotik era SAPI5 / Desktop lama
  if (name.includes('desktop')) score -= 200;
  if (name.includes('david desktop') || name.includes('zira desktop') || name.includes('mark desktop') || name.includes('george desktop')) {
    score -= 250;
  }
  if (name.includes('espeak') || name.includes('sapi')) score -= 300;

  return score;
}

export function rankIndonesianVoice(v: SpeechSynthesisVoice, targetGender?: 'male' | 'female'): number {
  let score = 0;
  const name = v.name.toLowerCase();
  const voiceGender = detectVoiceGender(v);

  // Filter Gender bahasa Indonesia
  if (targetGender === 'male') {
    if (voiceGender === 'male') score += 180;
    else if (voiceGender === 'female') score -= 250;
  } else if (targetGender === 'female') {
    if (voiceGender === 'female') score += 180;
    else if (voiceGender === 'male') score -= 250;
  }

  if (name.includes('online (natural)')) score += 150;
  else if (name.includes('natural')) score += 120;
  else if (name.includes('neural')) score += 110;

  if (name.includes('google')) score += 80;
  if (name.includes('gadis') || name.includes('ardi')) score += 70;
  if (name.includes('damayanti') || name.includes('andika')) score += 50;

  if (name.includes('desktop')) score -= 200;
  if (name.includes('espeak') || name.includes('sapi')) score -= 300;

  return score;
}

/**
 * Memilih suara bahasa Indonesia terbaik berdasarkan nama suara kustom pengguna atau kualitas natural,
 * serta dicocokkan dengan gender maskot aktif.
 */
export function getIndonesianVoice(
  customVoiceName?: string,
  targetGender?: 'male' | 'female'
): SpeechSynthesisVoice | null {
  const synth = getSpeechSynth();
  if (!synth) return null;

  const voices = synth.getVoices();
  const indonesianVoices = voices.filter(
    (v) =>
      v.lang.startsWith('id') ||
      v.lang.includes('ID') ||
      v.name.toLowerCase().includes('indonesia')
  );
  if (indonesianVoices.length === 0) return null;

  let prefs = null;
  try {
    prefs = getUserPreferences();
  } catch {
    // ignore
  }

  const targetVoiceName = customVoiceName || prefs?.customIndonesianVoice;
  const effectiveGender = targetGender || (prefs ? (prefs.voiceGender === 'auto' ? (prefs.mascot === 'girl' || prefs.mascot === 'lily' ? 'female' : 'male') : prefs.voiceGender) : 'male');

  // 1. Jika pengguna memilih nama suara spesifik
  if (targetVoiceName && targetVoiceName !== 'auto') {
    const matched = indonesianVoices.find((v) => v.name === targetVoiceName);
    if (matched) return matched;
  }

  // 2. Prioritas suara natural Indonesia berbasis neural ranking & gender
  const sorted = [...indonesianVoices].sort(
    (a, b) => rankIndonesianVoice(b, effectiveGender) - rankIndonesianVoice(a, effectiveGender)
  );
  return sorted[0] || indonesianVoices[0];
}

// Inisialisasi daftar voice saat siap di browser
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    getAvailableVoicesGrouped();
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
  'petunjuk', 'lengkapilah', 'ubah', 'contohnya'
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
  'revolves', 'around', 'rarely', 'goes', 'bed', 'before', 'midnight', 'go',
  'gone', 'going', 'drink', 'drinking', 'irregular', 'regular', 'verb', 'past', 'tense'
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
// BILINGUAL SEGMENTATION & ADAPTIVE CODE-SWITCHING
// ============================================================================

export interface SpeechSegment {
  text: string;
  lang: 'id-ID' | 'en-US';
}

/**
 * Memecah kalimat penjelasan / petunjuk bilingual menjadi segmen-segmen
 * bahasa yang terpisah (id-ID vs en-US) dengan adaptasi penuh terhadap tanda kutip,
 * tanda kurung kata bahasa Inggris, serta kosakata bahasa Inggris dalam kalimat Indonesia.
 */
export function splitBilingualSegments(text: string): SpeechSegment[] {
  const clean = text.replace(/[*#]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  // 1. Ekstraksi segmen tanda kutip "...", '...', “...”, ‘...’, `...` ATAU kurung (...)
  const tokenRegex = /(["'“‘`][^"'”’`]+["'”’`])|(\([^)]{1,60}\))/g;
  const segments: SpeechSegment[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(clean)) !== null) {
    const beforeText = clean.substring(lastIndex, match.index).trim();
    const matchedToken = match[0].trim();

    if (beforeText) {
      const sanitizedBefore = beforeText.replace(/[:\-–—]+$/, '').trim();
      if (sanitizedBefore) {
        // Cek apakah ada kata bahasa Inggris yang terisolasi dalam bagian sebelum token
        appendAdaptedSegments(segments, sanitizedBefore);
      }
    }

    if (matchedToken) {
      // Hilangkan tanda kutip atau tanda kurung
      const innerText = matchedToken
        .replace(/^["'“‘`\(]|["'”’`\)]$/g, '')
        .replace(/_+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (innerText) {
        const lang = detectLanguage(innerText) === 'id' ? 'id-ID' : 'en-US';
        segments.push({ text: innerText, lang });
      }
    }

    lastIndex = tokenRegex.lastIndex;
  }

  const remaining = clean.substring(lastIndex).trim();
  if (remaining) {
    const sanitizedRemaining = remaining.replace(/^[:\-–—]+/, '').trim();
    if (sanitizedRemaining) {
      appendAdaptedSegments(segments, sanitizedRemaining);
    }
  }

  // Jika tidak ditemukan tanda kutip atau kurung
  if (segments.length === 0) {
    if (clean.includes(':')) {
      const parts = clean.split(':');
      const p1 = parts[0].trim();
      const p2 = parts.slice(1).join(':').trim();
      if (p1 && p2) {
        appendAdaptedSegments(segments, p1);
        appendAdaptedSegments(segments, p2.replace(/_+/g, '').replace(/\s+/g, ' ').trim());
        return segments;
      }
    }

    // Adaptasikan teks biasa jika terdapat kata Inggris dalam kalimat Indonesia
    appendAdaptedSegments(segments, clean);
  }

  return segments;
}

/**
 * Membantu membagi teks yang mayoritas Indonesia tetapi mengandung kata kunci/kata kerja bahasa Inggris
 * (seperti: "kata went adalah bentuk lampau dari go")
 */
function appendAdaptedSegments(targetList: SpeechSegment[], rawText: string) {
  const isOverallIndo = detectLanguage(rawText) === 'id';
  if (!isOverallIndo) {
    targetList.push({ text: rawText, lang: 'en-US' });
    return;
  }

  // Jika mayoritas bahasa Indonesia, periksa apakah terdapat token bahasa Inggris khas
  // seperti kata 'went', 'go', 'drinks', 'past tense' yang berdiri sendiri
  const words = rawText.split(/\s+/);
  let currentBuffer: string[] = [];

  for (const word of words) {
    const normalized = word.toLowerCase().replace(/[^\w]/g, '');
    const isSpecialEnglishWord =
      ENGLISH_KEYWORDS.has(normalized) &&
      !INDONESIAN_KEYWORDS.has(normalized) &&
      normalized.length > 1;

    if (isSpecialEnglishWord) {
      if (currentBuffer.length > 0) {
        targetList.push({ text: currentBuffer.join(' '), lang: 'id-ID' });
        currentBuffer = [];
      }
      targetList.push({ text: word, lang: 'en-US' });
    } else {
      currentBuffer.push(word);
    }
  }

  if (currentBuffer.length > 0) {
    targetList.push({ text: currentBuffer.join(' '), lang: 'id-ID' });
  }
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
  gender?: 'male' | 'female';
  preferredAccent?: EnglishAccentChoice;
  customVoiceName?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

let activeVibeVoiceAudio: HTMLAudioElement | null = null;

export function stopVibeVoiceAudio() {
  if (activeVibeVoiceAudio) {
    try {
      activeVibeVoiceAudio.pause();
      activeVibeVoiceAudio.currentTime = 0;
      activeVibeVoiceAudio = null;
    } catch {
      // ignore
    }
  }
}

let activeNeuralAudio: HTMLAudioElement | null = null;

export function stopNeuralAudio() {
  if (activeNeuralAudio) {
    try {
      activeNeuralAudio.pause();
      activeNeuralAudio.currentTime = 0;
      activeNeuralAudio = null;
    } catch {
      // ignore
    }
  }
}

/**
 * Memainkan audio neural berkualitas tinggi melalui endpoint /api/tts.
 * Menghasilkan suara manusia asli yang natural dan menghilangkan intonasi robotik.
 */
export function playNaturalNeuralAudio(
  text: string,
  lang: 'en' | 'id',
  options: SpeechOptions = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || typeof Audio === 'undefined') {
        return resolve(false);
      }
      stopVibeVoiceAudio();
      stopNeuralAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }

      const clean = text.replace(/[*#_~]/g, ' ').trim();
      if (!clean) return resolve(false);

      const url = `/api/tts?text=${encodeURIComponent(clean)}&lang=${lang}`;
      const audio = new Audio(url);
      activeNeuralAudio = audio;

      audio.onplay = () => {
        options.onStart?.();
      };

      audio.onended = () => {
        if (activeNeuralAudio === audio) activeNeuralAudio = null;
        options.onEnd?.();
        resolve(true);
      };

      audio.onerror = () => {
        if (activeNeuralAudio === audio) activeNeuralAudio = null;
        resolve(false);
      };

      audio.play().catch(() => {
        if (activeNeuralAudio === audio) activeNeuralAudio = null;
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

/**
 * Melakukan sintesis suara melalui Microsoft VibeVoice API endpoint.
 * Mendukung OpenAI-compatible /v1/audio/speech atau Hugging Face Inference Endpoint format.
 */
export async function synthesizeVibeVoiceAudio(
  text: string,
  options: SpeechOptions = {}
): Promise<boolean> {
  let prefs = null;
  try {
    prefs = getUserPreferences();
  } catch {
    return false;
  }

  if (!prefs || prefs.voiceEngine !== 'vibevoice' || !prefs.vibeVoiceEndpoint?.trim()) {
    return false;
  }

  try {
    options.onStart?.();

    let url = prefs.vibeVoiceEndpoint.trim();
    if (!url.includes('/audio/speech') && !url.includes('/models/')) {
      url = `${url.replace(/\/+$/, '')}/v1/audio/speech`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (prefs.vibeVoiceApiKey?.trim()) {
      headers['Authorization'] = `Bearer ${prefs.vibeVoiceApiKey.trim()}`;
    }

    const payload = {
      model: 'microsoft/VibeVoice-1.5B',
      input: text,
      voice:
        options.customVoiceName && options.customVoiceName !== 'auto'
          ? options.customVoiceName
          : options.preferredAccent === 'uk'
          ? 'british-coach'
          : options.preferredAccent === 'au'
          ? 'australian-coach'
          : 'american-tutor',
      response_format: 'mp3',
      speed: options.rate ?? 1.0,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn(`VibeVoice API returned status ${res.status}: falling back to browser TTS.`);
      return false;
    }

    const blob = await res.blob();
    if (typeof window === 'undefined') return true;
    const audioUrl = URL.createObjectURL(blob);

    stopVibeVoiceAudio();
    if (typeof Audio === 'undefined') return true;

    const audio = new Audio(audioUrl);
    activeVibeVoiceAudio = audio;

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        activeVibeVoiceAudio = null;
        options.onEnd?.();
        resolve(true);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        activeVibeVoiceAudio = null;
        options.onEnd?.();
        resolve(false);
      };
      audio.play().catch(() => {
        URL.revokeObjectURL(audioUrl);
        activeVibeVoiceAudio = null;
        resolve(false);
      });
    });
  } catch (err) {
    console.warn('VibeVoice API error:', err);
    return false;
  }
}

/**
 * Hentikan pemutaran audio yang sedang aktif.
 */
export function stopSpeech() {
  stopVibeVoiceAudio();
  stopNeuralAudio();
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
 * Bagian bahasa Indonesia diucapkan dengan suara id-ID alami (disesuaikan dengan preferensi user),
 * dan bagian bahasa Inggris diucapkan dengan suara en-US/UK/AU native (disesuaikan dengan preferensi user).
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

  let prefs = null;
  try {
    prefs = getUserPreferences();
  } catch {
    // ignore
  }

  const effectiveGender: 'male' | 'female' =
    options.gender ||
    (prefs
      ? prefs.voiceGender === 'auto'
        ? prefs.mascot === 'girl' || prefs.mascot === 'lily'
          ? 'female'
          : 'male'
        : prefs.voiceGender
      : 'male');

  const naturalPitch = options.pitch ?? (effectiveGender === 'male' ? 0.94 : 1.02);
  let started = false;

  segments.forEach((seg, index) => {
    const isFirst = index === 0;
    const isLast = index === segments.length - 1;

    const utterance = new SpeechSynthesisUtterance(seg.text);
    utterance.lang = seg.lang;
    utterance.rate = options.rate ?? (seg.lang === 'id-ID' ? 1.0 : 0.95);
    utterance.pitch = naturalPitch;

    if (seg.lang === 'id-ID') {
      const idVoice = getIndonesianVoice(options.customVoiceName, effectiveGender);
      if (idVoice) utterance.voice = idVoice;
    } else {
      const enVoice = getEnglishVoice(options.preferredAccent, options.customVoiceName, effectiveGender);
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
 * bahasa Indonesia atau aksen bahasa Inggris pilihan (US, UK, AU) yang sesuai dengan gender maskot.
 */
export function speakText(text: string, options: SpeechOptions = {}) {
  let prefs = null;
  try {
    prefs = getUserPreferences();
  } catch {
    // ignore
  }

  // 1. Jika mode VibeVoice aktif dan endpoint diisi, panggil VibeVoice / Hugging Face endpoint
  if (prefs?.voiceEngine === 'vibevoice' && prefs?.vibeVoiceEndpoint?.trim()) {
    synthesizeVibeVoiceAudio(text, options).then((success) => {
      if (!success) {
        _speakBrowserFallback(text, options);
      }
    });
    return;
  }

  // 2. Gunakan Cloud Neural Natural TTS (/api/tts) untuk suara manusia alami (bukan robot)
  const targetLang =
    options.lang === 'id-ID'
      ? 'id'
      : options.lang === 'en-US'
        ? 'en'
        : detectLanguage(text) === 'id'
          ? 'id'
          : 'en';

  playNaturalNeuralAudio(text, targetLang, options).then((success) => {
    if (!success) {
      // 3. Fallback ke sintesis browser lokal jika offline / network gagal
      _speakBrowserFallback(text, options);
    }
  });
}

function _speakBrowserFallback(text: string, options: SpeechOptions = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onStart) options.onStart();
    setTimeout(() => {
      if (options.onEnd) options.onEnd();
    }, 1000);
    return;
  }

  let prefs = null;
  try {
    prefs = getUserPreferences();
  } catch {
    // ignore
  }

  const effectiveGender: 'male' | 'female' =
    options.gender ||
    (prefs
      ? prefs.voiceGender === 'auto'
        ? prefs.mascot === 'girl' || prefs.mascot === 'lily'
          ? 'female'
          : 'male'
        : prefs.voiceGender
      : 'male');

  const naturalPitch = options.pitch ?? (effectiveGender === 'male' ? 0.94 : 1.02);

  // Jika bahasa ditentukan secara eksplisit
  if (options.lang === 'en-US' || options.lang === 'id-ID') {
    stopSpeech();
    const cleanText = text.replace(/[*#]/g, ' ').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.lang;
    utterance.rate = options.rate ?? (options.lang === 'id-ID' ? 1.0 : 0.95);
    utterance.pitch = naturalPitch;

    const voice =
      options.lang === 'id-ID'
        ? getIndonesianVoice(options.customVoiceName, effectiveGender)
        : getEnglishVoice(options.preferredAccent, options.customVoiceName, effectiveGender);
    if (voice) utterance.voice = voice;

    if (options.onStart) utterance.onstart = () => options.onStart?.();
    if (options.onEnd) {
      utterance.onend = () => options.onEnd?.();
      utterance.onerror = () => options.onEnd?.();
    }

    window.speechSynthesis.speak(utterance);
    return;
  }

  // Mode Auto: gunakan pembagian segmen bilingual adaptif
  speakBilingualText(text, { ...options, gender: effectiveGender });
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
  let prefs = null;
  try {
    prefs = getUserPreferences();
  } catch {
    // ignore
  }
  const gender: 'male' | 'female' = prefs
    ? prefs.voiceGender === 'auto'
      ? prefs.mascot === 'girl' || prefs.mascot === 'lily'
        ? 'female'
        : 'male'
      : prefs.voiceGender
    : 'male';
  const pitch = gender === 'male' ? 0.95 : 1.08;
  speakText(char, { lang: 'en-US', rate: 0.8, pitch, gender, onStart, onEnd });
}

/**
 * Mengucapkan teks dengan turtle mode (kecepatan lambat 0.65x untuk kejelasan artikulasi)
 */
export function speakTurtleMode(text: string, options: SpeechOptions = {}) {
  speakText(text, { rate: 0.65, ...options });
}
