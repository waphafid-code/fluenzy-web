import { UserLearningGoal, UserProficiencyTier } from '@/lib/core/preferences';
import { PronunciationResult, WordScore, PHONETIC_DICTIONARY } from './pronunciation';

export interface EmpatheticCoachingFeedback {
  score: number;
  tier: UserProficiencyTier;
  goal: UserLearningGoal;
  statusBadge: string;
  appreciation: string;        // 1. Apresiasi & Validasi hangat
  mouthPositionTips: string[];  // 2. Bimbingan fisik posisi lidah/bibir tanpa jargon linguistik
  sandwichSummary: string;     // Rasio dwibahasa
  nextTryChallenge: string;    // 3. Tantangan pengulangan yang menyenangkan
  detectedCriticalSounds: string[];
}

/**
 * Pemetaan kendala artikulasi penutur Indonesia ke instruksi fisik lidah & bibir yang ramah.
 * ZERO JARGON: Tidak menggunakan istilah "voiceless velar plosive" atau "dental fricative".
 */
const ARTICULATION_GUIDANCE_MAP: Record<string, { sound: string; advice: string }> = {
  th_soft: {
    sound: '/θ/ (th lembut)',
    advice: 'Ujung lidah digigit sedikit di antara gigi atas dan bawah, lalu hembuskan udara lembut tanpa getaran tenggorokan (seperti meniup tipis).',
  },
  th_hard: {
    sound: '/ð/ (th bersuara)',
    advice: 'Sentuhkan ujung lidah ke tepi gigi seri atas sambil membunyikan getaran suara dari tenggorokan (seperti suara lebah lembut).',
  },
  v_sound: {
    sound: '/v/ (gigi ke bibir)',
    advice: 'Sentuhkan gigi seri atas ke bibir bawah dengan lembut sambil menggetarkan suara, jangan sampai tertukar dengan bunyi "f" atau "p".',
  },
  final_cluster: {
    sound: 'Konsonan Akhiran Jamak (-sts / -ks)',
    advice: 'Tahan nafas sepersekian detik dan biarkan desis akhiran terdengar tuntas, jangan terburu-buru memotong kata sebelum selesai.',
  },
  silent_letter: {
    sound: 'Huruf Bisu (Silent Letter)',
    advice: 'Huruf ini hanya ditulis tetapi lidah tidak menyuarakannya sama sekali, lewati saja bunyi huruf tersebut agar terdengar alami.',
  },
  long_vowel: {
    sound: 'Vokal Panjang (/iː/ atau /ɜː/)',
    advice: 'Tarik sudut bibir sedikit melebar dan tahan bunyinya sekitar 0.5 detik lebih lama daripada vokal bahasa Indonesia biasa.',
  },
};

/**
 * Menghasilkan umpan balik pedagogis yang empatik, terstruktur, dan disesuaikan dengan tingkat kemahiran pengguna.
 */
