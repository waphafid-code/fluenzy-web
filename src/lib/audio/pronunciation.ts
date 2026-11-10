// ============================================================================
// ELSA-STYLE PRONUNCIATION EVALUATION ENGINE (100% Client-Side & Free)
// ============================================================================

export interface WordScore {
  word: string;
  ipa: string;
  score: number; // 0 - 100
  status: 'green' | 'yellow' | 'red';
  feedback?: string;
  recognizedWord?: string;
}

export interface TemporalFluencyMetrics {
  durationSeconds: number;
  wordsPerMinute: number;
  cefrSpeedTier: 'A1 Target' | 'A2 Target' | 'B1 Target' | 'Too Slow' | 'Too Fast';
  paceFeedbackId: string;
}

export interface PronunciationResult {
  overallScore: number; // 0 - 100
  nativeCadenceTier: 'Native / Advanced' | 'Proficient' | 'Intermediate' | 'Needs Practice';
  fluencyScore: number;
  pronunciationScore: number;
  intonationScore: number;
  wordScores: WordScore[];
  generalFeedback: string;
  tips: string[];
  temporalMetrics?: TemporalFluencyMetrics;
}

// Kamus Fonetik IPA & Tips Pelafalan untuk Kosakata Bahasa Inggris Umum & Teknis
export const PHONETIC_DICTIONARY: Record<string, { ipa: string; tip?: string }> = {
  i: { ipa: '/aɪ/' },
  id: { ipa: '/aɪd/' },
  im: { ipa: '/aɪm/' },
  would: { ipa: '/wʊd/', tip: 'Huruf "l" tidak dibunyikan (silent l).' },
  like: { ipa: '/laɪk/', tip: 'Pastikan akhiran k dibunyikan ringan dan jelas.' },
  to: { ipa: '/tə/' },
  discuss: { ipa: '/dɪˈskʌs/', tip: 'Tekanan pada suku kata kedua: di-SKAS.' },
  the: { ipa: '/ðə/', tip: 'Letakkan ujung lidah di antara gigi untuk bunyi "th".' },
  next: { ipa: '/nekst/', tip: 'Jangan lewatkan bunyi konsonan ganda "kst" di akhir.' },
  steps: { ipa: '/steps/', tip: 'Bunyikan "p" dan "s" dengan tajam.' },
  could: { ipa: '/kʊd/', tip: 'Huruf "l" tidak dibunyikan.' },
  you: { ipa: '/juː/' },
  your: { ipa: '/jɔːr/' },
  please: { ipa: '/pliːz/', tip: 'Akhiran berbunyi "z", bukan "s".' },
  explain: { ipa: '/ɪkˈspleɪn/', tip: 'Tekanan pada suku kata kedua: ik-SPLEIN.' },
  trade: { ipa: '/treɪd/' },
  offs: { ipa: '/ɔːfs/' },
  of: { ipa: '/əv/', tip: 'Dibaca dengan bunyi "v" lembut.' },
  this: { ipa: '/ðɪs/', tip: 'Ujung lidah di antara gigi: /ðɪs/.' },
  approach: { ipa: '/əˈproʊtʃ/', tip: 'Tekanan pada "proach" dengan akhiran bunyi "ch".' },
  architecture: { ipa: '/ˈɑːrkɪtektʃər/', tip: 'Tekanan pada suku kata pertama: AR-ki-tek-cher.' },
  technical: { ipa: '/ˈteknɪkəl/', tip: 'Huruf "ch" dibaca "k": TEK-ni-kel.' },
  interview: { ipa: '/ˈɪntərvjuː/' },
  yesterday: { ipa: '/ˈjestərdeɪ/' },
  completed: { ipa: '/kəmˈpliːtɪd/', tip: 'Akhiran -ed dibaca "id": kem-PLI-tid.' },
  api: { ipa: '/ˌeɪ piː ˈaɪ/' },
  integration: { ipa: '/ˌɪntɪˈɡreɪʃən/', tip: 'Tekanan pada suku kata ketiga: in-ti-GREI-shun.' },
  and: { ipa: '/ænd/' },
  today: { ipa: '/təˈdeɪ/' },
  will: { ipa: '/wɪl/' },
  write: { ipa: '/raɪt/', tip: 'Huruf "w" tidak dibunyikan (silent w).' },
  unit: { ipa: '/ˈjuːnɪt/' },
  tests: { ipa: '/tests/', tip: 'Hati-hati dengan kombinasi akhiran "sts".' },
  schedule: { ipa: '/ˈskedʒuːl/', tip: 'Dalam aksen Amerika dibaca: SKE-jool.' },
  deploy: { ipa: '/dɪˈplɔɪ/', tip: 'Tekanan pada "ploy": di-PLOY.' },
  deployment: { ipa: '/dɪˈplɔɪmənt/' },
  performance: { ipa: '/pərˈfɔːrməns/', tip: 'Tekanan pada "for": per-FOR-mens.' },
  bottleneck: { ipa: '/ˈbɑːtlnek/', tip: 'Tekankan suku kata pertama: BOT-tle-neck.' },
  code: { ipa: '/koʊd/' },
  review: { ipa: '/rɪˈvjuː/', tip: 'Tekanan pada suku kata kedua: ri-VJU.' },
  pull: { ipa: '/pʊl/' },
  request: { ipa: '/rɪˈkwest/', tip: 'Tekanan pada suku kata kedua: ri-KWEST.' },
  meeting: { ipa: '/ˈmiːtɪŋ/' },
  really: { ipa: '/ˈriːəli/' },
  appreciate: { ipa: '/əˈpriːʃieɪt/', tip: 'Tekanan pada suku kata kedua: e-PRI-shi-eit.' },
  assistance: { ipa: '/əˈsɪstəns/' },
  with: { ipa: '/wɪð/', tip: 'Bunyi "th" bersuara di akhir kata.' },
  project: { ipa: '/ˈprɑːdʒekt/', tip: 'Sebagai kata benda, tekanan di awal: PRA-jekt.' },
  we: { ipa: '/wiː/' },
  detected: { ipa: '/dɪˈtektɪd/' },
  a: { ipa: '/ə/' },
  an: { ipa: '/ən/' },
  in: { ipa: '/ɪn/' },
  production: { ipa: '/prəˈdʌkʃən/', tip: 'Tekanan pada suku kata kedua: pro-DAK-shun.' },
  database: { ipa: '/ˈdeɪtəbeɪs/', tip: 'Tekanan di awal: DEY-te-beis.' },
  latency: { ipa: '/ˈleɪtənsi/' },
  throughput: { ipa: '/ˈθruːpʊt/', tip: 'Bunyikan "th" lembut: THROO-put.' },
  cloud: { ipa: '/klaʊd/' },
  scalable: { ipa: '/ˈskeɪləbəl/', tip: 'SKEY-le-bel.' },
  reliable: { ipa: '/rɪˈlaɪəbəl/' },
  efficient: { ipa: '/ɪˈfɪʃənt/', tip: 'e-FI-shent.' },
  optimize: { ipa: '/ˈɑːptɪmaɪz/', tip: 'OP-ti-maiz.' },
  solution: { ipa: '/səˈluːʃən/' },
  challenge: { ipa: '/ˈtʃælɪndʒ/' },
  feature: { ipa: '/ˈfiːtʃər/' },
  system: { ipa: '/ˈsɪstəm/' },
  collaborate: { ipa: '/kəˈlæbəreɪt/', tip: 'ko-LA-bo-reit.' },
  feedback: { ipa: '/ˈfiːdbæk/' },
  important: { ipa: '/ɪmˈpɔːrtənt/' },
  priority: { ipa: '/praɪˈɔːrəti/', tip: 'Tekanan pada "or": prai-OR-i-ti.' },
  security: { ipa: '/sɪˈkjʊrəti/' },
  service: { ipa: '/ˈsɜːrvɪs/' },
  frontend: { ipa: '/ˈfrʌntend/' },
  backend: { ipa: '/ˈbækend/' },
  asynchronous: { ipa: '/eɪˈsɪŋkrənəs/', tip: 'ei-SING-kro-nes.' },
  framework: { ipa: '/ˈfreɪmwɜːrk/' },
  clarify: { ipa: '/ˈklærəfaɪ/' },
  recommend: { ipa: '/ˌrekəˈmend/', tip: 'Tekanan di akhir: re-ke-MEND.' },
  propose: { ipa: '/prəˈpoʊz/' },
  implement: { ipa: '/ˈɪmplɪment/', tip: 'IM-pli-ment.' },
  // Everyday & Conversational Vocabulary for A1-B1 Scenarios
  hi: { ipa: '/haɪ/' },
  my: { ipa: '/maɪ/' },
  name: { ipa: '/neɪm/' },
  is: { ipa: '/ɪz/', tip: 'Akhiran berbunyi "z" lembut.' },
  learning: { ipa: '/ˈlɜːrnɪŋ/', tip: 'Vokal panjang rileks: LER-ning.' },
  english: { ipa: '/ˈɪŋɡlɪʃ/', tip: 'Akhiran desis lembut /ʃ/.' },
  can: { ipa: '/kæn/' },
  have: { ipa: '/hæv/', tip: 'Akhiran bunyi "v" lembut dengan gigi atas menyentuh bibir bawah.' },
  iced: { ipa: '/aɪst/' },
  latte: { ipa: '/ˈlɑːteɪ/' },
  excuse: { ipa: '/ɪkˈskjuːz/', tip: 'Tekanan pada suku kata kedua: ik-SKJUZ.' },
  me: { ipa: '/miː/' },
  where: { ipa: '/wer/' },
  nearest: { ipa: '/ˈnɪrɪst/' },
  station: { ipa: '/ˈsteɪʃən/', tip: 'STEI-shun.' },
  work: { ipa: '/wɜːrk/', tip: 'Jangan tertukar dengan "walk". Vokal tengah: WERK.' },
  as: { ipa: '/æz/' },
  developer: { ipa: '/dɪˈveləpər/', tip: 'Tekanan pada "vel": di-VEL-e-per.' },
  jakarta: { ipa: '/dʒəˈkɑːrtə/' },
  good: { ipa: '/ɡʊd/' },
  morning: { ipa: '/ˈmɔːrnɪŋ/' },
  professor: { ipa: '/prəˈfesər/', tip: 'Tekanan pada "fes": pro-FES-er.' },
  thank: { ipa: '/θæŋk/', tip: 'Bunyi /θ/, gigit ujung lidah sedikit, jangan dibaca "tenk".' },
  for: { ipa: '/fɔːr/' },
  time: { ipa: '/taɪm/' },
  reservation: { ipa: '/ˌrezərˈveɪʃən/', tip: 'Tekanan pada suku kata ketiga: rez-er-VEI-shun.' },
  under: { ipa: '/ˈʌndər/' },
  two: { ipa: '/tuː/' },
  nights: { ipa: '/naɪts/' },
  deadline: { ipa: '/ˈdedlaɪn/' },
  assignment: { ipa: '/əˈsaɪnmənt/', tip: 'Huruf "g" tidak dibaca: e-SAIN-ment.' },
  on: { ipa: '/ɑːn/' },
  weekends: { ipa: '/ˈwiːkendz/' },
  usually: { ipa: '/ˈjuːʒuəli/', tip: 'Bunyi /ʒ/ bergetar lembut: YU-zhoo-e-li.' },
  enjoy: { ipa: '/ɪnˈdʒɔɪ/' },
  playing: { ipa: '/ˈpleɪɪŋ/' },
  music: { ipa: '/ˈmjuːzɪk/' },
  watching: { ipa: '/ˈwɑːtʃɪŋ/' },
  movies: { ipa: '/ˈmuːviz/' },
  based: { ipa: '/beɪst/' },
  our: { ipa: '/ˈaʊər/' },
  empirical: { ipa: '/ɪmˈpɪrɪkəl/', tip: 'im-PIR-i-kel.' },
  results: { ipa: '/rɪˈzʌlts/' },
  speech: { ipa: '/spiːtʃ/' },
  recognition: { ipa: '/ˌrekəɡˈnɪʃən/', tip: 're-keg-NI-shun.' },
  accuracy: { ipa: '/ˈækjərəsi/', tip: 'AK-ye-re-si.' },
  improved: { ipa: '/ɪmˈpruːvd/' },
  significantly: { ipa: '/sɪɡˈnɪfɪkəntli/', tip: 'sig-NIF-i-kent-li.' },
  baggage: { ipa: '/ˈbæɡɪdʒ/' },
  seems: { ipa: '/siːmz/' },
  delayed: { ipa: '/dɪˈleɪd/' },
  need: { ipa: '/niːd/' },
  filing: { ipa: '/ˈfaɪlɪŋ/' },
  report: { ipa: '/rɪˈpɔːrt/' },
  see: { ipa: '/siː/' },
  point: { ipa: '/pɔɪnt/' },
  but: { ipa: '/bʌt/' },
  might: { ipa: '/maɪt/' },
  want: { ipa: '/wɑːnt/' },
  consider: { ipa: '/kənˈsɪdər/', tip: 'ken-SID-er.' },
  alternative: { ipa: '/ɔːlˈtɜːrnətɪv/' },
  options: { ipa: '/ˈɑːpʃənz/' },
  before: { ipa: '/bɪˈfɔːr/' },
  deciding: { ipa: '/dɪˈsaɪdɪŋ/' },
};

