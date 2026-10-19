# Arsitektur Sistem & Diagram Alur Data Fluenzy

Dokumen ini menjelaskan alur data menyeluruh (*end-to-end data pipeline*) platform bimbingan belajar adaptif **Fluenzy**, dari input siswa hingga pemutakhiran profil kognitif dan pemilihan butir soal pada sesi berikutnya.

---

## 1. Diagram Alur Data Siklus Belajar (Mermaid)

```mermaid
flowchart TD
    subgraph Client ["Sisi Klien (Frontend Next.js)"]
        UI["Siswa Menjawab Soal (/learn, /practice)"]
        Audio["Web Audio Feedback (Chime / Thud)"]
        Sheet["Feedback Sheet (Diagnosis & Penjelasan AI)"]
    end

    subgraph ErrorDiagnosis ["1. Mesin Diagnosis Kesalahan"]
        InputAnswer["userAnswer vs correctAnswer"]
        Classifier["classifyError() (Surface Strategy Taxonomy)"]
        ErrorTaxonomy{"Tipe Kesalahan"}
        ErrorTaxonomy -->|Jarak <= 2| Typo["Typo (Slip Ortografis)"]
        ErrorTaxonomy -->|Multiset Sama| WordOrder["Word Order (Pembalikan Urutan)"]
        ErrorTaxonomy -->|Delesi Kata| MissingWord["Missing Word (Omission)"]
        ErrorTaxonomy -->|Insersi Kata| ExtraWord["Extra Word (Addition)"]
        ErrorTaxonomy -->|Beda Leksikal| WrongWord["Wrong Word (Mistake Leksikal)"]
        ErrorTaxonomy -->|Pilihan Ganda| WrongChoice["Wrong Choice"]
    end

    subgraph Telemetry ["2. Penyimpanan Telemetri & Log"]
        AnswerLog[("Tabel AnswerLog\n- userId\n- questionId\n- errorType\n- responseTimeMs")]
    end

    subgraph CognitiveUpdate ["3. Mesin Pemutakhiran Kognitif"]
        EMA["calculateMasteryUpdate()\nmastery_baru = mastery_lama + α * (hasil - mastery_lama)"]
        Stats["calculateSkillStatsUpdate()\n(attempts, correctCount, avgResponseTimeMs)"]
        Decay["calculateDecayedMastery()\n(Ebbinghaus Forgetting Curve jika >7 hari inaktif)"]
        MasteryDB[("Tabel UserSkillMastery\n(0.0 - 1.0 Continual Value)")]
    end

    subgraph SpacedRepetition ["4. Sistem Kotak Leitner (SRS)"]
        Leitner["processReviewOutcome()"]
        BoxCheck{"Benar / Salah?"}
        BoxCheck -->|Benar| Promoted["Naik 1 Kotak (Maks 5)"]
        BoxCheck -->|Salah| Demoted["Reset ke Kotak 1"]
        ScheduleDB[("Tabel ReviewSchedule\n- box (1-5)\n- nextReviewAt (+1, 2, 4, 8, 16 hari)")]
    end

    subgraph Gamification ["5. Gamifikasi & Hati"]
        Hearts["calculateLazyHearts() & deductHeartOnIncorrect()\n(5 Kapasitas, -1 per salah, regen 30m)"]
        XP["calculateQuestionXp() (+10 XP, +3 Bonus Skill Lemah)"]
        StatsDB[("Tabel UserStats\n- hearts\n- totalXp\n- gems\n- streak")]
    end

    subgraph AdaptiveEngine ["6. Pemilih Soal Adaptif (Sesi Berikutnya)"]
        Quotas["calculateSessionQuotas()\n- 60% Materi Pelajaran Saat Ini\n- 25% Remedial 3 Skill Terlemah\n- 15% Review Jatuh Tempo Leitner"]
        DDA["adjustDifficulty() (Flow Channel)\n- 3 Benar Beruntun: Naik (+1)\n- 2 Salah Beruntun: Turun (-1)"]
        Selector["selectAdaptiveQuestions()\n(Dengan Graceful Fallback)"]
    end

    %% Relasi Alur Data
    UI --> InputAnswer
    InputAnswer --> Classifier
    Classifier --> ErrorTaxonomy
    ErrorTaxonomy --> AnswerLog

    Classifier -->|isCorrect, errorType| EMA
    EMA --> MasteryDB
    Stats --> MasteryDB
    Decay --> MasteryDB

    Classifier -->|isCorrect| Leitner
    Leitner --> BoxCheck
    Promoted --> ScheduleDB
    Demoted --> ScheduleDB

    Classifier -->|isCorrect| Hearts
    Classifier -->|isCorrect, isWeakSkill| XP
    Hearts --> StatsDB
    XP --> StatsDB

    MasteryDB -->|findWeakestSkills()| Quotas
    ScheduleDB -->|isReviewDue()| Quotas
    Quotas --> Selector
    DDA --> Selector

    Selector -->|Daftar 10 Soal Adaptif| UI
    Classifier --> Sheet
    Classifier --> Audio
```

