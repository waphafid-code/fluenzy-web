/**
 * MINIMAL_PAIRS.TS - Bank Pasangan Minimal (Minimal Pairs) Pemutus Interferensi L1 Indonesia
 *
 * DASAR METODOLOGI LINGUISTIK:
 * 1. Minimal Pairs Technique (A.C. Gimson, 1980; Marianne Celce-Murcia, 2010):
 *    Metode fonologi terapan paling efektif untuk melatih diskriminasi auditori dan artikulasi motorik.
 *    Dua kata yang identik kecuali pada satu fonem kontras (/θ/ vs /t/, /v/ vs /f/, /iː/ vs /ɪ/).
 * 2. Mengatasi 6 Interferensi Fonologis Penutur L1 Indonesia:
 *    - /θ/ vs /t/ : think vs tink, three vs tree, thanks vs tanks
 *    - /v/ vs /f/ : van vs fan, very vs ferry, vote vs boat
 *    - /iː/ vs /ɪ/ : sheep vs ship, leave vs live, feel vs fill
 *    - /ð/ vs /d/ : they vs day, then vs den, breathe vs breed
 *    - Consonant Clusters: ask vs as, desk vs des, strict vs street
 *    - Silent Letters: doubt vs dot, subtle vs shuttle, comb vs cone
 */

export interface MinimalPairWord {
  word: string;
  ipa: string;
  meaningId: string;
  articulatoryTipId: string;
  sampleSentence: string;
}

export interface MinimalPair {
  id: string;
  categoryCode: 'theta' | 'eth' | 'v_f' | 'vowel_length' | 'cluster' | 'silent';
  title: string;
  phonemicContrast: string;
  explanationId: string;
  wordA: MinimalPairWord;
  wordB: MinimalPairWord;
}

