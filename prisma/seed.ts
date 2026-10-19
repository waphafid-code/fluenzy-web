import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Fluenzy database seeding...');

  // 1. Reset existing data in correct dependency order
  await prisma.reviewSchedule.deleteMany();
  await prisma.answerLog.deleteMany();
  await prisma.userSkillMastery.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.dailyActivity.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.question.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.course.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 2. Create Skills
  const skillsData = [
    {
      id: 'skill-present',
      name: 'Simple Present & Daily Routines',
      description: 'Pola kalimat kejadian berulang, fakta umum, dan kebiasaan sehari-hari.',
    },
    {
      id: 'skill-past',
      name: 'Simple Past & Irregular Verbs',
      description: 'Bentuk lampau untuk menceritakan peristiwa masa lalu dan perubahan kata kerja tak beraturan.',
    },
    {
      id: 'skill-prepositions',
      name: 'Prepositions of Place & Time',
      description: 'Penggunaan kata depan in, on, at untuk waktu dan lokasi secara tepat.',
    },
    {
      id: 'skill-sva',
      name: 'Subject-Verb Agreement',
      description: 'Kesesuaian antara subjek tunggal/jamak dengan kata kerja pembantu (is/am/are/do/does).',
    },
    {
      id: 'skill-vocab-food',
      name: 'Food & Dining Vocabulary',
      description: 'Kosakata makanan, minuman, memesan di restoran, dan ungkapan kesukaan.',
    },
  ];

  const createdSkills: Record<string, string> = {};
  for (const s of skillsData) {
    const created = await prisma.skill.create({ data: s });
    createdSkills[s.id] = created.id;
  }
  console.log(`✅ Created ${skillsData.length} core skills.`);

  // 3. Create Course, Units & Lessons
  const course = await prisma.course.create({
    data: {
      id: 'course-en-a1',
      title: 'English for Beginners (A1-A2)',
      description: 'Fondasi bahasa Inggris praktis untuk penutur bahasa Indonesia.',
      language: 'en',
      targetLanguage: 'id',
      order: 1,
      units: {
        create: [
          {
            id: 'unit-1',
            title: 'Unit 1: Perkenalan & Rutinitas',
            description: 'Memulai percakapan dasar, mendeskripsikan aktivitas harian.',
            order: 1,
            lessons: {
              create: [
                { id: 'lesson-1', title: 'Pelajaran 1: Salam & Kebiasaan Pagi', order: 1 },
                { id: 'lesson-2', title: 'Pelajaran 2: Makanan & Minuman Favorit', order: 2 },
              ],
            },
          },
          {
            id: 'unit-2',
            title: 'Unit 2: Waktu, Lokasi & Masa Lalu',
            description: 'Menyatakan jam, tempat berada, dan menceritakan liburan.',
            order: 2,
            lessons: {
              create: [
                { id: 'lesson-3', title: 'Pelajaran 3: Di Mana dan Kapan?', order: 1 },
                { id: 'lesson-4', title: 'Pelajaran 4: Cerita Kemarin & Akhir Pekan', order: 2 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('✅ Created curriculum hierarchy (Course -> Units -> Lessons).');

  // 4. Questions: Minimal 10 soal per skill dengan variasi difficulty (1-5) dan tipe
  const rawQuestions = [
    // =========================================================================
    // SKILL 1: Simple Present & Daily Routines (10 Soal)
    // =========================================================================
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'multiple_choice',
      difficulty: 1,
      prompt: 'Pilihlah bentuk kata kerja yang tepat: "She _____ coffee every morning."',
      payload: JSON.stringify({
        options: ['drink', 'drinks', 'drinking', 'drank'],
        correctAnswer: 'drinks',
      }),
      explanation: 'Subjek tunggal orang ketiga (she/he/it) pada Simple Present Tense membutuhkan akhiran -s/-es pada verb dasar.',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'fill_blank',
      difficulty: 1,
      prompt: 'Ketik terjemahan bahasa Inggris dari: "Saya bangun jam 6 pagi."',
      payload: JSON.stringify({
        correctAnswer: 'I wake up at 6 am',
        acceptableAnswers: ['i wake up at 6 am', 'i get up at 6 am'],
      }),
      explanation: '"Wake up" atau "get up" adalah phrasal verb untuk bangun tidur, dan preposisi jam menggunakan "at".',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'word_order',
      difficulty: 2,
      prompt: 'Susun kata-kata berikut menjadi kalimat yang benar: "school / they / to / walk / always"',
      payload: JSON.stringify({
        tokens: ['They', 'always', 'walk', 'to', 'school'],
        correctAnswer: 'They always walk to school',
      }),
      explanation: 'Adverb of frequency (always) diletakkan di antara subjek (They) dan kata kerja utama (walk).',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'multiple_choice',
      difficulty: 2,
      prompt: 'Bentuk kalimat tanya yang benar: "_____ you live in Jakarta?"',
      payload: JSON.stringify({
        options: ['Does', 'Do', 'Are', 'Is'],
        correctAnswer: 'Do',
      }),
      explanation: 'Untuk subjek "you" pada kalimat tanya Simple Present Tense, kata bantu yang digunakan adalah "Do".',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'fill_blank',
      difficulty: 3,
      prompt: 'Lengkapilah kalimat negatif berikut: "He _____ not like spicy food."',
      payload: JSON.stringify({
        correctAnswer: 'does',
        acceptableAnswers: ['does'],
      }),
      explanation: 'Bentuk negatif untuk subjek orang ketiga tunggal (he) menggunakan "does not" + verb 1.',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'word_order',
      difficulty: 3,
      prompt: 'Susun kalimat tanya: "breakfast / what time / have / do / you / ?"',
      payload: JSON.stringify({
        tokens: ['What time', 'do', 'you', 'have', 'breakfast', '?'],
        correctAnswer: 'What time do you have breakfast ?',
      }),
      explanation: 'Struktur WH-Question: Question Word (What time) + Auxiliary (do) + Subject (you) + Verb (have) + Object.',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'matching',
      difficulty: 3,
      prompt: 'Pasangkan subjek dengan kata kerja yang bersesuaian:',
      payload: JSON.stringify({
        pairs: [
          { left: 'The sun', right: 'rises in the east' },
          { left: 'Birds', right: 'fly in the sky' },
          { left: 'Water', right: 'boils at 100 degrees' },
        ],
      }),
      explanation: 'Subjek tunggal/uncountable mengambil verb berakhiran -s, sedangkan jamak (birds) mengambil verb dasar.',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'multiple_choice',
      difficulty: 4,
      prompt: 'Manakah kalimat yang menyatakan fakta umum (general truth)?',
      payload: JSON.stringify({
        options: [
          'The earth revolves around the sun.',
          'The earth is revolving right now.',
          'The earth revolved yesterday.',
          'The earth will revolve tomorrow.',
        ],
        correctAnswer: 'The earth revolves around the sun.',
      }),
      explanation: 'Hukum alam dan fakta ilmiah universal selalu menggunakan Simple Present Tense.',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'fill_blank',
      difficulty: 4,
      prompt: 'Ubah ke bentuk orang ketiga tunggal: "My sister _____ (study) English every day."',
      payload: JSON.stringify({
        correctAnswer: 'studies',
        acceptableAnswers: ['studies'],
      }),
      explanation: 'Kata kerja berakhiran konsonan + y (study) berubah menjadi -ies (studies).',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-present',
      type: 'word_order',
      difficulty: 5,
      prompt: 'Susun kalimat kompleks: "rarely / he / goes / bed / to / before / midnight"',
      payload: JSON.stringify({
        tokens: ['He', 'rarely', 'goes', 'to', 'bed', 'before', 'midnight'],
        correctAnswer: 'He rarely goes to bed before midnight',
      }),
      explanation: 'Adverb "rarely" mendahului main verb "goes", diikuti prepositional phrases "to bed" dan "before midnight".',
    },

    // =========================================================================
    // SKILL 2: Simple Past & Irregular Verbs (10 Soal)
    // =========================================================================
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'multiple_choice',
      difficulty: 1,
      prompt: 'Bentuk past tense (V2) dari kata kerja "go" adalah:',
      payload: JSON.stringify({
        options: ['goed', 'went', 'gone', 'going'],
        correctAnswer: 'went',
      }),
      explanation: '"Go" adalah irregular verb. Bentuk lampaunya (Past Tense) adalah "went".',
    },
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'fill_blank',
      difficulty: 1,
      prompt: 'Ketik bentuk lampau (V2) dari kata kerja "eat":',
      payload: JSON.stringify({
        correctAnswer: 'ate',
        acceptableAnswers: ['ate'],
      }),
      explanation: 'Bentuk kedua dari kata kerja "eat" adalah "ate".',
    },
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'word_order',
      difficulty: 2,
      prompt: 'Susun kalimat lampau: "yesterday / watched / a movie / we"',
      payload: JSON.stringify({
        tokens: ['We', 'watched', 'a movie', 'yesterday'],
        correctAnswer: 'We watched a movie yesterday',
      }),
      explanation: 'Struktur kalimat lampau: Subject (We) + Past Verb (watched) + Object (a movie) + Time Signal (yesterday).',
    },
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'multiple_choice',
      difficulty: 2,
      prompt: 'Pilih bentuk negatif yang benar: "She _____ to the party last night."',
      payload: JSON.stringify({
        options: ["didn't came", "didn't come", "not came", "wasn't come"],
        correctAnswer: "didn't come",
      }),
      explanation: 'Setelah auxiliary verb "did not / didn\'t", kata kerja harus kembali ke bentuk dasar (bare infinitive / V1 "come").',
    },
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'fill_blank',
      difficulty: 3,
      prompt: 'Bentuk lampau dari "buy" adalah:',
      payload: JSON.stringify({
        correctAnswer: 'bought',
        acceptableAnswers: ['bought'],
      }),
      explanation: 'Bentuk kedua dari kata kerja tak beraturan "buy" adalah "bought".',
    },
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'matching',
      difficulty: 3,
      prompt: 'Pasangkan kata kerja dasar (V1) dengan bentuk lampaunya (V2):',
      payload: JSON.stringify({
        pairs: [
          { left: 'write', right: 'wrote' },
          { left: 'see', right: 'saw' },
          { left: 'take', right: 'took' },
        ],
      }),
      explanation: 'Perubahan irregular verbs: write -> wrote, see -> saw, take -> took.',
    },
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'word_order',
      difficulty: 3,
      prompt: 'Susun kalimat tanya lampau: "did / find / where / your keys / you / ?"',
      payload: JSON.stringify({
        tokens: ['Where', 'did', 'you', 'find', 'your keys', '?'],
        correctAnswer: 'Where did you find your keys ?',
      }),
      explanation: 'Rumus tanya lampau: WH-Word (Where) + did + Subject (you) + Verb 1 (find) + Object?',
    },
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'multiple_choice',
      difficulty: 4,
      prompt: 'Pilihlah pasangan yang salah antara V1 dan V2:',
      payload: JSON.stringify({
        options: ['bring - brought', 'catch - catched', 'teach - taught', 'think - thought'],
        correctAnswer: 'catch - catched',
      }),
      explanation: 'Bentuk lampau dari "catch" adalah "caught", bukan "catched".',
    },
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'fill_blank',
      difficulty: 4,
      prompt: 'Isi dengan to be lampau yang tepat: "They _____ very tired after the trip."',
      payload: JSON.stringify({
        correctAnswer: 'were',
        acceptableAnswers: ['were'],
      }),
      explanation: 'Subjek jamak "They" menggunakan past to be "were" (bukan "was").',
    },
    {
      lessonId: 'lesson-4',
      skillId: 'skill-past',
      type: 'word_order',
      difficulty: 5,
      prompt: 'Susun kalimat naratif: "although / rained / it / enjoyed / we / our holiday"',
      payload: JSON.stringify({
        tokens: ['Although', 'it', 'rained', 'we', 'enjoyed', 'our holiday'],
        correctAnswer: 'Although it rained we enjoyed our holiday',
      }),
      explanation: 'Klausa konsesif "Although it rained" diikuti oleh klausa utama dengan kedua verba dalam bentuk lampau.',
    },

    // =========================================================================
    // SKILL 3: Prepositions of Place & Time (10 Soal)
    // =========================================================================
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'multiple_choice',
      difficulty: 1,
      prompt: 'Preposisi yang tepat untuk hari: "I will meet you _____ Monday."',
      payload: JSON.stringify({
        options: ['at', 'on', 'in', 'by'],
        correctAnswer: 'on',
      }),
      explanation: 'Nama hari dan tanggal spesifik selalu menggunakan preposisi "on".',
    },
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'fill_blank',
      difficulty: 1,
      prompt: 'Ketik preposisi waktu yang tepat: "The train leaves _____ 8:30 PM."',
      payload: JSON.stringify({
        correctAnswer: 'at',
        acceptableAnswers: ['at'],
      }),
      explanation: 'Waktu jam yang presisi selalu menggunakan preposisi "at".',
    },
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'multiple_choice',
      difficulty: 2,
      prompt: 'Preposisi tempat untuk kota atau negara: "She lives _____ Bandung."',
      payload: JSON.stringify({
        options: ['in', 'on', 'at', 'into'],
        correctAnswer: 'in',
      }),
      explanation: 'Area geografis besar seperti kota, provinsi, dan negara menggunakan "in".',
    },
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'word_order',
      difficulty: 2,
      prompt: 'Susun kalimat: "the table / the book / is / on"',
      payload: JSON.stringify({
        tokens: ['The book', 'is', 'on', 'the table'],
        correctAnswer: 'The book is on the table',
      }),
      explanation: 'Preposisi "on" digunakan untuk menunjukkan posisi di atas permukaan datar.',
    },
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'fill_blank',
      difficulty: 3,
      prompt: 'Ketik preposisi untuk tahun/bulan: "Indonesia became independent _____ 1945."',
      payload: JSON.stringify({
        correctAnswer: 'in',
        acceptableAnswers: ['in'],
      }),
      explanation: 'Tahun, bulan, abad, dan musim menggunakan preposisi "in".',
    },
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'matching',
      difficulty: 3,
      prompt: 'Pasangkan waktu dengan preposisi yang tepat:',
      payload: JSON.stringify({
        pairs: [
          { left: 'night', right: 'at' },
          { left: 'Friday evening', right: 'on' },
          { left: 'the morning', right: 'in' },
        ],
      }),
      explanation: '"at night", "in the morning", dan "on Friday evening" (karena ada nama hari).',
    },
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'multiple_choice',
      difficulty: 4,
      prompt: 'Pilihlah penggunaan preposisi alamat yang paling tepat:',
      payload: JSON.stringify({
        options: [
          'He lives at 45 Merdeka Street.',
          'He lives on 45 Merdeka Street.',
          'He lives in 45 Merdeka Street.',
          'He lives by 45 Merdeka Street.',
        ],
        correctAnswer: 'He lives at 45 Merdeka Street.',
      }),
      explanation: 'Alamat lengkap beserta nomor bangunan menggunakan preposisi spesifik "at".',
    },
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'word_order',
      difficulty: 4,
      prompt: 'Susun kalimat: "waiting / at / bus stop / the / she / is"',
      payload: JSON.stringify({
        tokens: ['She', 'is', 'waiting', 'at', 'the bus stop'],
        correctAnswer: 'She is waiting at the bus stop',
      }),
      explanation: 'Titik temu spesifik (point of location) menggunakan preposisi "at".',
    },
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'fill_blank',
      difficulty: 5,
      prompt: 'Lengkapi frasa idiomatik: "We arrived _____ the airport just in time."',
      payload: JSON.stringify({
        correctAnswer: 'at',
        acceptableAnswers: ['at'],
      }),
      explanation: '"Arrive at" digunakan untuk bangunan publik (airport, station), sedangkan "arrive in" untuk kota/negara.',
    },
    {
      lessonId: 'lesson-3',
      skillId: 'skill-prepositions',
      type: 'multiple_choice',
      difficulty: 5,
      prompt: 'Manakah kalimat dengan preposisi yang keliru?',
      payload: JSON.stringify({
        options: [
          'I was born in October.',
          'I was born on October 15th.',
          'I was born in Monday.',
          'I was born at 3 PM.',
        ],
        correctAnswer: 'I was born in Monday.',
      }),
      explanation: '"in Monday" salah, seharusnya "on Monday" karena merupakan nama hari.',
    },

    // =========================================================================
    // SKILL 4: Subject-Verb Agreement (10 Soal)
    // =========================================================================
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'multiple_choice',
      difficulty: 1,
      prompt: 'Pilihlah to be yang sesuai: "The students _____ studying in the library."',
      payload: JSON.stringify({
        options: ['is', 'are', 'am', 'be'],
        correctAnswer: 'are',
      }),
      explanation: 'Subjek jamak "The students" berpasangan dengan to be "are".',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'fill_blank',
      difficulty: 1,
      prompt: 'Ketik to be yang sesuai: "Either he or I _____ going to lead the meeting."',
      payload: JSON.stringify({
        correctAnswer: 'am',
        acceptableAnswers: ['am'],
      }),
      explanation: 'Pada struktur "Either ... or", kata kerja menyesuaikan dengan subjek yang paling dekat ("I" -> "am").',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'multiple_choice',
      difficulty: 2,
      prompt: '"Everyone in the room _____ listening attentively."',
      payload: JSON.stringify({
        options: ['is', 'are', 'were', 'have'],
        correctAnswer: 'is',
      }),
      explanation: 'Indefinite pronoun seperti "Everyone", "Somebody", "Nobody" diperlakukan sebagai subjek tunggal (singular).',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'word_order',
      difficulty: 2,
      prompt: 'Susun kalimat: "has / cat / the / milk / drank"',
      payload: JSON.stringify({
        tokens: ['The cat', 'has', 'drank', 'milk'],
        correctAnswer: 'The cat has drank milk',
      }),
      explanation: 'Subjek tunggal "The cat" menggunakan auxiliary "has".',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'matching',
      difficulty: 3,
      prompt: 'Pasangkan subjek dengan kata kerja bantu (auxiliary) yang cocok:',
      payload: JSON.stringify({
        pairs: [
          { left: 'Each student', right: 'has a locker' },
          { left: 'All students', right: 'have lockers' },
          { left: 'Neither answer', right: 'is correct' },
        ],
      }),
      explanation: '"Each" dan "Neither" mengambil singular verb, sedangkan "All" dengan countable plural mengambil plural verb.',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'fill_blank',
      difficulty: 3,
      prompt: 'Isi dengan "have" atau "has": "A pair of shoes _____ been found."',
      payload: JSON.stringify({
        correctAnswer: 'has',
        acceptableAnswers: ['has'],
      }),
      explanation: 'Inti subjek adalah frasa tunggal "A pair", sehingga kata kerjanya adalah "has".',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'multiple_choice',
      difficulty: 4,
      prompt: '"The team _____ playing exceptionally well this season."',
      payload: JSON.stringify({
        options: ['is', 'are', 'were', 'have'],
        correctAnswer: 'is',
      }),
      explanation: 'Collective nouns (team, committee) yang bertindak sebagai satu kesatuan utuh mengambil kata kerja tunggal "is".',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'word_order',
      difficulty: 4,
      prompt: 'Susun kalimat: "neither / my friends / nor / my brother / knows / the answer"',
      payload: JSON.stringify({
        tokens: ['Neither', 'my friends', 'nor', 'my brother', 'knows', 'the answer'],
        correctAnswer: 'Neither my friends nor my brother knows the answer',
      }),
      explanation: 'Verb "knows" disesuaikan dengan subjek terdekat "my brother" (singular).',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'fill_blank',
      difficulty: 5,
      prompt: 'Isi dengan bentuk present dari "make": "Ten kilometers _____ a long distance to walk."',
      payload: JSON.stringify({
        correctAnswer: 'is',
        acceptableAnswers: ['is'],
      }),
      explanation: 'Satuan ukuran, jarak, uang, dan waktu dipandang sebagai satu unit tunggal, sehingga menggunakan singular "is".',
    },
    {
      lessonId: 'lesson-1',
      skillId: 'skill-sva',
      type: 'multiple_choice',
      difficulty: 5,
      prompt: 'Manakah kalimat yang secara gramatikal benar?',
      payload: JSON.stringify({
        options: [
          'The news is very surprising today.',
          'The news are very surprising today.',
          'The news were very surprising today.',
          'The news have been surprising today.',
        ],
        correctAnswer: 'The news is very surprising today.',
      }),
      explanation: 'Kata "news" adalah uncountable noun berakhiran -s yang selalu mengambil singular verb "is".',
    },

    // =========================================================================
    // SKILL 5: Food & Dining Vocabulary (10 Soal)
    // =========================================================================
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'multiple_choice',
      difficulty: 1,
      prompt: 'Arti dari kata "apple" dalam bahasa Indonesia adalah:',
      payload: JSON.stringify({
        options: ['Apel', 'Jeruk', 'Pisang', 'Mangga'],
        correctAnswer: 'Apel',
      }),
      explanation: '"Apple" berarti buah apel.',
    },
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'fill_blank',
      difficulty: 1,
      prompt: 'Ketik kata bahasa Inggris untuk "air putih / air minum":',
      payload: JSON.stringify({
        correctAnswer: 'water',
        acceptableAnswers: ['water', 'mineral water'],
      }),
      explanation: 'Kata dasar untuk air minum adalah "water".',
    },
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'word_order',
      difficulty: 2,
      prompt: 'Susun kalimat pemesanan: "a cup of coffee / like / I / would / please"',
      payload: JSON.stringify({
        tokens: ['I', 'would like', 'a cup of coffee', 'please'],
        correctAnswer: 'I would like a cup of coffee please',
      }),
      explanation: 'Ungkapan sopan memesan: "I would like [item] please".',
    },
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'matching',
      difficulty: 2,
      prompt: 'Pasangkan rasa makanan berikut:',
      payload: JSON.stringify({
        pairs: [
          { left: 'Sweet', right: 'Sugar / Candy' },
          { left: 'Sour', right: 'Lemon / Vinegar' },
          { left: 'Bitter', right: 'Black Coffee' },
        ],
      }),
      explanation: 'Sweet = manis, Sour = asam, Bitter = pahit.',
    },
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'multiple_choice',
      difficulty: 3,
      prompt: 'Apa istilah untuk makanan pembuka dalam menu restoran?',
      payload: JSON.stringify({
        options: ['Appetizer', 'Main Course', 'Dessert', 'Beverage'],
        correctAnswer: 'Appetizer',
      }),
      explanation: 'Appetizer = hidangan pembuka, Main course = hidangan utama, Dessert = pencuci mulut.',
    },
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'fill_blank',
      difficulty: 3,
      prompt: 'Ketik ungkapan meminta tagihan di restoran: "Can we have the _____, please?"',
      payload: JSON.stringify({
        correctAnswer: 'bill',
        acceptableAnswers: ['bill', 'check'],
      }),
      explanation: '"The bill" (British) atau "the check" (American) adalah nota pembayaran di restoran.',
    },
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'word_order',
      difficulty: 3,
      prompt: 'Susun kalimat: "delicious / this soup / tastes / really"',
      payload: JSON.stringify({
        tokens: ['This soup', 'tastes', 'really', 'delicious'],
        correctAnswer: 'This soup tastes really delicious',
      }),
      explanation: 'Linking verb "tastes" diikuti oleh adjective phrase "really delicious".',
    },
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'multiple_choice',
      difficulty: 4,
      prompt: 'Seseorang yang tidak memakan daging sama sekali disebut:',
      payload: JSON.stringify({
        options: ['Vegetarian', 'Carnivore', 'Omnivore', 'Pescatarian'],
        correctAnswer: 'Vegetarian',
      }),
      explanation: 'Vegetarian adalah pola makan berbasis nabati tanpa daging hewan.',
    },
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'fill_blank',
      difficulty: 4,
      prompt: 'Ketik kata kerja memasak dengan minyak panas: "to _____ potatoes"',
      payload: JSON.stringify({
        correctAnswer: 'fry',
        acceptableAnswers: ['fry', 'deep fry'],
      }),
      explanation: '"Fry" berarti menggoreng, dan olahan kentangnya disebut "french fries".',
    },
    {
      lessonId: 'lesson-2',
      skillId: 'skill-vocab-food',
      type: 'word_order',
      difficulty: 5,
      prompt: 'Susun kalimat restoran formal: "a table / book / for two / like to / we would"',
      payload: JSON.stringify({
        tokens: ['We would like to', 'book', 'a table', 'for two'],
        correctAnswer: 'We would like to book a table for two',
      }),
      explanation: 'Frasa reservasi formal: "We would like to book a table for two".',
    },
  ];

  for (const q of rawQuestions) {
    await prisma.question.create({
      data: {
        lessonId: q.lessonId,
        skillId: q.skillId,
        type: q.type,
        difficulty: q.difficulty,
        prompt: q.prompt,
        payload: q.payload,
        explanation: q.explanation,
      },
    });
  }
  console.log(`✅ Created ${rawQuestions.length} pedagogic questions (exactly 10 questions per skill).`);

  // 5. Create Demo Student User & Teacher User
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.create({
    data: {
      id: 'demo-user-1',
      name: 'Budi Santoso',
      email: 'budi@fluenzy.id',
      passwordHash,
      role: 'student',
      timezone: 'Asia/Jakarta',
      stats: {
        create: {
          totalXp: 280,
          gems: 150,
          hearts: 4,
          heartsUpdatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 menit yang lalu
          currentStreak: 5,
          longestStreak: 7,
          lastActiveDate: new Date().toISOString().split('T')[0],
          dailyGoalXp: 30,
          streakFreezeCount: 1,
        },
      },
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      id: 'teacher-user-1',
      name: 'Ibu Rahmawati, S.Pd.',
      email: 'guru@fluenzy.id',
      passwordHash,
      role: 'teacher',
      timezone: 'Asia/Jakarta',
    },
  });
  console.log('✅ Created Demo Student (budi@fluenzy.id) and Teacher (guru@fluenzy.id).');

  // 6. UserSkillMastery: Perlihatkan klasifikasi Lemah (<0.5), Sedang (0.5-0.8), dan Kuat (>0.8)
  const masteries = [
    {
      userId: demoUser.id,
      skillId: 'skill-prepositions',
      mastery: 0.32, // LEMAH -> Prioritas utama di "Latihan Titik Lemah"
      attempts: 12,
      correctCount: 4,
      avgResponseTimeMs: 6400,
      lastPracticedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      userId: demoUser.id,
      skillId: 'skill-sva',
      mastery: 0.44, // LEMAH -> Prioritas kedua di "Latihan Titik Lemah"
      attempts: 9,
      correctCount: 4,
      avgResponseTimeMs: 5100,
      lastPracticedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      userId: demoUser.id,
      skillId: 'skill-past',
      mastery: 0.48, // LEMAH -> Prioritas ketiga di "Latihan Titik Lemah"
      attempts: 15,
      correctCount: 7,
      avgResponseTimeMs: 4800,
      lastPracticedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      userId: demoUser.id,
      skillId: 'skill-present',
      mastery: 0.72, // SEDANG -> Sedang berkembang
      attempts: 25,
      correctCount: 18,
      avgResponseTimeMs: 3200,
      lastPracticedAt: new Date(),
    },
    {
      userId: demoUser.id,
      skillId: 'skill-vocab-food',
      mastery: 0.91, // KUAT -> Mahir
      attempts: 30,
      correctCount: 28,
      avgResponseTimeMs: 2100,
      lastPracticedAt: new Date(),
    },
  ];

  for (const m of masteries) {
    await prisma.userSkillMastery.create({ data: m });
  }
  console.log('✅ Created UserSkillMastery showing weak (<0.5), medium (0.5-0.8), and strong (>0.8) skills.');

  // 7. Seed Sample AnswerLogs with Taksonomi Kesalahan
  const sampleQuestions = await prisma.question.findMany({ take: 6 });
  const sampleLogs = [
    {
      userId: demoUser.id,
      questionId: sampleQuestions[0]?.id || 'q1',
      skillId: sampleQuestions[0]?.skillId || 'skill-present',
      exerciseType: 'fill_blank',
      userAnswer: 'aple',
      correctAnswer: 'apple',
      isCorrect: false,
      errorType: 'typo',
      responseTimeMs: 3200,
      attemptNumber: 1,
      hintUsed: false,
    },
    {
      userId: demoUser.id,
      questionId: sampleQuestions[1]?.id || 'q2',
      skillId: sampleQuestions[1]?.skillId || 'skill-present',
      exerciseType: 'word_order',
      userAnswer: 'walk they always to school',
      correctAnswer: 'they always walk to school',
      isCorrect: false,
      errorType: 'word_order',
      responseTimeMs: 7400,
      attemptNumber: 1,
      hintUsed: false,
    },
    {
      userId: demoUser.id,
      questionId: sampleQuestions[2]?.id || 'q3',
      skillId: sampleQuestions[2]?.skillId || 'skill-prepositions',
      exerciseType: 'fill_blank',
      userAnswer: 'I go school',
      correctAnswer: 'I go to school',
      isCorrect: false,
      errorType: 'missing_word',
      responseTimeMs: 4100,
      attemptNumber: 1,
      hintUsed: false,
    },
    {
      userId: demoUser.id,
      questionId: sampleQuestions[3]?.id || 'q4',
      skillId: sampleQuestions[3]?.skillId || 'skill-prepositions',
      exerciseType: 'multiple_choice',
      userAnswer: 'in',
      correctAnswer: 'on',
      isCorrect: false,
      errorType: 'wrong_choice',
      responseTimeMs: 2500,
      attemptNumber: 1,
      hintUsed: false,
    },
  ];

  for (const log of sampleLogs) {
    await prisma.answerLog.create({ data: log });
  }
  console.log(`✅ Created ${sampleLogs.length} sample AnswerLogs with errorType telemetry.`);

  // 8. Seed Sample ReviewSchedules across Leitner boxes (Boxes 1-5, including due items)
  const allQuestions = await prisma.question.findMany({ take: 5 });
  const reviewSchedules = [
    {
      userId: demoUser.id,
      questionId: allQuestions[0].id,
      box: 1,
      nextReviewAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Jatuh tempo 2 jam lalu (DUE!)
    },
    {
      userId: demoUser.id,
      questionId: allQuestions[1].id,
      box: 2,
      nextReviewAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Jatuh tempo kemarin (DUE!)
    },
    {
      userId: demoUser.id,
      questionId: allQuestions[2].id,
      box: 3,
      nextReviewAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 hari lagi
    },
    {
      userId: demoUser.id,
      questionId: allQuestions[3].id,
      box: 4,
      nextReviewAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari lagi
    },
    {
      userId: demoUser.id,
      questionId: allQuestions[4].id,
      box: 5,
      nextReviewAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 hari lagi
    },
  ];

  for (const rs of reviewSchedules) {
    await prisma.reviewSchedule.create({ data: rs });
  }
  console.log('✅ Created Leitner ReviewSchedules with due and upcoming reviews.');

  console.log('\n🎉 Fluenzy database seeded successfully!');
  console.log('👤 Demo User: budi@fluenzy.id / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
