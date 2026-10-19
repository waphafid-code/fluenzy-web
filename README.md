# Fluenzy - Platform Belajar Bahasa Inggris Adaptif & Diagnosis Kognitif

Fluenzy adalah platform pembelajaran bahasa Inggris mandiri dan adaptif bergaya Duolingo yang dirancang untuk mengidentifikasi kesalahan kognitif siswa (*Surface Strategy Taxonomy*), memodelkan tingkat penguasaan tiap materi secara dinamis (*Exponential Moving Average*), dan mengoptimalkan retensi jangka panjang melalui pengulangan berjarak (*Spaced Repetition Leitner Box*).

Dibangun sebagai bagian dari proyek akademik Tugas Akhir / Skripsi dengan kode yang rapi, modular, dan didukung pengujian unit 100% lulus.

---

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Lucide React
- **Visualisasi Grafik**: Recharts (Radar Chart, Bar Chart, Area Chart)
- **Database & ORM**: Prisma ORM v6 + SQLite (`prisma/dev.db`, siap dipindah ke PostgreSQL)
- **Testing**: Vitest (81 unit test fungsi murni)
- **Autentikasi & Keamanan**: BcryptJS (Password Hashing)
- **Audio Feedback**: Web Audio API Sound Synthesizer (offline, tanpa ketergantungan file eksternal)
- **AI Explanation (Modular)**: Gemini API (opsional) dengan caching database dan *graceful fallback*

---

## 👥 Akun Demo Siap Pakai

Database telah dilengkapi akun bawaan untuk pengujian dan presentasi sidang:

| Peran (Role) | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Siswa (Student)** | `budi@fluenzy.id` | `password123` | Memiliki 30 hari riwayat belajar, 51 sesi, telemetri kesalahan, status mastery, dan jadwal review Leitner. |
| **Guru/Admin (Teacher)** | `guru@fluenzy.id` | `password123` | Akses ke laporan performa kelas, skill paling bermasalah, dan manajemen CRUD bank soal. |

---

## 🚀 Panduan Memulai Dari Nol

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Variabel Lingkungan
Salin berkas template lingkungan:
```bash
cp .env.example .env
```
*(Opsional) Isi `GEMINI_API_KEY` jika ingin mengaktifkan penjelasan cerdas AI secara live. Jika dikosongkan, sistem secara otomatis menggunakan penjelasan bawaan bank soal (100% berfungsi tanpa API key).*

### 3. Sinkronisasi Skema Basis Data
```bash
npx prisma db push
npx prisma generate
```

### 4. Mengisi Data Kurikulum Awal (Seed)
Membuat 5 materi inti (50 soal kurikulum A1-A2, 10 soal per materi), akun siswa, dan akun guru:
```bash
npm run seed
```

### 5. Mengisi Data Simulasi 30 Hari untuk Presentasi
Membuat 30 hari aktivitas belajar realistis agar grafik tren XP, kalender streak, dan diagram radar terlihat hidup:
```bash
npm run seed:30days
```

### 6. Menjalankan Unit Testing
Menjalankan seluruh 81 unit test logika inti kognitif:
```bash
npm test
```

### 7. Menjalankan Aplikasi
```bash
npm run dev
```
Buka browser pada `http://localhost:3000`.

---

## 🧭 Peta Rute Halaman Aplikasi