export function getPhoneticRepresentation(word: string): string {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (PHONETIC_DICTIONARY[clean]) {
    return PHONETIC_DICTIONARY[clean].ipa;
  }
  // Fallback sederhana berbasis aturan ortografi
  return `/${clean}/`;
}

/**
 * Menghitung Levenshtein Distance (jarak edit) antara dua string
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Menghitung kemiripan persentase antara dua kata (0 - 100)
 */
function wordSimilarity(target: string, spoken: string): number {
  const cleanTarget = target.toLowerCase().replace(/[^a-z]/g, '');
  const cleanSpoken = spoken.toLowerCase().replace(/[^a-z]/g, '');

  if (cleanTarget === cleanSpoken) return 100;
  if (!cleanTarget || !cleanSpoken) return 0;

  const maxLen = Math.max(cleanTarget.length, cleanSpoken.length);
  const dist = calculateLevenshteinDistance(cleanTarget, cleanSpoken);
  const similarity = Math.max(0, 1 - dist / maxLen);

  return Math.round(similarity * 100);
}

/**
 * Evaluasi Pengucapan Tingkat Kata, Kalimat, & Kelancaran Temporal (WPM)
 */
export function evaluatePronunciation(
  targetSentence: string,
  spokenSentence: string,
  durationSeconds?: number
): PronunciationResult {
  const targetWords = targetSentence.trim().split(/\s+/);
  const spokenWords = spokenSentence.trim().split(/\s+/);

  const wordScores: WordScore[] = [];
  let totalWordScore = 0;

  // Alignment kata demi kata dengan sliding window
  for (let i = 0; i < targetWords.length; i++) {
    const targetWord = targetWords[i];
    const cleanTarget = targetWord.toLowerCase().replace(/[^a-z]/g, '');
    const ipa = getPhoneticRepresentation(cleanTarget);
    const tip = PHONETIC_DICTIONARY[cleanTarget]?.tip;

    // Cari kecocokan terbaik di sekitar indeks yang sama (window +- 2 kata)
    let bestScore = 0;
    let matchedWord = '';

    const startIdx = Math.max(0, i - 2);
    const endIdx = Math.min(spokenWords.length, i + 3);

    for (let j = startIdx; j < endIdx; j++) {
      if (spokenWords[j]) {
        const score = wordSimilarity(cleanTarget, spokenWords[j]);
        if (score > bestScore) {
          bestScore = score;
          matchedWord = spokenWords[j];
        }
      }
    }

    // Jika kata diucapkan tepat persis
    if (cleanTarget === matchedWord.toLowerCase().replace(/[^a-z]/g, '')) {
      bestScore = 100;
    }

    // Tentukan status ELSA Speak: Green (>=80), Yellow (60-79), Red (<60)
    let status: 'green' | 'yellow' | 'red' = 'green';
    if (bestScore < 60) {
      status = 'red';
    } else if (bestScore < 80) {
      status = 'yellow';
    }

    wordScores.push({
      word: targetWord,
      ipa,
      score: bestScore,
      status,
      feedback: tip,
      recognizedWord: matchedWord || undefined,
    });

    totalWordScore += bestScore;
  }

  const avgPronunciation = Math.round(totalWordScore / Math.max(1, targetWords.length));

  // Hitung Fluency & Intonasi berbasis distribusi Green, Yellow, dan Red
  const greenCount = wordScores.filter((w) => w.status === 'green').length;
  const yellowCount = wordScores.filter((w) => w.status === 'yellow').length;
  const redCount = wordScores.filter((w) => w.status === 'red').length;

  const rawAccuracyFluency = Math.round(
    ((greenCount * 1.0 + yellowCount * 0.55 + redCount * 0.1) / Math.max(1, targetWords.length)) * 100
  );

  let temporalMetrics: TemporalFluencyMetrics | undefined;
  let fluencyScore = rawAccuracyFluency;

  // Analisis Temporal Fluency (WPM / Words Per Minute)
  if (typeof durationSeconds === 'number' && durationSeconds > 0) {
    const duration = Math.max(0.5, durationSeconds);
    const spokenWordCount = spokenWords.filter(Boolean).length;
    const wpm = Math.round((spokenWordCount / duration) * 60);

    let cefrSpeedTier: TemporalFluencyMetrics['cefrSpeedTier'] = 'A2 Target';
    let paceFeedbackId = 'Tempo wajar dan stabil.';

    if (wpm < 45) {
      cefrSpeedTier = 'Too Slow';
      paceFeedbackId = 'Tempo bicara agak lambat (<45 WPM). Kurangi jeda hening antar kata untuk meningkatkan kelancaran.';
    } else if (wpm <= 70) {
      cefrSpeedTier = 'A1 Target';
      paceFeedbackId = 'Tempo cermat dan santai (50-70 WPM), sangat cocok untuk fondasi pemula (CEFR A1).';
    } else if (wpm <= 95) {
      cefrSpeedTier = 'A2 Target';
      paceFeedbackId = 'Tempo percakapan natural (75-95 WPM), ideal untuk kemandirian dasar (CEFR A2).';
    } else if (wpm <= 135) {
      cefrSpeedTier = 'B1 Target';
      paceFeedbackId = 'Tempo lancar dan dinamis (95-135 WPM), mendekati kecepatan penutur menengah (CEFR B1).';
    } else {
      cefrSpeedTier = 'Too Fast';
      paceFeedbackId = 'Tempo bicara agak terburu-buru (>135 WPM). Berikan artikulasi yang lebih jelas pada konsonan akhir.';
    }

    let speedScore = 100;
    if (wpm < 30) speedScore = 45;
    else if (wpm < 45) speedScore = 65;
    else if (wpm < 60) speedScore = 80;
    else if (wpm <= 125) speedScore = 100;
    else if (wpm <= 150) speedScore = 85;
    else speedScore = 65;

    // Bobot komposit kelancaran: 65% akurasi leksikal + 35% tempo artikulasi
    fluencyScore = Math.round(rawAccuracyFluency * 0.65 + speedScore * 0.35);

    temporalMetrics = {
      durationSeconds: Number(duration.toFixed(1)),
      wordsPerMinute: wpm,
      cefrSpeedTier,
      paceFeedbackId,
    };
  }

  const intonationScore = Math.round(avgPronunciation * 0.75 + fluencyScore * 0.25);

  // Skor Gabungan Keseluruhan (ELSA Weighted Composite)
  const overallScore = Math.round(
    avgPronunciation * 0.5 + fluencyScore * 0.35 + intonationScore * 0.15
  );

  let nativeCadenceTier: PronunciationResult['nativeCadenceTier'] = 'Needs Practice';
  if (overallScore >= 85) {
    nativeCadenceTier = 'Native / Advanced';
  } else if (overallScore >= 75) {
    nativeCadenceTier = 'Proficient';
  } else if (overallScore >= 60) {
    nativeCadenceTier = 'Intermediate';
  }

  // Rekomendasi Tips Diagnostik
  const tips: string[] = [];
  if (temporalMetrics) {
    tips.push(`Tempo Bicara: ${temporalMetrics.wordsPerMinute} WPM (${temporalMetrics.paceFeedbackId})`);
  }

  const yellowOrRed = wordScores.filter((w) => w.status !== 'green');

  if (yellowOrRed.length === 0) {
    tips.push('Luar biasa! Pengucapan, intonasi, dan artikulasi fonem Anda mendekati penutur asli.');
  } else {
    yellowOrRed.forEach((w) => {
      if (w.feedback) {
        tips.push(`Kata "${w.word}": ${w.feedback}`);
      } else {
        tips.push(`Kata "${w.word}": Cermati pelafalan fonem ${w.ipa}.`);
      }
    });
  }

  return {
    overallScore,
    nativeCadenceTier,
    fluencyScore,
    pronunciationScore: avgPronunciation,
    intonationScore,
    wordScores,
    generalFeedback:
      overallScore >= 85
        ? 'Artikulasi dan ritme kalimat Anda sangat natural!'
        : overallScore >= 70
        ? 'Bagus sekali! Cermati kata-kata bergaris kuning dan merah untuk penyempurnaan aksen.'
        : 'Terus berlatih! Dengarkan versi Turtle Mode (0.65x) untuk mendengarkan setiap bunyi fonem.',
    tips: tips.slice(0, 4),
    temporalMetrics,
  };
}

