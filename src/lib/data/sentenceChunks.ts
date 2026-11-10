import { UserLearningGoal, UserProficiencyTier } from '@/lib/core/preferences';

export interface ChunkSlotVariation {
  id: string;
  slotText: string;
  meaningId: string;
  exampleFullSentence: string;
  phoneticFocus?: string;
}

export interface SentenceChunk {
  id: string;
  tier: UserProficiencyTier;
  goal: UserLearningGoal;
  category: string;
  patternTitle: string;
  patternTemplate: string; // e.g. "Could you please {SLOT} when you have time?"
  patternMeaningId: string; // e.g. "Bisakah Anda {SLOT} saat ada waktu?"
  contextSituationId: string;
  pedagogicalTipId: string;
  slotPlaceholder: string;
  defaultSlotId: string;
  variations: ChunkSlotVariation[];
}

export const SENTENCE_CHUNKS: SentenceChunk[] = [
  // ==========================================================================
  // TIER A1: PEMULA DASAR (70% PANDUAN INDONESIA)
  // ==========================================================================
  {
    id: 'a1-order-cafe',
    tier: 'A1',
    goal: 'travel',
    category: 'Wisata & Kafe',
    patternTitle: 'Pola Pemesanan Sopan di Kafe',
    patternTemplate: 'Can I have {SLOT}, please?',
    patternMeaningId: 'Bolehkah saya memesan {SLOT}?',
    contextSituationId: 'Gunakan pola ini saat mampir ke kafe, restoran, atau gerai cepat saji di luar negeri.',
    pedagogicalTipId: 'Gunakan "Can I have..." diiringi "please" di akhir. Lebih natural daripada sekadar menyebut nama makanan.',
    slotPlaceholder: '[PESANAN]',
    defaultSlotId: 'iced-latte',
    variations: [
      {
        id: 'iced-latte',
        slotText: 'an iced latte',
        meaningId: 'segelas es latte',
        exampleFullSentence: 'Can I have an iced latte, please?',
        phoneticFocus: 'Bunyi /v/ pada "have" lembut, gigi atas sentuh bibir bawah.',
      },
      {
        id: 'glass-water',
        slotText: 'a glass of water',
        meaningId: 'segelas air putih',
        exampleFullSentence: 'Can I have a glass of water, please?',
        phoneticFocus: 'Kata "of" dibaca /əv/, bukan "of" keras.',
      },
      {
        id: 'cafe-menu',
        slotText: 'the menu',
        meaningId: 'buku menu',
        exampleFullSentence: 'Can I have the menu, please?',
        phoneticFocus: 'Tekanan pada "ME-nyu" /ˈmen.juː/.',
      },
    ],
  },
  {
    id: 'a1-asking-directions',
    tier: 'A1',
    goal: 'travel',
    category: 'Arah & Navigasi',
    patternTitle: 'Pola Menanyakan Lokasi Terdekat',
    patternTemplate: 'Excuse me, where is {SLOT}?',
    patternMeaningId: 'Permisi, di manakah {SLOT}?',
    contextSituationId: 'Kalimat penyelamat saat tersesat di jalan atau mencari fasilitas umum.',
    pedagogicalTipId: 'Selalu awali dengan "Excuse me" dengan nada ramah sebelum bertanya lokasi.',
    slotPlaceholder: '[LOKASI/TEMPAT]',
    defaultSlotId: 'nearest-station',
    variations: [
      {
        id: 'nearest-station',
        slotText: 'the nearest station',
        meaningId: 'stasiun terdekat',
        exampleFullSentence: 'Excuse me, where is the nearest station?',
        phoneticFocus: 'Kata "nearest" dibaca /ˈnɪər.ɪst/, konsonan /st/ jelas.',
      },
      {
        id: 'restroom',
        slotText: 'the restroom',
        meaningId: 'toilet / kamar kecil',
        exampleFullSentence: 'Excuse me, where is the restroom?',
        phoneticFocus: 'Di Amerika lebih lazim sebut "restroom", di UK "toilet/washroom".',
      },
      {
        id: 'exit-gate',
        slotText: 'the exit',
        meaningId: 'pintu keluar',
        exampleFullSentence: 'Excuse me, where is the exit?',
        phoneticFocus: 'Huruf "x" dibaca /ks/ atau /ɡz/: /ˈek.sɪt/.',
      },
    ],
  },
  {
    id: 'a1-career-developer',
    tier: 'A1',
    goal: 'career',
    category: 'Profesi & Kerja',
    patternTitle: 'Pola Memperkenalkan Pekerjaan',
    patternTemplate: 'I work as {SLOT} in Jakarta.',
    patternMeaningId: 'Saya bekerja sebagai {SLOT} di Jakarta.',
    contextSituationId: 'Menjawab pertanyaan "What do you do?" saat perkenalan rekan kerja atau komunitas tech.',
    pedagogicalTipId: 'Gunakan preposisi "as" sebelum profesi. Jangan ucapkan "I work developer" tanpa "as a".',
    slotPlaceholder: '[PROFESI]',
    defaultSlotId: 'software-dev',
    variations: [
      {
        id: 'software-dev',
        slotText: 'a software developer',
        meaningId: 'seorang software developer',
        exampleFullSentence: 'I work as a software developer in Jakarta.',
        phoneticFocus: 'Tekanan di suku kata kedua: de-VEL-o-per.',
      },
      {
        id: 'data-analyst',
        slotText: 'a data analyst',
        meaningId: 'seorang data analyst',
        exampleFullSentence: 'I work as a data analyst in Jakarta.',
        phoneticFocus: 'Kata "analyst" beraksen di depan: /ˈæn.ə.lɪst/.',
      },
      {
        id: 'ui-designer',
        slotText: 'a UI designer',
        meaningId: 'seorang desainer UI',
        exampleFullSentence: 'I work as a UI designer in Jakarta.',
        phoneticFocus: 'Kata "designer" huruf "g"-nya bisu (silent): /dɪˈzaɪ.nər/.',
      },
    ],
  },
  {
    id: 'a1-academic-student',
    tier: 'A1',
    goal: 'academic',
    category: 'Kuliah & Jurusan',
    patternTitle: 'Pola Menyebutkan Jurusan Kuliah',
    patternTemplate: 'I am currently studying {SLOT}.',
    patternMeaningId: 'Saya saat ini sedang mempelajari {SLOT}.',
    contextSituationId: 'Dipakai saat perkenalan di kelas bahasa Inggris, seminar kampus, atau wawancara beasiswa.',
    pedagogicalTipId: 'Gunakan kata "currently" untuk menunjukkan kamu sedang aktif menempuh studi tersebut.',
    slotPlaceholder: '[BIDANG STUDI]',
    defaultSlotId: 'computer-science',
    variations: [
      {
        id: 'computer-science',
        slotText: 'computer science',
        meaningId: 'ilmu komputer',
        exampleFullSentence: 'I am currently studying computer science.',
        phoneticFocus: 'Kata "science" dibaca /ˈsaɪ.əns/, bunyi /s/ di awal dan akhir.',
      },
      {
        id: 'information-systems',
        slotText: 'information systems',
        meaningId: 'sistem informasi',
        exampleFullSentence: 'I am currently studying information systems.',
        phoneticFocus: 'Akhiran -tion dibaca /ʃən/.',
      },
      {
        id: 'artificial-intelligence',
        slotText: 'artificial intelligence',
        meaningId: 'kecerdasan buatan (AI)',
        exampleFullSentence: 'I am currently studying artificial intelligence.',
        phoneticFocus: 'Tekanan kata "intelligence" ada di /tel/: ɪnˈtel.ɪ.dʒəns.',
      },
    ],
  },
  {
    id: 'a1-social-hobbies',
    tier: 'A1',
    goal: 'social',
    category: 'Percakapan Santai',
    patternTitle: 'Pola Menceritakan Hobi Waktu Luang',
    patternTemplate: 'In my free time, I really enjoy {SLOT}.',
    patternMeaningId: 'Di waktu luang, saya sangat menikmati {SLOT}.',
    contextSituationId: 'Mencairkan suasana (ice-breaking) saat berkenalan dengan teman baru internasional.',
    pedagogicalTipId: 'Setelah kata "enjoy", gunakan kata kerja berakhiran -ing (gerund).',
    slotPlaceholder: '[AKTIVITAS HOBI]',
    defaultSlotId: 'music',
    variations: [
      {
        id: 'music',
        slotText: 'listening to music',
        meaningId: 'mendengarkan musik',
        exampleFullSentence: 'In my free time, I really enjoy listening to music.',
        phoneticFocus: 'Huruf "t" pada "listening" adalah silent letter: /ˈlɪs.ən.ɪŋ/.',
      },
      {
        id: 'gaming',
        slotText: 'playing video games',
        meaningId: 'bermain game',
        exampleFullSentence: 'In my free time, I really enjoy playing video games.',
        phoneticFocus: 'Vokal /eɪ/ pada "playing" dan "games" dibaca jelas.',
      },
      {
        id: 'reading-tech',
        slotText: 'reading tech articles',
        meaningId: 'membaca artikel teknologi',
        exampleFullSentence: 'In my free time, I really enjoy reading tech articles.',
        phoneticFocus: 'Bunyi "articles" bertekanan di depan: /ˈɑː.tɪ.kəlz/.',
      },
    ],
  },

  // ==========================================================================
  // TIER A2: MENENGAH AWAL (45% PANDUAN INDONESIA)
  // ==========================================================================
  {
    id: 'a2-standup-completed',
    tier: 'A2',
    goal: 'career',
    category: 'Daily Standup',
    patternTitle: 'Pola Melaporkan Pekerjaan yang Selesai',
    patternTemplate: 'Yesterday I completed {SLOT}.',
    patternMeaningId: 'Kemarin saya sudah menyelesaikan {SLOT}.',
    contextSituationId: 'Format laporan paling disukai Product Manager dan Tech Lead saat daily standup meeting.',
    pedagogicalTipId: 'Gunakan bentuk lampau "completed" /ˈkəm.pliːt.ɪd/ dengan akhiran -ed yang tegas.',
    slotPlaceholder: '[FITUR/TUGAS]',
    defaultSlotId: 'api-integration',
    variations: [
      {
        id: 'api-integration',
        slotText: 'the API integration',
        meaningId: 'integrasi API sistem',
        exampleFullSentence: 'Yesterday I completed the API integration.',
        phoneticFocus: 'Suku kata "integration" ditekan di /ɡreɪ/: ˌɪn.tɪˈɡreɪ.ʃən.',
      },
      {
        id: 'auth-flow',
        slotText: 'the authentication flow',
        meaningId: 'alur login & autentikasi',
        exampleFullSentence: 'Yesterday I completed the authentication flow.',
        phoneticFocus: 'Awali dengan fonem /ɔː.θen/ dengan lidah di gigi atas.',
      },
      {
        id: 'db-migration',
        slotText: 'the database migration',
        meaningId: 'migrasi basis data',
        exampleFullSentence: 'Yesterday I completed the database migration.',
        phoneticFocus: 'Tekanan "migration" di /ɡreɪ/: maɪˈɡreɪ.ʃən.',
      },
    ],
  },
  {
    id: 'a2-standup-today',
    tier: 'A2',
    goal: 'career',
    category: 'Daily Standup',
    patternTitle: 'Pola Rencana Kerja Hari Ini',
    patternTemplate: 'Today I will focus on {SLOT}.',
    patternMeaningId: 'Hari ini saya akan fokus pada {SLOT}.',
    contextSituationId: 'Bagian kedua dari update standup untuk menunjukkan komitmen dan target hari kerja.',
    pedagogicalTipId: 'Frasa "focus on" selalu berpasangan dengan "on", bukan "focus to" atau "focus in".',
    slotPlaceholder: '[TARGET HARI INI]',
    defaultSlotId: 'unit-tests',
    variations: [
      {
        id: 'unit-tests',
        slotText: 'writing comprehensive unit tests',
        meaningId: 'menulis unit test komprehensif',
        exampleFullSentence: 'Today I will focus on writing comprehensive unit tests.',
        phoneticFocus: 'Akhiran -sts pada "tests" jangan hilang, ucapkan /tests/.',
      },
      {
        id: 'bug-fixing',
        slotText: 'resolving the payment bug',
        meaningId: 'menyelesaikan bug pembayaran',
        exampleFullSentence: 'Today I will focus on resolving the payment bug.',
        phoneticFocus: 'Kata "resolving" dibaca /rɪˈzɒlv.ɪŋ/ dengan getaran /z/.',
      },
      {
        id: 'refactoring',
        slotText: 'refactoring the state management',
        meaningId: 'merapikan arsitektur state aplikasi',
        exampleFullSentence: 'Today I will focus on refactoring the state management.',
        phoneticFocus: 'Tekanan pada "state" /steɪt/ dan "management" /ˈmæn.ɪdʒ.mənt/.',
      },
    ],
  },
  {
    id: 'a2-polite-request-peer',
    tier: 'A2',
    goal: 'career',
    category: 'Kolaborasi Tim',
    patternTitle: 'Pola Permintaan Bantuan Diplomatis',
    patternTemplate: 'Could you please {SLOT} when you have time?',
    patternMeaningId: 'Bisakah Anda {SLOT} saat Anda punya waktu luang?',
    contextSituationId: 'Meminta bantuan atau review tanpa terkesan memerintah atau membebani rekan kerja.',
    pedagogicalTipId: 'Gunakan "Could you please..." daripada "Can you...". Ini standar kesopanan tertinggi di industri internasional.',
    slotPlaceholder: '[PERMINTAAN]',
    defaultSlotId: 'pr-review',
    variations: [
      {
        id: 'pr-review',
        slotText: 'review my pull request',
        meaningId: 'meninjau pull request saya',
        exampleFullSentence: 'Could you please review my pull request when you have time?',
        phoneticFocus: 'Huruf "l" pada "could" /kʊd/ adalah silent letter.',
      },
      {
        id: 'clarify-spec',
        slotText: 'clarify the design specifications',
        meaningId: 'memperjelas spesifikasi desain',
        exampleFullSentence: 'Could you please clarify the design specifications when you have time?',
        phoneticFocus: 'Kata "clarify" bertekanan di awal: /ˈklær.ɪ.faɪ/.',
      },
      {
        id: 'check-staging',
        slotText: 'check the staging environment',
        meaningId: 'memeriksa server staging',
        exampleFullSentence: 'Could you please check the staging environment when you have time?',
        phoneticFocus: 'Kata "environment" dibaca /ɪnˈvaɪ.rən.mənt/, huruf "n" kedua lembut.',
      },
    ],
  },
  {
    id: 'a2-academic-clarification',
    tier: 'A2',
    goal: 'academic',
    category: 'Kuliah & Dosen',
    patternTitle: 'Pola Menanyakan Kejelasan Tugas/Skripsi',
    patternTemplate: 'Could you please clarify {SLOT}?',
    patternMeaningId: 'Bisakah Bapak/Ibu memperjelas {SLOT}?',
    contextSituationId: 'Bertanya ke dosen pembimbing atau asisten praktikum dengan intonasi santun.',
    pedagogicalTipId: 'Gunakan intonasi naik sedikit di akhir kalimat agar terdengar rendah hati dan bersahabat.',
    slotPlaceholder: '[POIN YANG DITANYAKAN]',
    defaultSlotId: 'deadline-assignment',
    variations: [
      {
        id: 'deadline-assignment',
        slotText: 'the deadline for this assignment',
        meaningId: 'batas waktu pengumpulan tugas ini',
        exampleFullSentence: 'Could you please clarify the deadline for this assignment?',
        phoneticFocus: 'Huruf "g" pada "assignment" tidak dibaca: /əˈsaɪn.mənt/.',
      },
      {
        id: 'thesis-guideline',
        slotText: 'the formatting guidelines for the thesis',
        meaningId: 'pedoman format naskah skripsi',
        exampleFullSentence: 'Could you please clarify the formatting guidelines for the thesis?',
        phoneticFocus: 'Kata "thesis" diawali fonem /θ/ yang digigit: /ˈθiː.sɪs/.',
      },
      {
        id: 'evaluation-rubric',
        slotText: 'the grading criteria for the exam',
        meaningId: 'kriteria penilaian ujian',
        exampleFullSentence: 'Could you please clarify the grading criteria for the exam?',
        phoneticFocus: 'Kata "criteria" dibaca /kraɪˈtɪə.ri.ə/.',
      },
    ],
  },
  {
    id: 'a2-travel-hotel-request',
    tier: 'A2',
    goal: 'travel',
    category: 'Hotel & Menginap',
    patternTitle: 'Pola Permintaan Layanan Resepsionis',
    patternTemplate: 'I would like to {SLOT}, please.',
    patternMeaningId: 'Saya ingin {SLOT}.',
    contextSituationId: 'Saat berada di meja depan resepsionis hotel atau penginapan.',
    pedagogicalTipId: 'Singkat "I would like" menjadi "I\'d like" /aɪd laɪk/ untuk terdengar sangat luwes seperti penutur asli.',
    slotPlaceholder: '[LAYANAN HOTEL]',
    defaultSlotId: 'check-in',
    variations: [
      {
        id: 'check-in',
        slotText: 'check in under the name Alex',
        meaningId: 'check-in atas nama Alex',
        exampleFullSentence: 'I would like to check in under the name Alex, please.',
        phoneticFocus: 'Hubungkan bunyi "check in" menjadi /tʃek.ɪn/ (connected speech).',
      },
      {
        id: 'late-checkout',
        slotText: 'request a late check out',
        meaningId: 'meminta perpanjangan waktu check-out',
        exampleFullSentence: 'I would like to request a late check out, please.',
        phoneticFocus: 'Tekanan pada "re-QUEST": /rɪˈkwest/.',
      },
      {
        id: 'wifi-password',
        slotText: 'ask for the Wi-Fi password',
        meaningId: 'menanyakan kata sandi Wi-Fi',
        exampleFullSentence: 'I would like to ask for the Wi-Fi password, please.',
        phoneticFocus: 'Kata "Wi-Fi" dibaca /ˈwaɪ.faɪ/.',
      },
    ],
  },
  {
    id: 'a2-career-blocker-alert',
    tier: 'A2',
    goal: 'career',
    category: 'Daily Standup',
    patternTitle: 'Pola Menyampaikan Kendala Kerja (Blocker)',
    patternTemplate: 'I am currently blocked by {SLOT}.',
    patternMeaningId: 'Saya saat ini terkendala oleh {SLOT}.',
    contextSituationId: 'Menyampaikan hambatan kepada tim agar segera mendapat solusi atau bantuan.',
    pedagogicalTipId: 'Istilah "blocked by" adalah kosakata baku industri Agile di seluruh dunia.',
    slotPlaceholder: '[KENDALA]',
    defaultSlotId: 'api-timeout',
    variations: [
      {
        id: 'api-timeout',
        slotText: 'a third party API timeout',
        meaningId: 'timeout dari API pihak ketiga',
        exampleFullSentence: 'I am currently blocked by a third party API timeout.',
        phoneticFocus: 'Kata "party" pada aksen US berbunyi flapping "t" menjadi /d/ lembut.',
      },
      {
        id: 'missing-keys',
        slotText: 'missing environment credentials',
        meaningId: 'kredensial API yang belum tersedia',
        exampleFullSentence: 'I am currently blocked by missing environment credentials.',
        phoneticFocus: 'Kata "credentials" dibaca /krɪˈden.ʃəlz/.',
      },
      {
        id: 'broken-build',
        slotText: 'a failing dependency in the pipeline',
        meaningId: 'dependency yang error di pipeline build',
        exampleFullSentence: 'I am currently blocked by a failing dependency in the pipeline.',
        phoneticFocus: 'Kata "pipeline" dibaca /ˈpaɪp.laɪn/.',
      },
    ],
  },

  // ==========================================================================
  // TIER B1: MANDIRI DISKUSI & KERJA (20% PANDUAN INDONESIA)
  // ==========================================================================
  {
    id: 'b1-code-review-tradeoffs',
    tier: 'B1',
    goal: 'career',
    category: 'Arsitektur & Tech',
    patternTitle: 'Pola Menanyakan Trade-Offs Arsitektur',
    patternTemplate: 'Could you please explain the trade offs of {SLOT}?',
    patternMeaningId: 'Bisakah Anda menjelaskan untung-rugi dari {SLOT}?',
    contextSituationId: 'Diskusi teknis pada Pull Request atau rapat arsitektur sistem.',
    pedagogicalTipId: 'Pertanyaan ini menunjukkan kedewasaan teknis seorang software engineer karena memahami setiap pilihan ada trade-off.',
    slotPlaceholder: '[PENDEKATAN ARSITEKTUR]',
    defaultSlotId: 'this-approach',
    variations: [
      {
        id: 'this-approach',
        slotText: 'this specific approach',
        meaningId: 'pendekatan spesifik ini',
        exampleFullSentence: 'Could you please explain the trade offs of this specific approach?',
        phoneticFocus: 'Akhiran "approach" berbunyi /tʃ/ yang tajam: /əˈprəʊtʃ/.',
      },
      {
        id: 'microservices',
        slotText: 'migrating to microservices',
        meaningId: 'migrasi ke arsitektur microservices',
        exampleFullSentence: 'Could you please explain the trade offs of migrating to microservices?',
        phoneticFocus: 'Kata "microservices" beraksen /ˌmaɪ.krəʊˈsɜː.vɪ.sɪz/.',
      },
      {
        id: 'caching-layer',
        slotText: 'implementing a Redis caching layer',
        meaningId: 'penerapan layer caching Redis',
        exampleFullSentence: 'Could you please explain the trade offs of implementing a Redis caching layer?',
        phoneticFocus: 'Kata "caching" dibaca /ˈkæʃ.ɪŋ/ (bukan "kaking").',
      },
    ],
  },
  {
    id: 'b1-incident-report',
    tier: 'B1',
    goal: 'career',
    category: 'Cloud & Incident',
    patternTitle: 'Pola Melaporkan Masalah Sistem Produksi',
    patternTemplate: 'We detected {SLOT} in the production deployment.',
    patternMeaningId: 'Kami mendeteksi {SLOT} pada rilis produksi.',
    contextSituationId: 'Penyampaian laporan darurat ke Tech Lead atau channel war room incident.',
    pedagogicalTipId: 'Gunakan subjek "We" untuk menunjukkan kesolidan tim daripada menyalahkan individu.',
    slotPlaceholder: '[GEJALA KENDALA]',
    defaultSlotId: 'bottleneck',
    variations: [
      {
        id: 'bottleneck',
        slotText: 'a performance bottleneck',
        meaningId: 'bottleneck penurunan performa sistem',
        exampleFullSentence: 'We detected a performance bottleneck in the production deployment.',
        phoneticFocus: 'Tekanan pada "per-FOR-mance" /pəˈfɔː.məns/.',
      },
      {
        id: 'memory-leak',
        slotText: 'a severe memory leak',
        meaningId: 'kebocoran memori yang cukup parah',
        exampleFullSentence: 'We detected a severe memory leak in the production deployment.',
        phoneticFocus: 'Kata "severe" dibaca /sɪˈvɪər/ dengan penekanan di akhir.',
      },
      {
        id: 'latency-spike',
        slotText: 'an unusual latency spike',
        meaningId: 'lonjakan waktu respon yang tidak biasa',
        exampleFullSentence: 'We detected an unusual latency spike in the production deployment.',
        phoneticFocus: 'Kata "latency" dibaca /ˈleɪ.tən.si/.',
      },
    ],
  },
  {
    id: 'b1-thesis-empirical-findings',
    tier: 'B1',
    goal: 'academic',
    category: 'Presentasi Skripsi',
    patternTitle: 'Pola Memaparkan Temuan Hasil Penelitian',
    patternTemplate: 'Based on our empirical results, {SLOT} improved significantly.',
    patternMeaningId: 'Berdasarkan hasil empiris kami, {SLOT} meningkat secara signifikan.',
    contextSituationId: 'Poin puncak saat sidang tugas akhir untuk meyakinkan dewan penguji.',
    pedagogicalTipId: 'Kata "empirical" /ɪmˈpɪr.ɪ.kəl/ dan "significantly" /sɪɡˈnɪf.ɪ.kənt.li/ adalah kosakata ilmiah standar.',
    slotPlaceholder: '[METRIK YANG DIUJI]',
    defaultSlotId: 'accuracy',
    variations: [
      {
        id: 'accuracy',
        slotText: 'the speech recognition accuracy',
        meaningId: 'akurasi pengenalan ucapan',
        exampleFullSentence: 'Based on our empirical results, the speech recognition accuracy improved significantly.',
        phoneticFocus: 'Kata "accuracy" dibaca /ˈæk.jə.rə.si/.',
      },
      {
        id: 'inference-time',
        slotText: 'the model inference speed',
        meaningId: 'kecepatan kalkulasi inferensi model',
        exampleFullSentence: 'Based on our empirical results, the model inference speed improved significantly.',
        phoneticFocus: 'Tekanan kata "inference" di depan: /ˈɪn.fər.əns/.',
      },
      {
        id: 'learner-retention',
        slotText: 'the learner retention rate',
        meaningId: 'tingkat konsistensi belajar siswa',
        exampleFullSentence: 'Based on our empirical results, the learner retention rate improved significantly.',
        phoneticFocus: 'Kata "retention" dibaca /rɪˈten.ʃən/.',
      },
    ],
  },
  {
    id: 'b1-diplomatic-alternative',
    tier: 'B1',
    goal: 'social',
    category: 'Diskusi Diplomatis',
    patternTitle: 'Pola Menyampaikan Sudut Pandang Alternatif',
    patternTemplate: 'I see your point, but we might want to consider {SLOT}.',
    patternMeaningId: 'Saya memahami sudut pandang Anda, namun kita mungkin perlu mempertimbangkan {SLOT}.',
    contextSituationId: 'Menyanggah pendapat di rapat atau diskusi tanpa menyinggung perasaan lawan bicara.',
    pedagogicalTipId: 'Formula diplomasi: Validasi dulu ("I see your point") &rarr; ajukan opsi alternatif dengan "might want to consider".',
    slotPlaceholder: '[OPSI ALTERNATIF]',
    defaultSlotId: 'options-before-deciding',
    variations: [
      {
        id: 'options-before-deciding',
        slotText: 'alternative options before deciding',
        meaningId: 'pilihan alternatif sebelum mengambil keputusan',
        exampleFullSentence: 'I see your point, but we might want to consider alternative options before deciding.',
        phoneticFocus: 'Gunakan intonasi turun-naik (fall-rise) agar terdengar ramah.',
      },
      {
        id: 'user-feedback',
        slotText: 'the user feedback from our initial survey',
        meaningId: 'masukan pengguna dari survei awal kita',
        exampleFullSentence: 'I see your point, but we might want to consider the user feedback from our initial survey.',
        phoneticFocus: 'Kata "survey" dibaca /ˈsɜː.veɪ/.',
      },
      {
        id: 'maintenance-costs',
        slotText: 'the long term maintenance costs',
        meaningId: 'biaya pemeliharaan sistem jangka panjang',
        exampleFullSentence: 'I see your point, but we might want to consider the long term maintenance costs.',
        phoneticFocus: 'Kata "maintenance" ditekan di depan: /ˈmeɪn.tən.əns/.',
      },
    ],
  },
  {
    id: 'b1-airport-lost-baggage',
    tier: 'B1',
    goal: 'travel',
    category: 'Layanan Bandara',
    patternTitle: 'Pola Menangani Kendala Bagasi Bandara',
    patternTemplate: 'Excuse me, my baggage seems to be delayed and I need assistance with {SLOT}.',
    patternMeaningId: 'Permisi, bagasi saya tampaknya tertunda dan saya butuh bantuan untuk {SLOT}.',
    contextSituationId: 'Menghubungi petugas maskapai atau loket Lost and Found bandara.',
    pedagogicalTipId: 'Gunakan kata "seems to be delayed" daripada "is lost". Terdengar lebih tenang dan kooperatif.',
    slotPlaceholder: '[BANTUAN]',
    defaultSlotId: 'filing-report',
    variations: [
      {
        id: 'filing-report',
        slotText: 'filing a property irregularity report',
        meaningId: 'mengisi formulir laporan kehilangan resmi (PIR)',
        exampleFullSentence: 'Excuse me, my baggage seems to be delayed and I need assistance with filing a property irregularity report.',
        phoneticFocus: 'Frasa "irregularity" dibaca /ɪˌreɡ.jəˈlær.ə.ti/.',
      },
      {
        id: 'tracking-claim',
        slotText: 'tracking my baggage claim tag',
        meaningId: 'melacak nomor stiker klaim koper saya',
        exampleFullSentence: 'Excuse me, my baggage seems to be delayed and I need assistance with tracking my baggage claim tag.',
        phoneticFocus: 'Kata "claim" dibaca /kleɪm/ dengan vokal panjang.',
      },
      {
        id: 'transit-flight',
        slotText: 'checking my connecting flight transfer',
        meaningId: 'memeriksa transfer bagasi penerbangan transit',
        exampleFullSentence: 'Excuse me, my baggage seems to be delayed and I need assistance with checking my connecting flight transfer.',
        phoneticFocus: 'Tekanan pada "connecting": /kəˈnek.tɪŋ/.',
      },
    ],
  },
];

/**
 * Filter sentence chunks by Tier and/or Learning Goal
 */
export function getSentenceChunksByFilter(
  tier?: UserProficiencyTier | 'all',
  goal?: UserLearningGoal | 'all'
): SentenceChunk[] {
  return SENTENCE_CHUNKS.filter((chunk) => {
    const matchesTier = !tier || tier === 'all' || chunk.tier === tier;
    const matchesGoal = !goal || goal === 'all' || chunk.goal === goal;
    return matchesTier && matchesGoal;
  });
}

/**
 * Assembles the full English sentence based on the chosen variation
 */
export function assembleChunkSentence(
  chunk: SentenceChunk,
  variationId: string
): { sentence: string; variation: ChunkSlotVariation } {
  const variation =
    chunk.variations.find((v) => v.id === variationId) || chunk.variations[0];
  const sentence = chunk.patternTemplate.replace('{SLOT}', variation.slotText);
  return { sentence, variation };
}