| Rute URL | Nama Fitur | Deskripsi Fungsi |
| :--- | :--- | :--- |
| [`/dashboard`](http://localhost:3000/dashboard) | **Dashboard "Kemampuanmu"** | Peta Radar kompetensi, 3 materi terlemah, analisis pola kesalahan 30 hari, grafik XP, dan kalender streak. |
| [`/learn/lesson-1`](http://localhost:3000/learn/lesson-1) | **Sesi Belajar Adaptif** | Rasio soal 60% pelajaran aktif, 25% materi terlemah, 15% review jatuh tempo. Penyesuaian kesulitan dinamis (Flow state). |
| [`/practice/weakness`](http://localhost:3000/practice/weakness) | **Latihan Titik Lemah** | Remedial terfokus pada 3 skill terendah tanpa risiko pengurangan hati (*Practice Mode*). |
| [`/practice/review`](http://localhost:3000/practice/review) | **Review Harian Leitner** | Pengulangan berjarak (*Spaced Repetition*) soal-soal yang telah jatuh tempo (Kotak 1-5). |
| [`/mistakes`](http://localhost:3000/mistakes) | **Review Kesalahan** | Daftar seluruh jawaban salah yang dikelompokkan berdasarkan materi dan tipe kesalahan beserta pembahasannya. |
| [`/teacher`](http://localhost:3000/teacher) | **Portal Guru & Kurikulum** | Laporan penguasaan per siswa, skill paling bermasalah di kelas, dan form CRUD bank soal dengan validasi payload. |
| [`/research`](http://localhost:3000/research) | **Bahan Uji Empiris & SUS** | Unduh dataset CSV teranonimkan (*AnswerLog, Mastery, Pre/Post-Test*) dan formulir System Usability Scale (SUS). |

---

## 📁 Struktur Direktori
```text
fluenzy-web/
├── docs/
│   ├── algoritma.md         # Rumus matematika lengkap (EMA, Decay, Leitner, DDA, SUS)
│   └── arsitektur.md        # Diagram alur data Mermaid (jawaban -> log -> mastery -> selector)
├── prisma/
│   ├── schema.prisma        # 14 model relasi lengkap (User, Stats, Curriculum, Questions, SUS, AI Cache)
│   ├── seed.ts              # Seeder kurikulum 5 skill & 50 soal pedagogis
│   └── seed30Days.ts        # Seeder 30 hari aktivitas demo presentasi
├── src/
│   ├── app/                 # Next.js App Router (dashboard, learn, practice, mistakes, teacher, research)
│   ├── components/          # Reusable UI (SessionPlayer dengan audio synth, Charts)
│   └── lib/
│       ├── ai/
│       │   └── explain.ts   # Modul AI dengan caching database & graceful static fallback
│       ├── core/            # FUNGSI MURNI LOGIKA INTI (Zero Side-Effects)
│       │   ├── config.ts    # Sentralisasi seluruh parameter & bobot pedagogis
│       │   ├── errorClassifier.ts  # Diagnosis taksonomi kesalahan (Levenshtein, Omission, Anagram)
│       │   ├── mastery.ts          # Rumus EMA mastery & Ebbinghaus forgetting curve decay
│       │   ├── spacedRepetition.ts # Sistem 5 Kotak Leitner & filter jatuh tempo
│       │   ├── questionSelector.ts # Komposisi 60/25/15 & Dynamic Difficulty Adjustment (DDA)
│       │   ├── gamification.ts     # Lazy Hearts regen, bonus XP materi lemah, Streak Freeze
│       │   ├── insights.ts         # Analisis kesalahan 30 hari & sistem pakar wawasan berbasis aturan
│       │   ├── sus.ts              # Perhitungan baku System Usability Scale (Brooke, 1996)
│       │   └── __tests__/          # 81 Unit Tests Vitest untuk seluruh fungsi inti
│       └── db/
│           └── prisma.ts    # Singleton Prisma Client
└── package.json
```

---

## ⚖️ Kejujuran Akademik: Keterbatasan & Batasan Sistem yang Diketahui

Sebagai bagian dari integritas karya ilmiah Tugas Akhir, berikut adalah batasan teknis sistem saat ini yang dapat diangkat pada bagian *Saran Pengembangan Selanjutnya* (*Future Works*):
1. **Penyimpanan Berkas Audio Masih Menggunakan Web Audio API**: Suara umpan balik benar/salah disintesis langsung menggunakan frekuensi osilator peramban untuk menjamin 0% risiko kegagalan unduhan file. Integrasi rekaman penutur asli (*native speaker speech recording*) dapat ditambahkan di masa depan.
2. **Evaluasi Transkripsi Audio (*Listening*)**: Fungsi deteksi `listening_error` telah disiapkan dan teruji pada mesin diagnosis kesalahan, namun kurikulum saat ini difokuskan pada tipe soal teks (pilihan ganda, isian singkat, dan susun kata).
3. **Database SQLite**: Konfigurasi saat ini menggunakan SQLite lokal untuk kemudahan instalasi satu langkah. Skema Prisma telah dirancang kompatibel untuk dialihkan ke PostgreSQL (*Supabase/Neon*) hanya dengan mengubah baris `provider = "postgresql"`.
