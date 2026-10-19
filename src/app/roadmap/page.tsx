'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  PenTool,
  Headphones,
  Mic,
  Star,
  Lock,
  CheckCircle2,
  Trophy,
  Gift,
  ArrowRight,
  Flame,
  Heart,
  Gem,
  Sparkles,
  ChevronLeft,
  Play,
  RotateCcw,
} from 'lucide-react';
import { StandingMascot } from '@/components/StandingMascot';
import { playBubblePop } from '@/lib/audio/speech';

export type TrackType = 'reading' | 'writing' | 'listening' | 'speaking';

interface StageData {
  id: number;
  title: string;
  desc: string;
  unit: number;
  unitTitle: string;
  isMilestone?: boolean;
}

// Generator 50 Stages per Roadmap Track
function generateStages(track: TrackType): StageData[] {
  const units = [
    { unit: 1, title: 'Unit 1: Fondasi & Frasa Sehari-hari' },
    { unit: 2, title: 'Unit 2: Tata Bahasa & Kata Kerja Inti' },
    { unit: 3, title: 'Unit 3: Percakapan & Kosakata Tematik' },
    { unit: 4, title: 'Unit 4: Kalimat Kompleks & Tenses Lanjutan' },
    { unit: 5, title: 'Unit 5: Penguasaan Fluency Tingkat Mahir' },
  ];

  const trackPrefixes: Record<TrackType, { topics: string[]; verb: string }> = {
    reading: {
      verb: 'Membaca',
      topics: [
        'Salam & Perkenalan', 'Tanda Petunjuk Umum', 'Menu Makanan & Minuman', 'Jadwal & Waktu', 'Pesan Singkat Chat',
        'Email Formal Pendek', 'Artikel Berita Ringan', 'Deskripsi Tempat Wisata', 'Petunjuk Arah Jalan', 'Ulasan Produk',
        'Cerita Pendek Fabel', 'Surat Kabar Mini', 'Teks Pengumuman Stasiun', 'Biografi Singkat Tokoh', 'Resep Masakan',
        'Wawancara Majalah', 'Artikel Sains Populer', 'Surat Izin & Formulir', 'Dialog Naskah Drama', 'Esai Opini Pendek',
        'Editorial Lingkungan', 'Laporan Cuaca Global', 'Blog Catatan Perjalanan', 'Brosur Beasiswa', 'Ringkasan Eksekutif',
        'Profil Perusahaan', 'Manual Pengguna Gadget', 'Artikel Teknologi AI', 'Cerita Misteri Bahasa', 'Ulasan Film',
        'Analisis Data Grafis', 'Pidato Inspiratif', 'Jurnal Ilmiah Mini', 'Perjanjian Kontrak Sederhana', 'Debat Opini Publik',
        'Wacana Kebijakan', 'Surat Pembaca', 'Kritik Seni & Buku', 'Investigasi Ringan', 'Kisah Sukses Startup',
        'Studi Kasus Bisnis', 'Literatur Klasik Terjemahan', 'Dokumenter Transkrip', 'Esai Filsafat Praktis', 'Manifesto Kepemimpinan',
        'Wacana Diplomasi', 'Analisis Sosio-Kultural', 'Kompilasi Fakta Dunia', 'Refleksi Akhir Bacaan', 'Uji Komprehensif Membaca',
      ],
    },
    writing: {
      verb: 'Menulis',
      topics: [
        'Mengeja Nama & Huruf', 'Menyusun Kalimat Sederhana', 'Mengisi Formulir Diri', 'Menulis Pesan WA Singkat', 'Menulis Ucapan Selamat',
        'Mendeskripsikan Benda', 'Membuat Daftar Belanja', 'Menulis Status Medsos', 'Menjelaskan Rutinitas Harian', 'Menulis Email Singkat',
        'Penggunaan Simple Present', 'Menyusun Simple Past', 'Menggunakan Conjunction (And/But)', 'Membuat Paragraf Deskriptif', 'Menulis Catatan Resep',
        'Mengajukan Pertanyaan Sopan', 'Menulis Surel Izin Sakit', 'Membuat Pengumuman Singkat', 'Menjelaskan Rencana Liburan', 'Menulis Ulasan Tempat',
        'Penggunaan Present Perfect', 'Kalimat Pengandaian (If-Clause)', 'Menulis Opini Pro-Kontra', 'Menyusun Surat Komplain', 'Menulis Ringkasan Berita',
        'Menyusun Paragraf Persuasif', 'Menulis Cerita Pengalaman', 'Menjelaskan Grafik Tren', 'Menulis Email Lamaran Kerja', 'Menulis Instruksi Langkah',
        'Kalimat Pasif (Passive Voice)', 'Reported Speech (Kalimat Tak Langsung)', 'Menulis Esai 3 Paragraf', 'Menyusun Notula Rapat', 'Menulis Narasi Fiktif',
        'Menyusun Proposal Mini', 'Menjelaskan Sebab-Akibat', 'Menulis Artikel Blog', 'Menulis Surat Rekomendasi', 'Menyusun Siaran Pers',
        'Penggunaan Idiom Formal', 'Variasi Kosakata Akademik', 'Menulis Tinjauan Kritis', 'Menyusun Naskah Pidato', 'Menyusun Laporan Proyek',
        'Menulis Esai Akademik', 'Argumentasi Tingkat Mahir', 'Karya Tulis Kreatif', 'Sintesis Multi-Sumber', 'Uji Komprehensif Menulis',
      ],
    },
    listening: {
      verb: 'Mendengarkan',
      topics: [
        'Mengenal Fonem & Bunyi', 'Mendengar Angka & Jam', 'Mendengar Salam & Sapaan', 'Mendengar Ejaan Nama', 'Instruksi Kelas Sederhana',
        'Percakapan di Kafe', 'Pengumuman Bandara', 'Arah & Belokan Jalan', 'Prakiraan Cuaca Singkat', 'Pemesanan Tiket Bioskop',
        'Wawancara Singkat', 'Dialog Belanja di Pasar', 'Mendengar Nada Bicara & Emosi', 'Instruksi Mesin Otomatis', 'Pesan Suara Voicemail',
        'Dialog Dokter & Pasien', 'Diskusi Rencana Akhir Pekan', 'Siaran Radio Musik', 'Laporan Lalu Lintas', 'Petunjuk Evakuasi Darurat',
        'Presentasi Singkat Kelas', 'Podcast Hobi & Musik', 'Debat Ringan 2 Pembicara', 'Mendengar Aksen British/US', 'Instruksi Kerja di Kantor',
        'Ceramah Singkat Sejarah', 'Diskusi Meja Bundar', 'Wawancara Kerja Formal', 'Panduan Tur Wisata', 'Ulasan Film Audio',
        'Kuliah Singkat Kampus', 'Dialog Negosiasi Harga', 'Pengumuman Resmi Lembaga', 'Mendengar Pidato Singkat', 'Debat Ilmiah Populer',
        'Analisis Berita Global Audio', 'Mendengar Cerita Humor', 'Podcast Wirausaha', 'Diskusi Teknologi Terkini', 'Monolog Teater Audio',
        'Wawancara Ahli Lingkungan', 'Kuliah Tamu Internasional', 'Diskusi Kebijakan Publik', 'Mendengar Konferensi Pers', 'Dokumenter Alam Suara',
        'Analisis Opini Kritis Audio', 'Mendengar Berbagai Dialek', 'Diskusi Etika & Masa Depan', 'Simulasi Tes Listening Standar', 'Uji Komprehensif Menyimak',
      ],
    },
    speaking: {
      verb: 'Berbicara',
      topics: [
        'Pelafalan Huruf Vokal', 'Memperkenalkan Diri', 'Menyebutkan Angka & Tanggal', 'Menyapa Teman Baru', 'Memesan Kopi & Makanan',
        'Menanyakan Arah & Tempat', 'Menjelaskan Profesi Diri', 'Menceritakan Hobi Utama', 'Mengucapkan Terima Kasih Sopan', 'Menolak Ajakan Halus',
        'Menceritakan Kegiatan Hari Ini', 'Mendeskripsikan Keluarga', 'Berbicara di Toko Pakaian', 'Menawar Harga dengan Sopan', 'Menelpon Teman',
        'Menceritakan Liburan Lalu', 'Menjelaskan Makanan Favorit', 'Mengeluhkan Pelayanan Buruk', 'Memberikan Pujian tulus', 'Meminta Bantuan Sopan',
        'Menjelaskan Rencana Masa Depan', 'Menyampaikan Pendapat di Forum', 'Mendeskripsikan Gambar Kompleks', 'Berbicara tentang Hewan Piaraan', 'Menjelaskan Aturan Permainan',
        'Presentasi Singkat 1 Menit', 'Bermain Peran Wawancara Kerja', 'Memberikan Instruksi Kerja', 'Menyanggah Opini dengan Santun', 'Bercerita Pengalaman Lucu',
        'Berbicara tentang Perubahan Iklim', 'Diskusi Film & Buku', 'Menjelaskan Cara Kerja Benda', 'Menyampaikan Pidato Pembuka', 'Berbicara Topik Kesehatan',
        'Membawakan Berita Ringkas', 'Debat Peran 2 Sisi', 'Menjelaskan Grafik Statistik', 'Menghibur dengan Cerita', 'Menyampaikan Harapan & Doa',
        'Menjelaskan Filosofi Hidup', 'Membawakan Presentasi Bisnis', 'Berbicara Spontan (Impromptu)', 'Menjelaskan Solusi Masalah', 'Menceritakan Budaya Lokal',
        'Wawancara Mendalam 3 Menit', 'Pidato Persuasif Publik', 'Diskusi Gagasan Masa Depan', 'Simulasi Tes Bicara Fluency', 'Uji Komprehensif Berbicara',
      ],
    },
  };

  const data = trackPrefixes[track];
  return data.topics.map((topic, idx) => {
    const stageNum = idx + 1;
    const unitIdx = Math.floor(idx / 10);
    const unitInfo = units[unitIdx] || units[units.length - 1];
    const isMilestone = stageNum % 5 === 0;

    return {
      id: stageNum,
      title: topic,
      desc: `Latihan ${data.verb} tahap ${stageNum}: kuasai pemahaman konteks ${topic.toLowerCase()}.`,
      unit: unitInfo.unit,
      unitTitle: unitInfo.title,
      isMilestone,
    };
  });
}

