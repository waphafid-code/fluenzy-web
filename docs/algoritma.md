# Dokumentasi Algoritma & Model Pedagogis Fluenzy

Dokumen ini menyajikan penjelasan komprehensif mengenai perumusan matematis, dasar teori pedagogi kognitif, dan konfigurasi konstanta yang diimplementasikan pada **Tahap 2: Mesin Diagnosis & Personalisasi Fluenzy**.

---

## Daftar Isi
1. [Filosofi Sistem & Arsitektur Kognitif](#1-filosofi-sistem--arsitektur-kognitif)
2. [Klasifikasi Kesalahan Siswa (`errorClassifier.ts`)](#2-klasifikasi-kesalahan-siswa-errorclassifierts)
3. [Penguasaan Per Skill (`mastery.ts`)](#3-penguasaan-per-skill-masteryts)
4. [Pengulangan Berjarak Leitner (`spacedRepetition.ts`)](#4-pengulangan-berjarak-leitner-spacedrepetitionts)
5. [Pemilih Soal Adaptif (`questionSelector.ts`)](#5-pemilih-soal-adaptif-questionselectorts)
6. [Gamifikasi Lanjutan & Regenerasi Hati Malas (`gamification.ts`)](#6-gamifikasi-lanjutan--regenerasi-hati-malas-gamificationts)
7. [Tabel Rujukan Nilai Konstanta (`config.ts`)](#7-tabel-rujukan-nilai-konstanta-configts)

---

## 1. Filosofi Sistem & Arsitektur Kognitif

Fluenzy dirancang bukan sekadar sebagai aplikasi kuis, melainkan sistem bimbingan belajar adaptif (*Intelligent Tutoring System*). Setiap tindakan siswa direkam secara kaya untuk membedakan:
- **Slip Mekanikal (Performance Slip)**: Kesalahan kecil ketik (*typo*) atau pembalikan urutan kata (*word order*), di mana siswa sebenarnya memahami konsep namun kurang teliti.
- **Mistake Konseptual (Competence Gap)**: Kesalahan leksikal (*wrong word*) atau pemilihan salah (*wrong choice*), yang menandakan perlunya intervensi materi remedial.

Semua logika inti dibangun sebagai **fungsi murni (*pure functions*)** di folder `src/lib/core/` sehingga deterministik, bebas efek samping, mudah diuji secara otomatis (*unit test*), dan siap dipertanggungjawabkan dalam sidang akademik Tugas Akhir.

---

## 2. Klasifikasi Kesalahan Siswa (`errorClassifier.ts`)

### Landasan Teori
Mengadopsi **Surface Strategy Taxonomy** (*Dulay, Burt, & Krashen, 1982*) yang mengklasifikasikan kesalahan bahasa kedua (L2) berdasarkan cara struktur kalimat menyimpang dari bentuk baku:

1. **Typo (Slip Ortografis)**:
   - Jarak Levenshtein $\le 2$ dan selisih panjang string $\le 2$.
   - Menghitung jumlah operasi minimum insersi, delesi, atau substitusi karakter tunggal.
   $$\text{lev}(a, b) = \begin{cases} 
   |a| & \text{jika } |b| = 0, \\ 
   |b| & \text{jika } |a| = 0, \\ 
   \text{lev}(\text{tail}(a), \text{tail}(b)) & \text{jika } a[0] = b[0], \\ 
   1 + \min \begin{cases} \text{lev}(\text{tail}(a), b) \\ \text{lev}(a, \text{tail}(b)) \\ \text{lev}(\text{tail}(a), \text{tail}(b)) \end{cases} & \text{lainnya.} 
   \end{cases}$$
2. **Word Order (Misordering)**:
   - Jumlah kata sama dan himpunan kata (*multiset*) identik, namun susunan urutannya tertukar (misal: `"apple an eat I"` vs `"I eat an apple"`).
3. **Missing Word (Omission)**:
   - Siswa melompati auxiliary verb atau preposisi penting (misal: `"She eating lunch"` kekurangan kata `"is"`).
4. **Extra Word (Addition)**:
   - Penambahan kata yang mubazir akibat interferensi bahasa ibu L1 (misal: `"I am agree with you"`).
5. **Wrong Word (Misformation)**:
   - Kesalahan leksikal total (misal: `"He drank a pizza"`).
6. **Wrong Choice**:
   - Pemilihan opsi distractor yang salah pada latihan tipe pilihan ganda atau menjodohkan.
7. **Listening Error**:
   - Kesalahan persepsi fonologis pada transkripsi audio.

---

## 3. Penguasaan Per Skill (`mastery.ts`)

Tingkat kemahiran siswa pada tiap keahlian dimodelkan secara dinamis menggunakan nilai kontinu $0.0 \le M \le 1.0$.

### 3.1 Rumus Pembaruan (Exponential Moving Average / EMA)
$$\text{mastery}_{\text{baru}} = \text{mastery}_{\text{lama}} + \alpha \cdot (\text{hasil} - \text{mastery}_{\text{lama}})$$

Di mana:
- **$\text{mastery}_{\text{awal}}$**: $0.5$ (*Prior neutral probability*).
- **Hasil performa butir ($R$)**:
  - $1.0$ : Jawaban benar tanpa bantuan petunjuk (*hint*).
  - $0.6$ : Jawaban benar dengan bantuan petunjuk (*scaffolding effect*, Vygotsky, 1978).
  - $0.0$ : Jawaban salah.
- **Learning rate ($\alpha$)**:
  - $\alpha = 0.25$ untuk soal tingkat kesulitan standar ($1 \le \text{difficulty} \le 3$).
  - $\alpha = 0.35$ untuk soal menantang ($\text{difficulty} \ge 4$). Soal yang sulit memberikan sinyal kompetensi yang lebih berbobot pada *Zone of Proximal Development*.

### 3.2 Penurunan Alami (Ebbinghaus Forgetting Curve Decay)
Jika siswa tidak melatih suatu materi selama lebih dari 7 hari, penguasaan materi tersebut mengalami penurunan bertahap:
$$\Delta t_{\text{lewat}} = \max(0, \text{hari inaktif} - 7)$$
$$\text{decay} = \left(\frac{\Delta t_{\text{lewat}}}{7}\right) \times 0.05$$
$$\text{mastery}_{\text{decayed}} = \max(0.0, \text{mastery} - \text{decay})$$

### 3.3 Klasifikasi Level Kemahiran
| Rentang Nilai | Status | Tindakan Pedagogis |
| :--- | :--- | :--- |
| $< 0.50$ | **Lemah (Weak)** | Prioritas utama dalam latihan remedial adaptif |
| $0.50 - 0.80$ | **Sedang (Medium)** | Penguatan konsep dan variasi kalimat |
| $> 0.80$ | **Kuat (Strong)** | Otomatisasi kognitif telah tercapai |

---

## 4. Pengulangan Berjarak Leitner (`spacedRepetition.ts`)

Fluenzy menerapkan **Sistem Kotak Leitner (1872)** dengan 5 tingkat kotak retensi untuk mengoptimalkan retensi memori jangka panjang:

| Kotak (Box) | Interval Jadwal | Fase Retensi Memori |
| :--- | :--- | :--- |
| **Kotak 1** | 1 hari | Memori kerja / butir baru dipelajari |
| **Kotak 2** | 2 hari | Konsolidasi memori awal |
| **Kotak 3** | 4 hari | Memori jangka menengah |
| **Kotak 4** | 8 hari | Memori jangka panjang |
| **Kotak 5** | 16 hari | Retensi stabil / otomatis |

### Aturan Transisi:
- **Jawaban Benar**: Naik satu kotak ($\min(5, \text{kotak} + 1)$).
- **Jawaban Salah**: Demosi langsung ke **Kotak 1** agar soal segera dijadwalkan ulang dalam 24 jam ke depan.

Fungsi `isReviewDue(nextReviewAt, now)` dan `filterDueReviews()` menyaring butir-butir soal yang telah jatuh tempo untuk sesi review harian.

---

## 5. Pemilih Soal Adaptif (`questionSelector.ts`)

Setiap sesi pelajaran dirancang dengan panjang 8–10 butir soal (mengacu pada *Cognitive Load Theory*, Sweller, 1988) dengan komposisi proporsional:

```
┌────────────────────────────────────────────────────────┐
│          Komposisi Soal Sesi Adaptif (10 Butir)        │
├──────────────────────────┬──────────────┬──────────────┤
│ 60% Materi Pelajaran     │ 25% Remedial │ 15% Review   │
│ Saat Ini (6 Butir)       │ Terlemah     │ Jatuh Tempo  │
│                          │ (2 Butir)    │ (2 Butir)    │
└──────────────────────────┴──────────────┴──────────────┘
```

### 5.1 Dynamic Difficulty Adjustment (Flow State)
Menjaga siswa tetap pada *Flow Channel* (Csikszentmihalyi, 1990) agar tidak merasa frustrasi maupun bosan:
- **3 Jawaban Benar Berturut-turut**: Tingkat kesulitan naik $+1$ (maksimum 5).
- **2 Jawaban Salah Berturut-turut**: Tingkat kesulitan turun $-1$ (minimum 1).

### 5.2 Graceful Fallback
Jika pengguna baru belum memiliki bank soal review berjarak atau bank soal remedial belum mencukupi, kuota secara otomatis dialihkan ke materi pelajaran utama sehingga sesi selalu berisi 8–10 butir soal lengkap tanpa duplikasi ID.

---

## 6. Gamifikasi Lanjutan & Regenerasi Hati Malas (`gamification.ts`)

### 6.1 Evaluasi Hati Malas (*Cron-Free Lazy Evaluation*)
Menghindari beban server akibat *cron job* berkala, regenerasi hati dihitung secara instan saat ada interaksi pengguna:
$$\Delta t_{\text{detik}} = \text{now} - \text{heartsUpdatedAt}$$
$$\text{hati}_{\text{tambahan}} = \left\lfloor \frac{\Delta t_{\text{detik}}}{30 \times 60} \right\rfloor$$
$$\text{hearts}_{\text{baru}} = \min(5, \text{hearts}_{\text{lama}} + \text{hati}_{\text{tambahan}})$$

- Kapasitas maksimum: 5 hati.
- Setiap jawaban salah: $-1$ hati.
- Ketika hati mencapai $0$, sesi dihentikan dan sistem menawarkan **"Latihan Titik Lemah"** tanpa risiko kehilangan hati (*Practice Mode*).

### 6.2 Insentif XP & Gems
- **XP Standar**: $+10\text{ XP}$ per jawaban benar.
- **Bonus Titik Lemah**: $+3\text{ XP}$ (total $13\text{ XP}$) jika berhasil menjawab soal dari skill yang tergolong lemah ($< 0.5$). Ini mendorong siswa tidak hanya memilih soal-soal mudah.
- **Bonus Perfect Lesson**: $+5\text{ XP}$.
- **Gems**: Didapatkan saat menyelesaikan pelajaran ($+10\text{ Gems}$) dan saat mencapai target harian ($+20\text{ Gems}$).
- **Streak Freeze**: Dibeli dengan $100\text{ Gems}$, melindungi 1 hari absen tanpa mereset deretan streak.

---

## 7. Tabel Rujukan Nilai Konstanta (`config.ts`)

| Variabel Konstanta | Nilai | Deskripsi Pedagogis |
| :--- | :--- | :--- |
| `XP_PER_CORRECT_ANSWER` | `10` | Poin reward dasar per jawaban benar |
| `XP_PERFECT_LESSON_BONUS` | `5` | Bonus apresiasi akurasi 100% |
| `XP_WEAK_SKILL_BONUS` | `3` | Insentif latihan materi remedial |
| `DEFAULT_DAILY_GOAL_XP` | `30` | Target komitmen harian (sekitar 3 sesi) |
| `MAX_HEARTS` | `5` | Jumlah nyawa maksimal siswa |
| `HEART_REGEN_MINUTES` | `30` | Waktu tunggu pemulihan 1 hati |
| `STREAK_FREEZE_COST_GEMS` | `100` | Harga asuransi perlindungan streak |
| `INITIAL_MASTERY` | `0.5` | Estimasi awal penguasaan siswa |
| `ALPHA_BASE` | `0.25` | Kecepatan belajar untuk soal mudah-sedang |
| `ALPHA_DIFFICULT` | `0.35` | Kecepatan belajar untuk soal berbobot ($\ge 4$) |
| `DECAY_RATE_PER_WEEK` | `0.05` | Laju penurunan penguasaan per minggu inaktif |
| `BOX_INTERVALS_DAYS` | `[1, 2, 4, 8, 16]` | Interval bertingkat memori Leitner |
| `CURRENT_LESSON_RATIO` | `0.60` | 60% fokus materi baru |
| `WEAKEST_SKILL_RATIO` | `0.25` | 25% penguatan skill terlemah |
| `DUE_REVIEW_RATIO` | `0.15` | 15% pengulangan berjarak jatuh tempo |
| `STREAK_TO_INCREASE_DIFFICULTY` | `3` | Ambang kenaikan kesulitan adaptif |
| `STREAK_TO_DECREASE_DIFFICULTY` | `2` | Ambang penurunan kesulitan adaptif |
