/**
 * ROLEPLAY_SCENARIOS.TS - Bank Skenario Percakapan Nyata Mikro (2-3 Giliran)
 *
 * TUJUAN PEDAGOGIS:
 * 1. Mengatasi Foreign Language Anxiety (kecemasan / grogi saat harus berbicara spontan).
 * 2. Menyediakan "Bilingual Scaffold" berupa tombol "Help Me Say This" jika pengguna macet / blank.
 * 3. Tetap ringan dan bebas burnout: Setiap percakapan hanya terdiri dari 2 giliran bicara (selesai dalam < 2 menit).
 */

import { UserLearningGoal, UserProficiencyTier } from '../core/preferences';

export interface RoleplayHint {
  id: string;
  englishText: string;
  indonesianMeaning: string;
  phoneticFocus: string;
  chunkHighlight: string;
}

export interface RoleplayTurn {
  turnNumber: number;
  aiPrompt: string;
  aiPromptMeaningId: string;
  contextObjective: string;
  hints: RoleplayHint[];
  expectedKeywords: string[];
}

export interface RoleplayScenario {
  id: string;
  title: string;
  goal: UserLearningGoal;
  tier: UserProficiencyTier;
  partnerRole: string;
  partnerAvatarEmoji: string;
  location: string;
  mission: string;
  turns: RoleplayTurn[];
  closingMessage: string;
}

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  // ==========================================================================
  // 1. WISATA & SURVIVAL: KAFE MODERN (Tier A1 - Travel)
  // ==========================================================================
  {
    id: 'roleplay-cafe-a1',
    title: 'Memesan Minuman & Sarapan di Coffee Shop',
    goal: 'travel',
    tier: 'A1',
    partnerRole: 'Barista Ramah',
    partnerAvatarEmoji: '☕',
    location: 'Kafe Sentral Kota, Melbourne',
    mission: 'Pesan kopi favoritmu dengan ukuran yang tepat dan tambahkan camilan ringan santai.',
    turns: [
      {
        turnNumber: 1,
        aiPrompt: 'Hi there! Welcome to Central Brew. What can I get started for you today?',
        aiPromptMeaningId: 'Halo! Selamat datang di Central Brew. Mau pesan apa hari ini?',
        contextObjective: 'Sapa balik barista dan sebutkan jenis kopi yang ingin kamu pesan.',
        hints: [
          {
            id: 'h-c1-1',
            englishText: 'Can I have an iced latte with oat milk, please?',
            indonesianMeaning: 'Bisa minta satu iced latte dengan susu oat?',
            phoneticFocus: 'Bunyi /v/ pada "have" dibaca lembut, gigi atas menyentuh bibir bawah.',
            chunkHighlight: 'Can I have [DRINK], please?',
          },
          {
            id: 'h-c1-2',
            englishText: 'I would like a regular Americano to go, please.',
            indonesianMeaning: 'Saya mau satu Americano ukuran biasa untuk dibawa pulang.',
            phoneticFocus: 'Huruf "l" pada "would" adalah huruf bisu (silent letter), baca /wʊd/.',
            chunkHighlight: 'I would like [DRINK], please.',
          },
          {
            id: 'h-c1-3',
            englishText: 'Could I get a hot cappuccino with less sugar?',
            indonesianMeaning: 'Bisa pesan satu cappuccino hangat dengan sedikit gula?',
            phoneticFocus: 'Huruf "l" pada "could" bisu /kʊd/, dan "less" diakhiri desis /s/.',
            chunkHighlight: 'Could I get [DRINK]?',
          },
        ],
        expectedKeywords: ['latte', 'coffee', 'americano', 'cappuccino', 'tea', 'have', 'like', 'get', 'please'],
      },
      {
        turnNumber: 2,
        aiPrompt: 'Sure thing! What size would you like, and would you like any pastry with that?',
        aiPromptMeaningId: 'Tentu! Mau ukuran apa, dan apakah mau ditambah roti atau pastry sekalian?',
        contextObjective: 'Tentukan ukuran cangkir (medium / regular / large) dan pesan croissant atau tolak dengan sopan.',
        hints: [
          {
            id: 'h-c2-1',
            englishText: 'Medium size, and can I also get one butter croissant?',
            indonesianMeaning: 'Ukuran medium, dan bisa tambah satu butter croissant?',
            phoneticFocus: 'Vokal /iː/ pada "medium" dan letupan /t/ pada "croissant".',
            chunkHighlight: '[SIZE], and can I also get [FOOD]?',
          },
          {
            id: 'h-c2-2',
            englishText: 'Just a regular size, and that will be all for now, thank you.',
            indonesianMeaning: 'Cukup ukuran reguler saja, itu saja untuk sekarang, terima kasih.',
            phoneticFocus: 'Dental fricative /θ/ pada "thank" /θæŋk/, gigit ujung lidah sedikit.',
            chunkHighlight: 'Just a [SIZE], and that will be all.',
          },
          {
            id: 'h-c2-3',
            englishText: 'Make it a large size, and could I get a chocolate muffin as well?',
            indonesianMeaning: 'Jadikan ukuran large, dan bisa tambah muffin cokelat juga?',
            phoneticFocus: 'Vokal panjang /ɑː/ pada "large" dan /tʃ/ pada "chocolate".',
            chunkHighlight: 'Make it a [SIZE], and could I get [FOOD]?',
          },
        ],
        expectedKeywords: ['size', 'medium', 'regular', 'large', 'croissant', 'muffin', 'all', 'thank', 'no'],
      },
    ],
    closingMessage: 'Awesome order! Your drink will be ready in three minutes at the pickup counter. Have a wonderful day!',
  },

  // ==========================================================================
  // 2. KARIR & TEKNOLOGI: DAILY STANDUP MEETING (Tier A2 - Career)
  // ==========================================================================
  {
    id: 'roleplay-standup-a2',
    title: 'Update Progres di Daily Standup Meeting IT',
    goal: 'career',
    tier: 'A2',
    partnerRole: 'Tech Lead / Scrum Master',
    partnerAvatarEmoji: '💻',
    location: 'Slack Huddle / Google Meet Ruang Virtual',
    mission: 'Sampaikan pekerjaan yang berhasil kamu selesaikan kemarin dan konfirmasi blocker tugasmu.',
    turns: [
      {
        turnNumber: 1,
        aiPrompt: "Morning team! Let's do a quick daily standup. What did you work on yesterday?",
        aiPromptMeaningId: 'Selamat pagi tim! Mari kita mulai standup singkat. Apa yang kamu kerjakan kemarin?',
        contextObjective: 'Ceritakan fitur atau perbaikan kode yang kamu selesaikan kemarin dengan past tense sederhana.',
        hints: [
          {
            id: 'h-s1-1',
            englishText: 'Yesterday I finished implementing the user login authentication feature.',
            indonesianMeaning: 'Kemarin saya selesai mengimplementasikan fitur autentikasi login pengguna.',
            phoneticFocus: 'Akhiran -ed pada "finished" berbunyi /t/, bukan "finis-hed".',
            chunkHighlight: 'Yesterday I finished [ACTION/TASK].',
          },
          {
            id: 'h-s1-2',
            englishText: 'I fixed the database query bottleneck and created a new pull request.',
            indonesianMeaning: 'Saya memperbaiki bottleneck query database dan membuat pull request baru.',
            phoneticFocus: 'Konsonan /v/ pada "created", dan kluster /st/ pada "request".',
            chunkHighlight: 'I fixed [ISSUE] and created [OUTPUT].',
          },
          {
            id: 'h-s1-3',
            englishText: 'I worked on writing unit tests for the payment API endpoints.',
            indonesianMeaning: 'Saya mengerjakan penulisan unit test untuk endpoint payment API.',
            phoneticFocus: 'Akhiran -ed pada "worked" berbunyi /t/, dan vokal /eɪ/ pada "payment".',
            chunkHighlight: 'I worked on [TASK] for [MODULE].',
          },
        ],
        expectedKeywords: ['yesterday', 'finished', 'fixed', 'worked', 'created', 'feature', 'bug', 'pull', 'request', 'api'],
      },
      {
        turnNumber: 2,
        aiPrompt: 'Solid progress! Do you have any blockers, and what is your main focus for today?',
        aiPromptMeaningId: 'Progres bagus! Apakah ada kendala (blocker), dan apa fokus utamamu untuk hari ini?',
        contextObjective: 'Nyatakan bahwa tidak ada kendala berarti dan sebutkan pekerjaan hari ini.',
        hints: [
          {
            id: 'h-s2-1',
            englishText: 'No blockers on my side. Today I will review the API pull requests.',
            indonesianMeaning: 'Tidak ada kendala dari sisi saya. Hari ini saya akan mereview pull request API.',
            phoneticFocus: 'Bunyi /v/ pada "review" dan desis /s/ pada "requests".',
            chunkHighlight: 'No blockers on my side. Today I will [ACTION].',
          },
          {
            id: 'h-s2-2',
            englishText: 'I have no blockers, but I might need someone to review my pull request.',
            indonesianMeaning: 'Saya tidak ada kendala, tapi mungkin butuh bantuan seseorang untuk mereview PR saya.',
            phoneticFocus: 'Bunyi /v/ pada "have" dan "review", serta penekanan pada "request".',
            chunkHighlight: 'I have no blockers, but I need [HELP].',
          },
          {
            id: 'h-s2-3',
            englishText: 'Everything is on track. Today I plan to start refactoring the database schema.',
            indonesianMeaning: 'Semua berjalan sesuai rencana. Hari ini saya berencana mulai merapikan skema database.',
            phoneticFocus: 'Bunyi /θ/ pada "everything" /ev.ri.θɪŋ/, gigit ujung lidah sedikit.',
            chunkHighlight: 'Everything is on track. Today I plan to [ACTION].',
          },
        ],
        expectedKeywords: ['no', 'blockers', 'side', 'today', 'focus', 'will', 'plan', 'review', 'track'],
      },
    ],
    closingMessage: 'Great update! Thanks for keeping the team aligned. Let us know if you need any peer review later.',
  },

  // ==========================================================================
  // 3. PENDIDIKAN & AKADEMIS: KONSULTASI SKRIPSI (Tier B1 - Academic)
  // ==========================================================================
  {
    id: 'roleplay-thesis-b1',
    title: 'Konsultasi Metodologi dengan Dosen Pembimbing Skripsi',
    goal: 'academic',
    tier: 'B1',
    partnerRole: 'Dosen Pembimbing Skripsi',
    partnerAvatarEmoji: '🎓',
    location: 'Ruang Dosen & Konsultasi Tugas Akhir',
    mission: 'Jelaskan alasan pemilihan metode penelitian dan rencana pengujian efektivitas aplikasi.',
    turns: [
      {
        turnNumber: 1,
        aiPrompt: 'Good afternoon. I reviewed your research draft. Could you briefly explain why you chose this quantitative methodology?',
        aiPromptMeaningId: 'Selamat siang. Saya sudah membaca draf skripsimu. Bisa jelaskan singkat mengapa memilih metodologi kuantitatif ini?',
        contextObjective: 'Jelaskan alasan penggunaan metode kuantitatif untuk mengukur peningkatan kemampuan sebelum dan sesudah intervensi.',
        hints: [
          {
            id: 'h-t1-1',
            englishText: 'I chose this methodology because it allows us to calculate normalized gain from pre-test and post-test scores.',
            indonesianMeaning: 'Saya memilih metodologi ini karena memungkinkan kita menghitung normalized gain dari nilai pre-test dan post-test.',
            phoneticFocus: 'Penekanan suku kata pada "methodology" /ˌmeθ.əˈdɒl.ə.dʒi/ dan dental /θ/.',
            chunkHighlight: 'I chose this methodology because [REASON].',
          },
          {
            id: 'h-t1-2',
            englishText: 'We selected this quantitative approach to obtain measurable empirical data regarding student pronunciation accuracy.',
            indonesianMeaning: 'Kami memilih pendekatan kuantitatif ini untuk memperoleh data empiris terukur mengenai akurasi pelafalan siswa.',
            phoneticFocus: 'Vokal panjang pada "approach" /əˈprəʊtʃ/ dan kejelasan akhiran "accuracy".',
            chunkHighlight: 'We selected this approach to [GOAL].',
          },
          {
            id: 'h-t1-3',
            englishText: 'This design was chosen to objectively evaluate the effectiveness of the bilingual sandwich method.',
            indonesianMeaning: 'Desain ini dipilih untuk mengevaluasi secara objektif efektivitas metode bilingual sandwich.',
            phoneticFocus: 'Bunyi /v/ pada "evaluate" dan letupan /t/ pada "effectiveness".',
            chunkHighlight: 'This design was chosen to [PURPOSE].',
          },
        ],
        expectedKeywords: ['chose', 'methodology', 'quantitative', 'gain', 'pre-test', 'post-test', 'data', 'evaluate', 'effectiveness'],
      },
      {
        turnNumber: 2,
        aiPrompt: 'That sounds well-founded. What sample size and participant criteria are you planning to recruit for the evaluation?',
        aiPromptMeaningId: 'Alasan itu sangat berdasar. Berapa ukuran sampel dan kriteria partisipan yang kamu rencanakan untuk evaluasi?',
        contextObjective: 'Sebutkan jumlah sampel responden (misal 30 mahasiswa) dan instrumen yang digunakan.',
        hints: [
          {
            id: 'h-t2-1',
            englishText: 'We plan to recruit thirty university students who are actively preparing for their English exams.',
            indonesianMeaning: 'Kami berencana merekrut 30 mahasiswa yang sedang aktif mempersiapkan ujian bahasa Inggris.',
            phoneticFocus: 'Bunyi /θ/ pada "thirty" /ˈθɜː.ti/, gigit sedikit ujung lidah.',
            chunkHighlight: 'We plan to recruit [NUMBER] students who [CRITERIA].',
          },
          {
            id: 'h-t2-2',
            englishText: 'The sample will consist of thirty vocational education students with an initial CEFR tier of A1 to A2.',
            indonesianMeaning: 'Sampel akan terdiri dari 30 mahasiswa pendidikan vokasi dengan tingkat CEFR awal A1 hingga A2.',
            phoneticFocus: 'Konsonan /v/ pada "vocational" dan vokal /ɪ/ pada "consist".',
            chunkHighlight: 'The sample will consist of [NUMBER] [PARTICIPANTS].',
          },
          {
            id: 'h-t2-3',
            englishText: 'We will test twenty to thirty respondents using the standardized System Usability Scale questionnaire.',
            indonesianMeaning: 'Kami akan menguji 20 hingga 30 responden menggunakan kuesioner baku System Usability Scale.',
            phoneticFocus: 'Letupan /t/ pada "test" dan ritme jelas pada "questionnaire".',
            chunkHighlight: 'We will test [SAMPLE] using [INSTRUMENT].',
          },
        ],
        expectedKeywords: ['plan', 'recruit', 'sample', 'thirty', 'twenty', 'students', 'respondents', 'scale', 'questionnaire'],
      },
    ],
    closingMessage: 'Excellent research preparation! The quantitative scope is clear and academically sound. You may proceed to data collection.',
  },

  // ==========================================================================
  // 4. PERCAKAPAN SANTAI: NGAJAK JALAN AKHIR PEKAN (Tier A2 - Social)
  // ==========================================================================
  {
    id: 'roleplay-weekend-a2',
    title: 'Merencanakan Agenda Akhir Pekan Bersama Teman Baru',
    goal: 'social',
    tier: 'A2',
    partnerRole: 'Teman Internasional',
    partnerAvatarEmoji: '🤝',
    location: 'Taman Kota & Galeri Seni Downtown',
    mission: 'Ajak teman barumu berjalan-jalan dan sepakati waktu serta tempat bertemu yang pas.',
    turns: [
      {
        turnNumber: 1,
        aiPrompt: 'Hey! Are you free this Saturday afternoon? There is a really cool photography exhibition downtown.',
        aiPromptMeaningId: 'Hai! Apakah kamu luang Sabtu sore ini? Ada pameran fotografi yang sangat keren di pusat kota.',
        contextObjective: 'Tunjukkan rasa antusias dan tanyakan jam berapa rencana berkumpulnya.',
        hints: [
          {
            id: 'h-w1-1',
            englishText: 'That sounds really interesting! What time are you planning to meet?',
            indonesianMeaning: 'Kedengarannya sangat menarik! Jam berapa kamu berencana untuk bertemu?',
            phoneticFocus: 'Vokal /aʊ/ pada "sounds" dan ritme penekanan pada "interesting".',
            chunkHighlight: 'That sounds [ADJECTIVE]! What time [QUESTION]?',
          },
          {
            id: 'h-w1-2',
            englishText: 'I would love to join! Where exactly is the exhibition located?',
            indonesianMeaning: 'Saya ingin sekali bergabung! Di mana tepatnya lokasi pameran tersebut?',
            phoneticFocus: 'Bunyi /v/ pada "love" dan huruf bisu "l" pada "would" /wʊd/.',
            chunkHighlight: 'I would love to join! Where [QUESTION]?',
          },
          {
            id: 'h-w1-3',
            englishText: 'Sounds great! Should we meet at the train station first?',
            indonesianMeaning: 'Kedengarannya bagus! Apakah sebaiknya kita bertemu di stasiun kereta dulu?',
            phoneticFocus: 'Huruf bisu "l" pada "should" /ʃʊd/, jangan dilafalkan "suld".',
            chunkHighlight: 'Sounds great! Should we [SUGGESTION]?',
          },
        ],
        expectedKeywords: ['sounds', 'interesting', 'great', 'time', 'meet', 'love', 'join', 'station', 'where'],
      },
      {
        turnNumber: 2,
        aiPrompt: 'How about two o’clock near the main entrance? We can grab bubble tea right after that.',
        aiPromptMeaningId: 'Bagaimana kalau jam dua siang di dekat pintu masuk utama? Kita bisa beli bubble tea setelah itu.',
        contextObjective: 'Setujui waktu pertemuan tersebut dan konfirmasi kehadiranmu dengan santai.',
        hints: [
          {
            id: 'h-w2-1',
            englishText: 'Two o’clock sounds perfect for me. See you near the entrance!',
            indonesianMeaning: 'Jam dua siang pas banget buat saya. Sampai jumpa di dekat pintu masuk!',
            phoneticFocus: 'Vokal /ɜː/ pada "perfect" dan desis /s/ pada "sounds".',
            chunkHighlight: '[TIME] sounds perfect for me. See you [PLACE]!',
          },
          {
            id: 'h-w2-2',
            englishText: 'That works great for me. I will see you on Saturday at two o’clock.',
            indonesianMeaning: 'Cocok banget buat saya. Sampai ketemu hari Sabtu jam dua.',
            phoneticFocus: 'Akhiran -s pada "works" dan letupan /t/ pada "Saturday".',
            chunkHighlight: 'That works great for me. See you [TIME].',
          },
          {
            id: 'h-w2-3',
            englishText: 'Sounds like a plan! Let me know if anything changes before Saturday.',
            indonesianMeaning: 'Sepakat! Kabari saya jika ada perubahan sebelum hari Sabtu ya.',
            phoneticFocus: 'Bunyi /z/ lembut pada "changes" dan ritme santai.',
            chunkHighlight: 'Sounds like a plan! Let me know if [CONDITION].',
          },
        ],
        expectedKeywords: ['two', 'perfect', 'see', 'entrance', 'works', 'great', 'plan', 'saturday'],
      },
    ],
    closingMessage: 'Awesome! It is a plan then. Looking forward to catching up on Saturday afternoon!',
  },
];