export const MINIMAL_PAIRS_CATALOG: MinimalPair[] = [
  // --- KONTRAK 1: /θ/ vs /t/ (Dental Fricative vs Alveolar Plosive) ---
  {
    id: 'mp-theta-1',
    categoryCode: 'theta',
    title: 'Think vs Tink',
    phonemicContrast: '/θ/ vs /t/ (Lidah Digigit vs Lidah Ditekan di Langit-langit)',
    explanationId: 'Penutur Indonesia kerap menembak bunyi "th" dengan bunyi "t" biasa. Rasakan hembusan udara lembut di antara gigi atas dan lidah.',
    wordA: {
      word: 'think',
      ipa: '/θɪŋk/',
      meaningId: 'Berpikir / Mengira',
      articulatoryTipId: 'Selipkan lembut ujung lidah di antara gigi atas & bawah, lalu hembuskan udara tanpa getaran pita suara.',
      sampleSentence: 'I think this is a great idea.',
    },
    wordB: {
      word: 'tink',
      ipa: '/tɪŋk/',
      meaningId: 'Denting logam kecil',
      articulatoryTipId: 'Tempelkan ujung lidah ke gusi atas (alveolar) lalu lepaskan letupan udara tegas.',
      sampleSentence: 'The glass made a light tink sound.',
    },
  },
  {
    id: 'mp-theta-2',
    categoryCode: 'theta',
    title: 'Three vs Tree',
    phonemicContrast: '/θ/ vs /t/ (Angka 3 vs Pohon)',
    explanationId: 'Salah satu kekeliruan paling umum: menyebut "three" terdengar persis seperti "tree".',
    wordA: {
      word: 'three',
      ipa: '/θriː/',
      meaningId: 'Tiga (3)',
      articulatoryTipId: 'Ujung lidah terlihat di antara gigi sebelum meluncur ke bunyi /r/.',
      sampleSentence: 'I have three meetings today.',
    },
    wordB: {
      word: 'tree',
      ipa: '/triː/',
      meaningId: 'Pohon',
      articulatoryTipId: 'Letupkan bunyi /t/ di gusi atas tanpa menjulurkan lidah keluar gigi.',
      sampleSentence: 'The green tree is in the garden.',
    },
  },

  // --- KONTRAK 2: /v/ vs /f/ (Voiced vs Voiceless Labiodental) ---
  {
    id: 'mp-vf-1',
    categoryCode: 'v_f',
    title: 'Van vs Fan',
    phonemicContrast: '/v/ vs /f/ (Pita Suara Bergetar vs Tanpa Getaran)',
    explanationId: 'Bunyi /v/ dan /f/ memiliki posisi mulut yang sama (gigi atas menyentuh bibir bawah), perbedaannya terletak pada getaran pita suara leher.',
    wordA: {
      word: 'van',
      ipa: '/væn/',
      meaningId: 'Mobil van / minibus',
      articulatoryTipId: 'Gigi atas di bibir bawah + getarkan pita suara di tenggorokan (seperti dengung lebah).',
      sampleSentence: 'They rented a large van for travel.',
    },
    wordB: {
      word: 'fan',
      ipa: '/fæn/',
      meaningId: 'Kipas angin / Penggemar',
      articulatoryTipId: 'Gigi atas di bibir bawah + hembusan nafas murni tanpa getaran tenggorokan.',
      sampleSentence: 'Turn on the electric fan, please.',
    },
  },
  {
    id: 'mp-vf-2',
    categoryCode: 'v_f',
    title: 'Very vs Ferry',
    phonemicContrast: '/v/ vs /f/ (Sangat vs Kapal Feri)',
    explanationId: 'Kata "very" sangat sering diucapkan menjadi "fery" oleh penutur Indonesia karena bahasa ibu tidak memiliki fonem /v/ asli.',
    wordA: {
      word: 'very',
      ipa: '/ˈveri/',
      meaningId: 'Sangat / Amat',
      articulatoryTipId: 'Sentuhkan gigi atas ke bibir bawah dan dengungkan tenggorokan Anda.',
      sampleSentence: 'Thank you very much for your help.',
    },
    wordB: {
      word: 'ferry',
      ipa: '/ˈferi/',
      meaningId: 'Kapal penyeberangan (feri)',
      articulatoryTipId: 'Tiupkan udara dingin dari bibir bawah tanpa getaran pita suara.',
      sampleSentence: 'We crossed the river by ferry.',
    },
  },

  // --- KONTRAK 3: /iː/ vs /ɪ/ (Long Tense Vowel vs Short Lax Vowel) ---
  {
    id: 'mp-vowel-1',
    categoryCode: 'vowel_length',
    title: 'Sheep vs Ship',
    phonemicContrast: '/iː/ (Panjang Senyum) vs /ɪ/ (Pendek Rileks)',
    explanationId: 'Bahasa Indonesia hanya memiliki 1 vokal "i". Dalam bahasa Inggris, memendekkan vokal /iː/ dapat mengubah makna kata secara drastis.',
    wordA: {
      word: 'sheep',
      ipa: '/ʃiːp/',
      meaningId: 'Domba (hewan berbulu tebal)',
      articulatoryTipId: 'Tarik sudut bibir melebar seperti tersenyum lebar, tahan durasi vokal sedikit lebih lama.',
      sampleSentence: 'The white sheep is grazing in the field.',
    },
    wordB: {
      word: 'ship',
      ipa: '/ʃɪp/',
      meaningId: 'Kapal laut besar',
      articulatoryTipId: 'Rilekskan rahang bawah sedikit turun, bunyikan vokal "i" pendek dan santai.',
      sampleSentence: 'The cargo ship departed this morning.',
    },
  },
  {
    id: 'mp-vowel-2',
    categoryCode: 'vowel_length',
    title: 'Leave vs Live',
    phonemicContrast: '/iː/ (Tinggal/Berangkat) vs /ɪ/ (Tinggal/Hidup)',
    explanationId: 'Kontras esensial dalam percakapan sehari-hari dan profesional.',
    wordA: {
      word: 'leave',
      ipa: '/liːv/',
      meaningId: 'Pergi / Meninggalkan',
      articulatoryTipId: 'Senyum lebar /iː/ panjang diakhiri getaran /v/ lembut.',
      sampleSentence: 'I will leave the office at five.',
    },
    wordB: {
      word: 'live',
      ipa: '/lɪv/',
      meaningId: 'Tinggal / Menetap',
      articulatoryTipId: 'Vokal pendek rileks /ɪ/, rahang agak turun.',
      sampleSentence: 'I live in Jakarta with my family.',
    },
  },

  // --- KONTRAK 4: /ð/ vs /d/ (Voiced Dental vs Alveolar) ---
  {
    id: 'mp-eth-1',
    categoryCode: 'eth',
    title: 'They vs Day',
    phonemicContrast: '/ð/ (Lidah di Gigi Bergetar) vs /d/ (Letupan Gusi)',
    explanationId: 'Bunyi "th" pada "they", "this", "that" kerap diganti dengan "d" keras Indonesia.',
    wordA: {
      word: 'they',
      ipa: '/ðeɪ/',
      meaningId: 'Mereka',
      articulatoryTipId: 'Jepit ujung lidah di antara gigi, alirkan udara sambil mendengungkan suara.',
      sampleSentence: 'They are working on the project.',
    },
    wordB: {
      word: 'day',
      ipa: '/deɪ/',
      meaningId: 'Hari / Siang',
      articulatoryTipId: 'Hantamkan ujung lidah di balik gigi atas (gusi) lalu lepaskan letupan.',
      sampleSentence: 'Have a wonderful day ahead.',
    },
  },

  // --- KONTRAK 5: Consonant Clusters (Gugus Konsonan Akhir) ---
  {
    id: 'mp-cluster-1',
    categoryCode: 'cluster',
    title: 'Ask vs Ass',
    phonemicContrast: '/sk/ (Desis + Letupan K) vs /s/ (Desis Tunggal)',
    explanationId: 'Penutur Indonesia terbiasa meniadakan letupan konsonan kedua pada gugus konsonan akhir.',
    wordA: {
      word: 'ask',
      ipa: '/æsk/',
      meaningId: 'Bertanya / Meminta',
      articulatoryTipId: 'Bunyikan desis /s/ lalu akhiri dengan letupan kecil /k/ di belakang lidah.',
      sampleSentence: 'May I ask a question?',
    },
    wordB: {
      word: 'as',
      ipa: '/æz/',
      meaningId: 'Sebagai / Seperti',
      articulatoryTipId: 'Hanya akhiran desis dengung tanpa letupan penutup.',
      sampleSentence: 'As you already know, we are ready.',
    },
  },
];

/**
 * Mengambil daftar pasangan minimal berdasarkan kategori fonem
 */
export function getMinimalPairsByCategory(categoryCode?: string): MinimalPair[] {
  if (!categoryCode || categoryCode === 'all') {
    return MINIMAL_PAIRS_CATALOG;
  }
  return MINIMAL_PAIRS_CATALOG.filter((mp) => mp.categoryCode === categoryCode);
}