export function generateEmpatheticFeedback(options: {
  result: PronunciationResult;
  tier: UserProficiencyTier;
  goal: UserLearningGoal;
  targetSentence: string;
  spokenText?: string;
}): EmpatheticCoachingFeedback {
  const { result, tier, goal, targetSentence, spokenText = '' } = options;
  const score = result.overallScore;

  // 1. Status Badge & Rasio Sandwich
  let statusBadge = 'Perlu Dipoles';
  if (score >= 85) statusBadge = 'Sangat Alami (Native Level) 👑';
  else if (score >= 75) statusBadge = 'Bagus & Percaya Diri 🌟';
  else if (score >= 60) statusBadge = 'Langkah Bagus (Sedang Belajar) 🚀';

  const sandwichSummary =
    tier === 'A1'
      ? 'Tier A1 • 70% Bimbingan Bahasa Indonesia (Fokus Berani Bicara)'
      : tier === 'A2'
      ? 'Tier A2 • 45% Bimbingan Bahasa Indonesia (Fokus Pola & Kelancaran)'
      : 'Tier B1 • 20% Bimbingan Bahasa Indonesia (Fokus Nuansa Diplomatis)';

  // 2. Kalimat Apresiasi Hangat (Bilingual Sandwich: Roti Atas)
  let appreciation = '';
  if (tier === 'A1') {
    if (score >= 80) {
      appreciation = 'Keren banget! Suaramu terdengar lantang dan jelas. Ini awal yang sangat baik untuk membangun rasa percaya diri!';
    } else if (score >= 60) {
      appreciation = 'Bagus sekali! Kamu sudah berani membuka mulut dan melafalkan kalimat ini. Terus pertahankan keberanianmu!';
    } else {
      appreciation = 'Tidak apa-apa, santai saja! Di Fluenzy kamu bebas mencoba berkali-kali tanpa takut salah. Yuk pelan-pelan kita asah!';
    }
  } else if (tier === 'A2') {
    if (score >= 80) {
      appreciation = 'Mantap jiwa! Ritme kalimatmu mengalir lancar dan pesan utamanya langsung tersampaikan dengan jelas.';
    } else if (score >= 60) {
      appreciation = 'Usaha yang sangat bagus! Susunan kalimat dan intonasimu sudah tepat, tinggal beberapa detail bunyi yang perlu dirapikan.';
    } else {
      appreciation = 'Langkah yang baik! Kalimat sepanjang ini memang butuh pembiasaan otot bibir dan lidah. Jangan menyerah ya!';
    }
  } else {
    // Tier B1
    if (score >= 80) {
      appreciation = 'Excellent articulation! Your cadence and professional nuance are spot-on for workplace discussions.';
    } else if (score >= 60) {
      appreciation = 'Very strong effort! Your sentence flow is convincing, just a few connected speech subtleties to refine.';
    } else {
      appreciation = 'Good attempt on complex technical phrasing. Let us break down the intonation peaks together.';
    }
  }

  // 3. Analisis Fisik Posisi Mulut & Fonem Kritis (Isi Daging Sandwich)
  const mouthPositionTips: string[] = [];
  const detectedCriticalSounds: string[] = [];
  const yellowOrRedWords = result.wordScores.filter((w) => w.status !== 'green');

  for (const wordScore of yellowOrRedWords) {
    const cleanWord = wordScore.word.toLowerCase().replace(/[^a-z]/g, '');
    const dictEntry = PHONETIC_DICTIONARY[cleanWord];

    // Deteksi TH lembut (/θ/)
    if (['thank', 'think', 'three', 'thesis', 'methodology'].includes(cleanWord)) {
      if (!detectedCriticalSounds.includes('/θ/')) {
        detectedCriticalSounds.push('/θ/');
        mouthPositionTips.push(
          `Kata "${wordScore.word}": ${ARTICULATION_GUIDANCE_MAP.th_soft.advice}`
        );
      }
    }
    // Deteksi TH bersuara (/ð/)
    else if (['the', 'this', 'that', 'they', 'with', 'weather'].includes(cleanWord)) {
      if (!detectedCriticalSounds.includes('/ð/')) {
        detectedCriticalSounds.push('/ð/');
        mouthPositionTips.push(
          `Kata "${wordScore.word}": ${ARTICULATION_GUIDANCE_MAP.th_hard.advice}`
        );
      }
    }
    // Deteksi V (/v/)
    else if (['have', 'reservation', 'developer', 'evaluate', 'environment'].includes(cleanWord)) {
      if (!detectedCriticalSounds.includes('/v/')) {
        detectedCriticalSounds.push('/v/');
        mouthPositionTips.push(
          `Kata "${wordScore.word}": ${ARTICULATION_GUIDANCE_MAP.v_sound.advice}`
        );
      }
    }
    // Deteksi silent letter
    else if (['could', 'would', 'walk', 'talk', 'doubt', 'listen'].includes(cleanWord)) {
      if (!detectedCriticalSounds.includes('Silent Letter')) {
        detectedCriticalSounds.push('Silent Letter');
        mouthPositionTips.push(
          `Kata "${wordScore.word}": ${dictEntry?.tip || ARTICULATION_GUIDANCE_MAP.silent_letter.advice}`
        );
      }
    }
    // Deteksi konsonan cluster
    else if (cleanWord.endsWith('sts') || cleanWord.endsWith('xt') || cleanWord.endsWith('ed')) {
      if (!detectedCriticalSounds.includes('Consonant Cluster')) {
        detectedCriticalSounds.push('Consonant Cluster');
        mouthPositionTips.push(
          `Kata "${wordScore.word}": ${dictEntry?.tip || ARTICULATION_GUIDANCE_MAP.final_cluster.advice}`
        );
      }
    } else if (dictEntry?.tip) {
      mouthPositionTips.push(`Kata "${wordScore.word}": ${dictEntry.tip}`);
    }
  }

  // Jika semua kata hijau (sempurna)
  if (mouthPositionTips.length === 0) {
    mouthPositionTips.push(
      'Seluruh fonem dan penekanan kata dilafalkan dengan posisi lidah yang sangat presisi. Ritmemu sudah menyerupai penutur asli!'
    );
  }

  // 4. Tantangan Mencoba Ulang yang Menyenangkan (Roti Bawah Sandwich)
  let nextTryChallenge = '';
  if (score >= 85) {
    nextTryChallenge =
      'Tantangan Lanjutan: Coba ucapkan kalimat ini dengan kecepatan natural (1.0x) tanpa melihat teks sama sekali!';
  } else if (score >= 65) {
    nextTryChallenge =
      'Tantangan Cepat: Dengarkan tombol "0.65x Slow" satu kali, fokus ke kata bergaris kuning, lalu ketuk tombol mic untuk rekam ulang!';
  } else {
    nextTryChallenge =
      'Yuk coba ketuk tiap huruf pada kata berwarna merah untuk mendengarkan bunyinya satu per satu, baru rekam kembali!';
  }

  return {
    score,
    tier,
    goal,
    statusBadge,
    appreciation,
    mouthPositionTips: mouthPositionTips.slice(0, 3),
    sandwichSummary,
    nextTryChallenge,
    detectedCriticalSounds,
  };
}