// -----------------------------------------------------------------------------
// DETEKSI SUB-FONEM KRITIS PEMBELAJAR BAHASA INDONESIA
// -----------------------------------------------------------------------------

export interface PhonemeIssue {
  targetWord: string;
  recognizedWord: string;
  expectedPhoneme: string;
  detectedPhoneme: string;
  description: string;
  pedagogicalTip: string;
}

export function detectCriticalPhonemeIssues(
  targetText: string,
  recognizedText: string
): PhonemeIssue[] {
  const targetWords = targetText.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/);
  const recognizedWords = recognizedText.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/);
  const issues: PhonemeIssue[] = [];

  for (let i = 0; i < targetWords.length; i++) {
    const t = targetWords[i];
    const r = recognizedWords[i] || '';
    if (!t || !r || t === r) continue;

    // 1. Voiceless dental fricative /θ/ -> /s/ or /t/ (think -> sink, throughput -> sroughput)
    if (t.includes('th') && (r.startsWith('s') || r.startsWith('t'))) {
      issues.push({
        targetWord: t,
        recognizedWord: r,
        expectedPhoneme: '/θ/',
        detectedPhoneme: r.startsWith('s') ? '/s/' : '/t/',
        description: `Substitusi konsonan geser gigi /θ/ menjadi /${r[0]}/`,
        pedagogicalTip: 'Posisikan ujung lidah sedikit di antara gigi seri atas dan bawah saat menghembuskan udara tanpa getaran pita suara.',
      });
    }
    // 2. Voiced dental fricative /ð/ -> /d/ (this -> dis, the -> de, with -> wid)
    else if ((t === 'this' || t === 'the' || t === 'that' || t === 'with') && (r.startsWith('d') || r.endsWith('d'))) {
      issues.push({
        targetWord: t,
        recognizedWord: r,
        expectedPhoneme: '/ð/',
        detectedPhoneme: '/d/',
        description: 'Substitusi konsonan dental bersuara /ð/ menjadi letupan /d/',
        pedagogicalTip: 'Getarkan pita suara sambil menaruh lidah menyentuh tepi gigi seri atas, jangan ditarik ke langit-langit mulut.',
      });
    }
    // 3. Labiodental fricative /v/ -> /f/ (very -> fery)
    else if (t.includes('v') && r.includes('f')) {
      issues.push({
        targetWord: t,
        recognizedWord: r,
        expectedPhoneme: '/v/',
        detectedPhoneme: '/f/',
        description: 'Pelemahan getaran suara labiodental /v/ menjadi tak-bersuara /f/',
        pedagogicalTip: 'Sentuhkan gigi atas ke bibir bawah sambil menyuarakan getaran vokal (voiced).',
      });
    }
  }

  return issues;
}

