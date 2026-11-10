import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyWarmupBanner } from '@/components/DailyWarmupBanner';
import {
  Mic,
  Puzzle,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  BookOpen,
  Volume2,
  Award,
  Brain,
  MessageSquare,
  Layers,
} from 'lucide-react';

export const metadata = {
  title: 'Studio Latihan & Kurikulum Tematik - Fluenzy',
  description: 'Pusat latihan berbicara, pola kalimat siap pakai (chunks), dan review adaptif dwibahasa.',
};

export default function PracticeHubPage() {
  const modes = [
    {
      title: 'Micro-Roleplay Interaktif (Bebas Grogi)',
      tag: 'Bilingual Scaffold',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      description:
        'Simulasi percakapan nyata 2 giliran santai dengan AI Voice. Dilengkapi tombol penyelamat "Help Me Say This" jika grogi atau macet!',
      href: '/practice/roleplay',
      icon: MessageSquare,
      iconColor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
      cta: 'Mulai Obrolan Santai',
    },
    {
      title: 'Pola Kalimat Siap Pakai (Sentence Chunks)',
      tag: 'Metode Chunking',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description:
        'Kuasai bongkahan kalimat siap pakai (A1–B1) dengan metode slot substitution. Latih variasi kalimat tanpa pusing rumus grammar!',
      href: '/practice/chunks',
      icon: Puzzle,
      iconColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      cta: 'Mulai Rakit Pola Kalimat',
    },
    {
      title: 'Studio Pasangan Minimal (Minimal Pairs)',
      tag: 'Pemutus Interferensi L1',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description:
        'Latihan membedakan pasangan kata yang sering tertukar oleh penutur Indonesia (/θ/ vs /t/, /v/ vs /f/, /iː/ vs /ɪ/) dengan panduan artikulasi lidah & bibir.',
      href: '/practice/minimal-pairs',
      icon: Layers,
      iconColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      cta: 'Buka Studio Pasangan Minimal',
    },
    {
      title: 'Skenario Percakapan Berjenjang (A1, A2, B1)',
      tag: 'Spektrogram & AI Scoring',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      description:
        '15 skenario interaktif untuk Karir & IT, Sidang Skripsi, Wisata Kafe, dan Percakapan Santai dengan tips fonem kritis penutur Indonesia.',
      href: '/practice/speaking',
      icon: Mic,
      iconColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      cta: 'Latih Skenario Berbicara',
    },
    {
      title: 'Pengulangan Berjarak (Spaced Repetition)',
      tag: 'Leitner System',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description:
        'Latih kembali kata-kata yang sempat salah lafal sesuai jadwal optimal daya ingat memori jangka panjang.',
      href: '/practice/review',
      icon: RotateCcw,
      iconColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      cta: 'Buka Sesi Review Harian',
    },
    {
      title: 'Penguatan Titik Lemah (Weakness Drill)',
      tag: 'Bebas Risiko Hati',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description:
        'Fokus menembus 3 skill fonetik yang paling membutuhkan penguatan tanpa takut kehabisan nyawa atau kehilangan streak.',
      href: '/practice/weakness',
      icon: ShieldAlert,
      iconColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
      cta: 'Perbaiki Titik Lemah',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Studio Latihan &amp; Kurikulum
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-mono text-cyan-400">Tahap 2: Bank Materi Tematik</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Pusat Latihan Berbicara &amp; Pola Kalimat
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Pilih metode latihan yang sesuai dengan kebutuhanmu hari ini. Semua modul dirancang dengan
          pendekatan <strong>Bilingual Sandwich</strong> yang ramah dan langsung dapat dipraktikkan.
        </p>
      </div>

      {/* Sesi Pemanasan 60 Detik Anti-Burnout (Micro-Habit Loop) */}
      <DailyWarmupBanner />

      {/* KARTU TES DIAGNOSTIK & PRE/POST TEST SKRIPSI */}
      <div className="card-cyber p-5 sm:p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-[#0A131C] to-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
              Placement &amp; Pre-Test
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[10px] font-mono text-emerald-400">Kalibrasi Akustik 3 Menit</span>
          </div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Brain className="h-4 w-4 text-cyan-400" />
            <span>Tes Diagnostik Penempatan CEFR (Pre-Test / Post-Test)</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ukur baseline akurasi fonetikmu melalui 3 butir uji berjenjang (A1, A2, B1). Hasil tes akan secara otomatis mengalibrasi rekomendasi kurikulum dan tersimpan sebagai baseline riset efektivitas (Hake Gain).
          </p>
        </div>
        <Link
          href="/practice/diagnostic"
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-lg shrink-0 cursor-pointer self-start sm:self-center"
        >
          <span>Mulai Tes Diagnostik</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Card
              key={mode.href}
              className="border-[#1E374D] bg-[#0E1722] p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${mode.iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${mode.badgeColor}`}
                  >
                    {mode.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-base font-black text-white group-hover:text-emerald-300 transition">
                    {mode.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">{mode.description}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E374D]/60">
                <Link href={mode.href} className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold justify-between border-[#1E374D] hover:border-emerald-400 hover:text-emerald-300 group-hover:bg-emerald-500/10 transition"
                  >
                    <span>{mode.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