/**
 * Filter skenario roleplay berdasarkan tujuan dan tingkatan belajar
 */
export function getRoleplayScenariosByFilter(
  goal?: UserLearningGoal,
  tier?: UserProficiencyTier
): RoleplayScenario[] {
  return ROLEPLAY_SCENARIOS.filter((sc) => {
    if (goal && sc.goal !== goal) return false;
    if (tier && sc.tier !== tier) return false;
    return true;
  });
}

/**
 * Mendapatkan skenario roleplay berdasarkan id
 */
export function getRoleplayScenarioById(id: string): RoleplayScenario | undefined {
  return ROLEPLAY_SCENARIOS.find((sc) => sc.id === id);
}

/**
 * Generator Skenario Roleplay Kustom Prosedural Berbasis Permintaan Pengguna
 * Mengubah topik bebas pengguna (misal: "Wawancara kerja di Tokopedia", "Sidang skripsi Bab 4")
 * menjadi simulasi mikro 2 putaran lengkap dengan bilingual hints dan IPA focus.
 */
export function generateCustomRoleplayScenario(params: {
  topic: string;
  interlocutorRole?: string;
  goal?: UserLearningGoal;
  tier?: UserProficiencyTier;
}): RoleplayScenario {
  const cleanTopic = params.topic.trim();
  const lower = cleanTopic.toLowerCase();
  const tier = params.tier || 'B1';
  const goal = params.goal || 'career';
  const id = `custom-${Date.now()}`;

  // 1. Kategori Wawancara Kerja / Career Interview
  if (
    lower.includes('interview') ||
    lower.includes('wawancara') ||
    lower.includes('kerja') ||
    lower.includes('magang') ||
    lower.includes('job')
  ) {
    const role = params.interlocutorRole || 'Lead Technical Interviewer';
    return {
      id,
      title: cleanTopic || 'Simulasi Wawancara Kerja Profesional',
      goal: 'career',
      tier,
      partnerRole: role,
      partnerAvatarEmoji: '💼',
      location: 'Virtual Interview Room, Tech HQ',
      mission: `Jawab pertanyaan wawancara seputar pengalaman kerja dan keahlian teknis Anda secara meyakinkan dan terstruktur.`,
      turns: [
        {
          turnNumber: 1,
          aiPrompt: `Hello and welcome! Thank you for taking the time to meet with us today. Could you briefly introduce yourself and share what motivated you to apply?`,
          aiPromptMeaningId: `Halo dan selamat datang! Terima kasih telah meluangkan waktu hari ini. Bisakah Anda memperkenalkan diri secara singkat dan apa motivasi Anda melamar?`,
          contextObjective: `Sapa pewawancara, perkenalkan nama dan latar belakang spesialisasi Anda dengan percaya diri.`,
          hints: [
            {
              id: `${id}-h1`,
              englishText: `Thank you for having me. My background is in software engineering, and I am particularly passionate about building high-performance systems.`,
              indonesianMeaning: `Terima kasih atas kesempatannya. Latar belakang saya adalah rekayasa perangkat lunak, dan saya sangat bersemangat membangun sistem berperforma tinggi.`,
              phoneticFocus: `Tekankan "particularly" /pərˈtɪkjələrli/ dan "passionate" /ˈpæʃənət/.`,
              chunkHighlight: `Thank you for having me. My background is in [FIELD].`,
            },
          ],
          expectedKeywords: ['thank', 'background', 'engineering', 'excited', 'passionate', 'experience'],
        },
        {
          turnNumber: 2,
          aiPrompt: `That sounds impressive. Could you tell me about a challenging situation you encountered in your previous project and how you resolved it?`,
          aiPromptMeaningId: `Terdengar mengesankan. Bisakah ceritakan tantangan tersulit yang pernah Anda hadapi di proyek sebelumnya dan bagaimana Anda menyelesaikannya?`,
          contextObjective: `Jelaskan kendala teknis atau kolaborasi tim menggunakan metode STAR (Situation, Task, Action, Result).`,
          hints: [
            {
              id: `${id}-h2`,
              englishText: `In our last release, we encountered an unexpected performance bottleneck. I conducted profiling and optimized the database queries, which reduced latency by forty percent.`,
              indonesianMeaning: `Pada rilis terakhir, kami menemui kendala bottleneck performa. Saya melakukan profiling dan optimasi query database, yang berhasil memangkas latency hingga 40%.`,
              phoneticFocus: `Tekanan pada "bottleneck" (BOT-tle-neck) dan "optimized" (OP-ti-maizd).`,
              chunkHighlight: `We encountered a [CHALLENGE], so I [ACTION] which resulted in [RESULT].`,
            },
          ],
          expectedKeywords: ['project', 'encountered', 'optimized', 'resolved', 'team', 'latency', 'solution'],
        },
      ],
      closingMessage: `Excellent explanation! You communicated your experience with great clarity and professionalism. Best of luck with your career goals!`,
    };
  }

  // 2. Kategori Sidang Skripsi / Akademis
  if (
    lower.includes('skripsi') ||
    lower.includes('thesis') ||
    lower.includes('dosen') ||
    lower.includes('sidang') ||
    lower.includes('penelitian')
  ) {
    const role = params.interlocutorRole || 'Ketua Dewan Penguji Skripsi';
    return {
      id,
      title: cleanTopic || 'Simulasi Ujian Sidang Skripsi / Thesis Defense',
      goal: 'academic',
      tier,
      partnerRole: role,
      partnerAvatarEmoji: '🎓',
      location: 'Ruang Sidang Akademik',
      mission: `Pertahankan metodologi penelitian dan jelaskan temuan statistik tugas akhir Anda di hadapan dewan penguji.`,
      turns: [
        {
          turnNumber: 1,
          aiPrompt: `Welcome to your thesis defense. Could you explain the core problem your research addresses and why existing solutions were insufficient?`,
          aiPromptMeaningId: `Selamat datang di sidang tugas akhir Anda. Bisakah Anda jelaskan masalah inti yang diteliti dan mengapa solusi yang ada sebelumnya belum memadai?`,
          contextObjective: `Jelaskan latar belakang masalah dan gap penelitian dengan terminologi akademis baku.`,
          hints: [
            {
              id: `${id}-h1`,
              englishText: `Thank you, Professor. The main challenge is that traditional methods lack real-time feedback for spoken fluency, which our proposed system aims to solve.`,
              indonesianMeaning: `Terima kasih, Profesor. Tantangan utamanya adalah metode tradisional kurang memiliki umpan balik real-time untuk kelancaran berbicara, yang ingin diselesaikan oleh sistem usulan kami.`,
              phoneticFocus: `Bunyi /θ/ pada "thank" dan artikulasi jelas pada "traditional" /trəˈdɪʃənəl/.`,
              chunkHighlight: `The main challenge is that [PROBLEM], which our research addresses by [SOLUTION].`,
            },
          ],
          expectedKeywords: ['thank', 'professor', 'research', 'problem', 'system', 'method', 'traditional'],
        },
        {
          turnNumber: 2,
          aiPrompt: `Interesting. How did you validate your results, and what empirical evidence demonstrates the effectiveness of your model?`,
          aiPromptMeaningId: `Menarik. Bagaimana Anda memvalidasi hasil penelitian, dan bukti empiris apa yang membuktikan efektivitas model Anda?`,
          contextObjective: `Paparkan hasil uji statistik (paired t-test, p-value, dan gain efektivitas) secara lugas.`,
          hints: [
            {
              id: `${id}-h2`,
              englishText: `We evaluated the system with thirty participants using a paired samples t-test. The results indicated a statistically significant improvement with a p-value below point zero five.`,
              indonesianMeaning: `Kami mengevaluasi sistem dengan tiga puluh partisipan menggunakan uji paired samples t-test. Hasil menunjukkan peningkatan signifikan secara statistik dengan nilai p di bawah 0.05.`,
              phoneticFocus: `Tekankan "statistically" /stəˈtɪstɪkli/ dan "significant" /sɪɡˈnɪfɪkənt/.`,
              chunkHighlight: `We evaluated the system using [METHOD], which demonstrated a statistically significant improvement.`,
            },
          ],
          expectedKeywords: ['evaluated', 'statistically', 'significant', 'participants', 'test', 'results', 'value'],
        },
      ],
      closingMessage: `Outstanding defense! You articulated your empirical methodology and findings with academic rigor and composure!`,
    };
  }

  // 3. Fallback Umum Dinamis untuk Skenario Apapun
  const role = params.interlocutorRole || 'Partner Percakapan Native';
  return {
    id,
    title: cleanTopic || 'Latihan Percakapan Tematik Khusus',
    goal,
    tier,
    partnerRole: role,
    partnerAvatarEmoji: '💬',
    location: 'Skenario Mandiri Interaktif',
    mission: `Berlatih percakapan santai namun efektif dengan fokus pada "${cleanTopic}".`,
    turns: [
      {
        turnNumber: 1,
        aiPrompt: `Hello! I understand you would like to discuss "${cleanTopic}". Where should we begin?`,
        aiPromptMeaningId: `Halo! Saya dengar Anda ingin membahas "${cleanTopic}". Dari mana sebaiknya kita mulai?`,
        contextObjective: `Jelaskan poin utama atau situasi yang ingin Anda sampaikan secara santun.`,
        hints: [
          {
            id: `${id}-h1`,
            englishText: `I would like to walk you through the key points regarding this situation, starting with our main priority.`,
            indonesianMeaning: `Saya ingin menjelaskan poin-poin utama terkait situasi ini, dimulai dari prioritas utama kita.`,
            phoneticFocus: `Huruf "l" pada "would" dan "walk" adalah silent letter.`,
            chunkHighlight: `I would like to walk you through [TOPIC], starting with [PRIORITY].`,
          },
        ],
        expectedKeywords: ['would', 'like', 'discuss', 'points', 'priority', 'situation', 'start'],
      },
      {
        turnNumber: 2,
        aiPrompt: `That makes complete sense. How do you propose we move forward, and what would be the ideal outcome?`,
        aiPromptMeaningId: `Itu sangat masuk akal. Bagaimana usulan Anda untuk langkah selanjutnya, dan apa hasil ideal yang diharapkan?`,
        contextObjective: `Berikan rekomendasi tindakan selanjutnya dengan bahasa diplomatis.`,
        hints: [
          {
            id: `${id}-h2`,
            englishText: `My recommendation is that we review the options together and agree on a timeline that works for everyone.`,
            indonesianMeaning: `Rekomendasi saya adalah kita meninjau opsi-opsi bersama dan menyepakati linimasa yang cocok untuk semua orang.`,
            phoneticFocus: `Tekanan pada "recommendation" /ˌrekəmenˈdeɪʃən/ di suku kata keempat.`,
            chunkHighlight: `My recommendation is that we [ACTION] and agree on [GOAL].`,
          },
        ],
        expectedKeywords: ['recommendation', 'options', 'together', 'agree', 'timeline', 'forward', 'step'],
      },
    ],
    closingMessage: `Fantastic conversation! You expressed your thoughts clearly and navigated the topic with confidence!`,
  };
}