---

## 2. Rincian Komponen Arsitektur

### 2.1 Layer Logika Inti Murni (`src/lib/core/`)
Arsitektur menerapkan pola fungsional murni (*Functional Core, Imperative Shell*). Seluruh kalkulasi tidak memiliki efek samping ke jaringan atau basis data, sehingga dapat diuji secara terisolasi:
1. **`errorClassifier.ts`**: Menghitung Jarak Levenshtein, membandingkan multiset token kata, dan menentukan label taksonomi kesalahan.
2. **`mastery.ts`**: Menghitung pembaruan nilai penguasaan dengan *Exponential Moving Average* (bobot $\alpha=0.25$ vs $0.35$ untuk soal tingkat kesulitan $\ge 4$) dan kurva lupa Ebbinghaus.
3. **`spacedRepetition.ts`**: Menjalankan aturan promosi/demosi 5 kotak Leitner ($1, 2, 4, 8, 16$ hari).
4. **`questionSelector.ts`**: Menyusun kuota 60/25/15 dan penyesuaian tingkat kesulitan dinamis (*Flow Theory*, Csikszentmihalyi).
5. **`gamification.ts`**: Menghitung regenerasi malas hati (*lazy hearts*) deterministik tanpa *cron job*, evaluasi streak freeze, dan bonus XP.
6. **`insights.ts`**: Mengolah distribusi kesalahan 30 hari dan menghasilkan wawasan rekomendasi belajar secara berbasis aturan (*rule-based*).
7. **`sus.ts`**: Menghitung skor baku usability *System Usability Scale* (John Brooke, 1996) skala 0-100 beserta pemeringkatan huruf (*grade*).

### 2.2 Layer Penjelasan Cerdas Modular (`src/lib/ai/`)
1. **`explain.ts`**:
   - Berjalan eksklusif di sisi server (*Server-Side Only*), menjaga kerahasiaan `GEMINI_API_KEY`.
   - Menggunakan tabel cache `AiExplanationCache` untuk mengeliminasi pemanggilan duplikat pada pasangan soal dan jawaban yang sama.
   - Dilengkapi *Instant Fallback*: jika kunci API tidak diatur atau jaringan mengalami hambatan, sistem secara transparan mengembalikan penjelasan kaidah tata bahasa statis bawaan soal (`question.explanation`).

### 2.3 Layer Penyimpanan & Telemetri (`prisma/`)
Menggunakan Prisma ORM dengan SQLite (siap dialihkan ke PostgreSQL di lingkungan produksi):
- `User` & `UserStats`: Profil siswa dan guru, nyawa, gems, streak, streak freeze.
- `Course`, `Unit`, `Lesson`, `Skill`, `Question`: Struktur kurikulum hierarkis lengkap.
- `AnswerLog`: Rekaman telemetri rinci untuk diagnosis metakognitif dan keperluan penelitian ilmiah.
- `UserSkillMastery`: Nilai kontinu penguasaan $0.0 - 1.0$ per skill.
- `ReviewSchedule`: Jadwal kotak memori Leitner.
- `SusFeedback`: Penyimpanan data hasil uji kemudahan pengguna untuk sidang skripsi.

---

## 3. Alur Komunikasi Client-Server

1. **Memulai Sesi**: Siswa membuka `/learn/[lessonId]` $\rightarrow$ Klien memanggil `GET /api/session/questions` $\rightarrow$ Server menjalankan `selectAdaptiveQuestions()` $\rightarrow$ Mengembalikan 10 soal terpersonalisasi.
2. **Menjawab Soal**: Siswa memilih/mengetik $\rightarrow$ Klien mengirim `POST /api/session/answer` $\rightarrow$ Server mendiagnosis kesalahan, mengupdate mastery, memperbarui kotak Leitner, mengevaluasi nyawa $\rightarrow$ Mengembalikan feedback instan beserta audio chime/thud.
3. **Refleksi Mandiri**: Siswa membuka `/dashboard` $\rightarrow$ Menampilkan radar chart kompetensi, ringkasan 30 hari, materi terlemah, dan grafik XP.
4. **Remedial Terarah**: Siswa mengklik "Latihan Titik Lemah" $\rightarrow$ Mengakses `/practice/weakness` tanpa risiko kehilangan nyawa.