// -----------------------------------------------------------------------------
// PANDUAN TEKANAN SUKU KATA (SYLLABLE STRESS & PROSODY TIMING)
// -----------------------------------------------------------------------------

export interface SyllableStressGuide {
  word: string;
  syllables: string; // e.g. "AR-ki-tek-cher"
  stressedIndex: number; // 0-based index suku kata yang ditekan
  stressedSyllable: string; // e.g. "AR"
  prosodyTip: string;
}

export const SYLLABLE_STRESS_MAP: Record<string, Omit<SyllableStressGuide, 'word'>> = {
  architecture: {
    syllables: 'AR-ki-tek-cher',
    stressedIndex: 0,
    stressedSyllable: 'AR',
    prosodyTip: 'Tekankan suku kata pertama lebih panjang dan lebih tinggi nada suaranya.',
  },
  discuss: {
    syllables: 'di-SKAS',
    stressedIndex: 1,
    stressedSyllable: 'SKAS',
    prosodyTip: 'Suku kata "di" diucapkan singkat dan ringan; hentakkan suara pada "SKAS".',
  },
  production: {
    syllables: 'pro-DAK-shun',
    stressedIndex: 1,
    stressedSyllable: 'DAK',
    prosodyTip: 'Tekanan utama pada suku kata tengah "DAK".',
  },
  schedule: {
    syllables: 'SKE-jool',
    stressedIndex: 0,
    stressedSyllable: 'SKE',
    prosodyTip: 'Dalam aksen General American, tekanan berada di suku kata pembuka "SKE".',
  },
  development: {
    syllables: 'di-VE-lep-ment',
    stressedIndex: 1,
    stressedSyllable: 'VE',
    prosodyTip: 'Hentakkan vokal pada "VE", jangan menekan suku kata "op" atau "ment".',
  },
  performance: {
    syllables: 'per-FOR-mens',
    stressedIndex: 1,
    stressedSyllable: 'FOR',
    prosodyTip: 'Tekankan suku kata kedua "FOR".',
  },
  efficient: {
    syllables: 'e-FI-shent',
    stressedIndex: 1,
    stressedSyllable: 'FI',
    prosodyTip: 'Suku kata "FI" diucapkan lebih bervolume dan tegas.',
  },
  technology: {
    syllables: 'tek-NOL-e-ji',
    stressedIndex: 1,
    stressedSyllable: 'NOL',
    prosodyTip: 'Aksen jatuh pada suku kata kedua "NOL" (/ˈnɑː.lə.dʒi/).',
  },
  photography: {
    syllables: 'fe-TOG-re-fi',
    stressedIndex: 1,
    stressedSyllable: 'TOG',
    prosodyTip: 'Berbeda dengan PHO-to-graph, kata pho-TOG-ra-phy menekan suku kata kedua.',
  },
  comfortable: {
    syllables: 'KUMF-ter-bl',
    stressedIndex: 0,
    stressedSyllable: 'KUMF',
    prosodyTip: 'Bahasa Inggris melafalkan 3 suku kata terkompresi dengan hentakan di awal.',
  },
  appreciate: {
    syllables: 'e-PRI-shi-eit',
    stressedIndex: 1,
    stressedSyllable: 'PRI',
    prosodyTip: 'Tekankan suku kata kedua "PRI" (/əˈpriː.ʃi.eɪt/).',
  },
  database: {
    syllables: 'DEY-te-beis',
    stressedIndex: 0,
    stressedSyllable: 'DEY',
    prosodyTip: 'Tekanan primer di awal pada "DEY" (/ˈdeɪ.tə.beɪs/).',
  },
  bottleneck: {
    syllables: 'BOT-tle-neck',
    stressedIndex: 0,
    stressedSyllable: 'BOT',
    prosodyTip: 'Kata majemuk bahasa Inggris umumnya menekan elemen pertama "BOT".',
  },
  yesterday: {
    syllables: 'YES-ter-dey',
    stressedIndex: 0,
    stressedSyllable: 'YES',
    prosodyTip: 'Tekanan kuat pada suku kata pertama "YES".',
  },
  integration: {
    syllables: 'in-ti-GREY-shun',
    stressedIndex: 2,
    stressedSyllable: 'GREY',
    prosodyTip: 'Suku kata berakhiran -tion selalu menerima tekanan pada suku kata persis sebelumnya.',
  },
  deployment: {
    syllables: 'di-PLOY-ment',
    stressedIndex: 1,
    stressedSyllable: 'PLOY',
    prosodyTip: 'Hentakkan tekanan pada diftong "PLOY".',
  },
};

/**
 * Mengambil panduan prosodi & tekanan suku kata untuk sebuah kata
 */
export function getWordStressGuidance(word: string): SyllableStressGuide | null {
  if (!word) return null;
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  const data = SYLLABLE_STRESS_MAP[clean];
  if (!data) return null;
  return {
    word: clean,
    ...data,
  };
}

