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

export interface PronunciationResult {
  overallScore: number; // 0 - 100
  nativeCadenceTier: 'Native / Advanced' | 'Proficient' | 'Intermediate' | 'Needs Practice';
  fluencyScore: number;
  pronunciationScore: number;
  intonationScore: number;
  wordScores: WordScore[];
  generalFeedback: string;
  tips: string[];
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
 * Evaluasi Pengucapan Tingkat Kata & Kalimat Bergaya ELSA Speak
 */
export function evaluatePronunciation(targetSentence: string, spokenSentence: string): PronunciationResult {
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

  const fluencyScore = Math.round(
    ((greenCount * 1.0 + yellowCount * 0.55 + redCount * 0.1) / Math.max(1, targetWords.length)) * 100
  );
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
  };
}