/**
 * Membangun System Prompt AI Coach untuk integrasi Groq / Gemini dengan batasan dwibahasa yang ketat.
 */
export function buildEmpatheticCoachSystemPrompt(
  tier: UserProficiencyTier,
  goal: UserLearningGoal,
  coachName: string = 'Fluenzy AI Voice'
): string {
  const ratioDescription =
    tier === 'A1'
      ? '70% Indonesian (warm, casual, encouraging guidance) and 30% English (target words and authentic native model)'
      : tier === 'A2'
      ? '45% Indonesian (practical contextual explanations) and 55% English (functional phrases)'
      : '20% Indonesian (specific term nuances) and 80% English (professional workplace discourse)';

  return `You are "${coachName}", an empathetic, supportive, and zero-jargon English pronunciation coach designed specifically for Indonesian learners.
Your mission is to eliminate speaking anxiety and build genuine conversational confidence.

LEARNER PROFILE:
- Proficiency Tier: CEFR ${tier}
- Primary Learning Goal: ${goal.toUpperCase()}
- Language Policy: Bilingual Sandwich Method with ${ratioDescription}.

STRICT PEDAGOGICAL RULES (ZERO JARGON):
1. NEVER use abstract linguistic terminology such as "voiceless dental fricative", "alveolar ridge", or "velar plosive".
2. ALWAYS provide practical, tactile anatomical guidance in warm Indonesian:
   - For /θ/ (e.g. "thank"): "Gigit sedikit ujung lidah di antara gigi atas dan bawah..."
   - For /ð/ (e.g. "this", "the"): "Tempelkan lidah ke gigi atas sambil membunyikan getaran..."
   - For /v/ (e.g. "have", "reservation"): "Sentuhkan gigi atas ke bibir bawah..."
   - For silent letters (e.g. "could", "walk"): "Huruf ini bisu, lewati saja bunyinya..."
3. TONE & ATTITUDE:
   - Like a friendly, encouraging senior colleague or peer mentor.
   - Never scold, punish, or sound robotic. Always praise effort before offering a tip.
4. RESPONSE STRUCTURE (3-Part Sandwich):
   - Part 1: Warm praise & appreciation.
   - Part 2: Concrete mouth/tongue positioning tip for the struggling word.
   - Part 3: A fun, low-friction challenge to try once more.
`;
}