export default function RoadmapPage() {
  const [activeTrack, setActiveTrack] = useState<TrackType>('reading');
  const [selectedStage, setSelectedStage] = useState<StageData | null>(null);

  // Progres simulasi: user saat ini berada di stage 8 (stage 1-7 completed)
  const currentProgressStage = 8;

  const stages = generateStages(activeTrack);

  const trackInfo = {
    reading: {
      name: 'Reading (Membaca)',
      icon: BookOpen,
      color: 'emerald',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      activeBorder: 'border-emerald-500 bg-emerald-500 text-white',
      accentBg: 'from-emerald-500 to-teal-600',
    },
    writing: {
      name: 'Writing (Menulis)',
      icon: PenTool,
      color: 'sky',
      badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
      activeBorder: 'border-sky-500 bg-sky-500 text-white',
      accentBg: 'from-sky-500 to-blue-600',
    },
    listening: {
      name: 'Listening (Mendengarkan)',
      icon: Headphones,
      color: 'purple',
      badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      activeBorder: 'border-purple-500 bg-purple-500 text-white',
      accentBg: 'from-purple-500 to-indigo-600',
    },
    speaking: {
      name: 'Speaking (Berbicara)',
      icon: Mic,
      color: 'amber',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      activeBorder: 'border-amber-500 bg-amber-500 text-white',
      accentBg: 'from-amber-500 to-orange-600',
    },
  }[activeTrack];

  // Hitung offset winding horizontal sinusoidal
  function getHorizontalOffset(index: number) {
    const cycle = index % 8;
    const offsets = [0, 42, 70, 42, 0, -42, -70, -42];
    return offsets[cycle];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/50 via-slate-50 to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* AMBIENT GLOW BLOBS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-emerald-400/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-2/3 left-10 w-96 h-96 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-amber-400/15 dark:bg-amber-500/10 blur-3xl pointer-events-none -z-10" />

      {/* 1. TOP APP BAR */}
      <header className="sticky top-0 z-30 border-b-2 border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 transition shadow-xs"
              title="Kembali ke Dashboard"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Roadmap Pembelajaran
                </h1>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  50 Stages
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Pilih jalur kompetensi dan taklukkan setiap milestone!
              </p>
            </div>
          </div>

          {/* Quick Stats Pill with Tactile Depth */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-black">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-xs">
              <Flame className="h-4 w-4 fill-amber-500" />
              <span>14 Hari</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-sky-50 dark:bg-sky-950/70 border-2 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 shadow-xs">
              <Gem className="h-4 w-4 fill-sky-500" />
              <span>240</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-xs">
              <Heart className="h-4 w-4 fill-rose-500 animate-pulse" />
              <span>5</span>
            </div>
          </div>
        </div>

        {/* 2. TRACK SWITCHER TABS (Membaca, Menulis, Mendengar, Berbicara) */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/60">
          <div className="mx-auto flex max-w-5xl items-center justify-around sm:justify-start sm:gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
            {(
              [
                { key: 'reading', label: 'Membaca (Reading)', icon: BookOpen, activeColor: 'text-emerald-500' },
                { key: 'writing', label: 'Menulis (Writing)', icon: PenTool, activeColor: 'text-indigo-500' },
                { key: 'listening', label: 'Mendengarkan (Listening)', icon: Headphones, activeColor: 'text-purple-500' },
                { key: 'speaking', label: 'Berbicara (Speaking)', icon: Mic, activeColor: 'text-amber-500' },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const isActive = activeTrack === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    setActiveTrack(t.key);
                  }}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-md border-2 border-slate-300 dark:border-slate-600 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? t.activeColor : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 3. ROADMAP CONTENT AREA */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-8">
        {/* Banner Track Aktif */}
        <div
          className={`w-full rounded-3xl bg-gradient-to-r ${trackInfo.accentBg} p-7 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-5 border-2 border-white/20`}
        >
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-white/80 bg-white/20 px-3 py-1 rounded-full">
              Jalur Pembelajaran Aktif
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">{trackInfo.name}</h2>
            <p className="text-xs font-semibold text-white/90 max-w-md leading-relaxed">
              Selesaikan 50 tahapan kurikulum berurutan untuk mencapai kemahiran penuh (CEFR B2 Level).
            </p>
          </div>

          {/* Progress Bar Mini */}
          <div className="rounded-2xl bg-black/25 backdrop-blur-md p-4 text-center sm:text-right shrink-0 border border-white/20">
            <div className="text-xs font-bold text-white/80">Progres Keseluruhan</div>
            <div className="text-2xl font-black mt-0.5">
              {currentProgressStage - 1} / 50 <span className="text-xs font-medium text-white/70">Stage</span>
            </div>
            <div className="w-36 h-2.5 bg-white/30 rounded-full mt-2 overflow-hidden p-0.5">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${((currentProgressStage - 1) / 50) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. WINDING PATH STAGES (50 Nodes grouped in 5 Units) */}
        <div className="relative w-full flex flex-col items-center space-y-6 pb-20">
          {stages.map((stage, idx) => {
            const isCompleted = stage.id < currentProgressStage;
            const isCurrent = stage.id === currentProgressStage;
            const isLocked = stage.id > currentProgressStage;
            const offset = getHorizontalOffset(idx);

            const isFirstOfUnit = idx === 0 || stages[idx - 1].unit !== stage.unit;

            // Unit theme color palette
            const unitPalettes = [
              'bg-emerald-500 border-emerald-700 text-white',
              'bg-indigo-500 border-indigo-700 text-white',
              'bg-purple-500 border-purple-700 text-white',
              'bg-amber-500 border-amber-700 text-white',
              'bg-rose-500 border-rose-700 text-white',
            ];
            const currentUnitTheme = unitPalettes[(stage.unit - 1) % unitPalettes.length];

            return (
              <React.Fragment key={stage.id}>
                {/* UNIT HEADER SEPARATOR */}
                {isFirstOfUnit && (
                  <div className="w-full my-6 text-center">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-slate-300 dark:border-slate-700 px-6 py-3 shadow-md backdrop-blur-md">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {stage.unitTitle}
                      </span>
                    </div>
                  </div>
                )}

                {/* STAGE NODE CONTAINER */}
                <div
                  className="relative flex items-center justify-center transition-all duration-300"
                  style={{ transform: `translateX(${offset}px)` }}
                >
                  {/* STANDING MASCOT MUNCUL DI SEBELAH STAGE AKTIF */}
                  {isCurrent && (
                    <div className="absolute -left-48 sm:-left-56 -top-12 z-20 hidden md:block">
                      <StandingMascot
                        size="sm"
                        mood="talking"
                        message={`Kamu di Stage ${stage.id}! Ayo selesaikan!`}
                        showSpeechBubble={true}
                        canSwitchCharacter={false}
                      />
                    </div>
                  )}

                  {/* TOMBOL NODE STAGE (3D DUOLINGO CLAYMOPHISM) */}
                  <button
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setSelectedStage(stage);
                    }}
                    className={`group relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-b-4 font-black transition-all active:translate-y-1 active:border-b-0 ${
                      isCompleted
                        ? 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border-amber-700 text-amber-950 shadow-md ring-2 ring-amber-200 dark:ring-amber-900'
                        : isCurrent
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 border-emerald-800 text-white shadow-xl ring-4 ring-emerald-300/60 dark:ring-emerald-700/60 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-80'
                    }`}
                  >
                    {/* Ikon Node */}
                    {isCompleted ? (
                      <CheckCircle2 className="h-8 w-8 text-amber-950" />
                    ) : isCurrent ? (
                      stage.isMilestone ? (
                        <Trophy className="h-8 w-8 text-white animate-bounce" />
                      ) : (
                        <Star className="h-8 w-8 fill-white text-white" />
                      )
                    ) : stage.isMilestone ? (
                      <Gift className="h-7 w-7 text-slate-400" />
                    ) : (
                      <Lock className="h-6 w-6 text-slate-400" />
                    )}

                    {/* Badge Nomor Stage */}
                    <span className="absolute -bottom-2 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs border border-white/20">
                      #{stage.id}
                    </span>
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </main>

      {/* 5. MODAL POPUP DETAIL STAGE */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border-2 border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                Stage {selectedStage.id} • {trackInfo.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {selectedStage.title}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedStage.desc}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Materi Terkait:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedStage.unitTitle}</span>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={`/learn/lesson-${((selectedStage.id - 1) % 5) + 1}`}
                onClick={() => playBubblePop()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800 py-4 text-sm font-black text-white shadow-lg transition active:translate-y-1 active:border-b-0"
              >
                <Play className="h-4 w-4 fill-white" />
                Mulai Latihan Sesi Ini
              </Link>
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="w-full rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
