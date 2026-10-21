'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LottiePlayer } from '@/components/ui/LottiePlayer';
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
  Shield,
  Compass,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { playBubblePop, playCelebrationSound } from '@/lib/audio/speech';
import { getUserPreferences, getCompanionInfo } from '@/lib/core/preferences';

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
        'Cerita Pendek Fabel', 'Business Email', 'Technical Interview', 'Biografi Singkat Tokoh', 'Resep Masakan',
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
        'Penggunaan Simple Present', 'Business Email', 'Technical Interview', 'Membuat Paragraf Deskriptif', 'Menulis Catatan Resep',
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
        'Wawancara Singkat', 'Business Email', 'Technical Interview', 'Instruksi Mesin Otomatis', 'Pesan Suara Voicemail',
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
        'Menceritakan Kegiatan Hari Ini', 'Business Email', 'Technical Interview', 'Menawar Harga dengan Sopan', 'Menelpon Teman',
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

  // Progres user: stage 12 selesai, stage 13 aktif (seperti di referensi)
  const currentProgressStage = 13;

  const stages = generateStages(activeTrack);
  const activeStage = stages[currentProgressStage - 1] || stages[0];

  const prefs = getUserPreferences();
  const companion = getCompanionInfo(prefs.mascot);

  // Offset sinusoidal horizontal
  function getHorizontalOffset(index: number) {
    const cycle = index % 8;
    const offsets = [0, 42, 70, 42, 0, -42, -70, -42];
    return offsets[cycle];
  }

  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-between pb-32 md:pb-20">
      <Navigation activeTab="roadmap" />

      {/* TRACK SWITCHER BAR */}
      <div className="border-b border-[#1A2E40] bg-[#0A131C]">
        <div className="mx-auto flex max-w-5xl items-center justify-around sm:justify-start sm:gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar">
          {(
            [
              { key: 'reading', label: 'Reading', icon: BookOpen },
              { key: 'writing', label: 'Writing', icon: PenTool },
              { key: 'listening', label: 'Listening', icon: Headphones },
              { key: 'speaking', label: 'Speaking', icon: Mic },
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
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'tab-cyber-active font-black'
                    : 'tab-cyber-inactive'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
        {/* ROADMAP HERO BANNER (Matching Reference Image 1 Screen 1) */}
        <div className="animate-fade-in-up card-cyber p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Peta Petualangan 50 Stage
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Unit 1 Selesai
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Adventure Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Jelajahi setiap stage, kumpulkan gems, dan taklukkan boss battle!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-semibold">Progres Stage</div>
              <div className="text-lg font-black text-emerald-400 font-mono">12 / 50 ⭐⭐⭐</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(0,229,117,0.3)]">
              <Compass className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* WINDING 50 STAGES PATH */}
        <div className="animate-fade-in-up delay-200 relative py-8 flex flex-col items-center space-y-7">
          {/* Glowing connecting line */}
          <div className="absolute top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-500/40 via-cyan-500/30 to-purple-500/30 rounded-full shadow-[0_0_15px_rgba(0,229,117,0.3)] pointer-events-none -z-0" />

          {stages.slice(0, 20).map((stage, idx) => {
            const isCompleted = stage.id < currentProgressStage;
            const isCurrent = stage.id === currentProgressStage;
            const isLocked = stage.id > currentProgressStage;
            const offset = getHorizontalOffset(idx);
            const isFirstOfUnit = idx === 0 || stages[idx - 1]?.unit !== stage.unit;

            return (
              <React.Fragment key={stage.id}>
                {isFirstOfUnit && (
                  <div className="w-full my-4 text-center z-10">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-[#101C27] border border-[#1A2E40] px-5 py-2 shadow-md">
                      <Trophy className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                        {stage.unitTitle}
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className="relative flex items-center justify-center transition-all duration-300 z-10"
                  style={{ transform: `translateX(${offset}px)` }}
                >
                  {isCurrent && (
                    <div className="absolute -top-12 sm:-top-14 pointer-events-none flex flex-col items-center z-20">
                      <div className="w-12 h-12 sm:w-14 sm:h-14">
                        <LottiePlayer
                          animationPath="/animations/roadmap_beacon.json"
                          loop={true}
                          className="w-full h-full"
                        />
                      </div>
                      <span className="text-[9px] font-black tracking-wider uppercase bg-purple-950/90 text-purple-200 border border-purple-500/50 px-2 py-0.5 rounded-full shadow-lg shadow-purple-500/30 -mt-2">
                        Mulai Disini!
                      </span>
                    </div>
                  )}

                  {/* Stage Button */}
                  <button
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setSelectedStage(stage);
                    }}
                    className={`group relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-b-4 font-black transition-all active:translate-y-1 active:border-b-0 cursor-pointer ${
                      isCompleted
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-800 text-white shadow-[0_0_15px_rgba(0,229,117,0.3)]'
                        : isCurrent
                        ? 'bg-gradient-to-b from-emerald-300 to-teal-500 border-emerald-700 text-slate-950 shadow-[0_0_25px_rgba(0,229,117,0.6)] ring-4 ring-emerald-400/50 animate-pulse'
                        : 'bg-[#101C27] border-[#1A2E40] text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-7 w-7 text-white" />
                    ) : isCurrent ? (
                      <Star className="h-8 w-8 fill-slate-950 text-slate-950" />
                    ) : stage.isMilestone ? (
                      <Gift className="h-6 w-6 text-slate-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-slate-600" />
                    )}

                    <span className="absolute -bottom-2 rounded-full bg-[#080E15] px-2 py-0.5 text-[10px] font-black text-white border border-[#1A2E40] tabular-nums">
                      #{stage.id}
                    </span>
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </main>

      {/* FLOATING ACTIVE STAGE CARD (Matching Reference Image 1 Screen 1 Bottom) */}
      <div className="fixed bottom-16 md:bottom-6 left-0 right-0 z-30 px-4 flex justify-center pointer-events-none">
        <div className="card-cyber-glow w-full max-w-lg p-4 flex items-center justify-between gap-4 pointer-events-auto shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <LottiePlayer
                animationPath="/animations/level_unlock.json"
                loop={true}
                className="w-10 h-10 scale-125"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">Tahap Aktif Saat Ini</div>
              <div className="text-sm font-black text-white">Stage 13: Technical Interview</div>
              <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-2 mt-0.5">
                <span>+50 XP</span>
                <span>•</span>
                <span>+15 Gems</span>
              </div>
            </div>
          </div>

          <Link
            href="/learn/lesson-1"
            onClick={() => playCelebrationSound()}
            className="btn-neon-pill px-5 py-2.5 text-xs gap-1.5 shrink-0"
          >
            <span>Mulai</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* STAGE MODAL POPUP */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#101C27] border border-[#1A2E40] p-6 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                Stage {selectedStage.id} • {selectedStage.unitTitle}
              </span>
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">{selectedStage.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedStage.desc}</p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href={`/learn/lesson-${((selectedStage.id - 1) % 5) + 1}`}
                onClick={() => playBubblePop()}
                className="btn-neon-pill py-3 text-xs gap-2"
              >
                <Play className="h-4 w-4 fill-slate-950" />
                <span>Mulai Sesi Stage Ini</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="btn-cyber-pill py-2.5 text-xs"
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
