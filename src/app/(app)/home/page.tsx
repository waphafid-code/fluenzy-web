import React, { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Zap, Award, Mic, ArrowRight, Sparkles, Volume2 } from 'lucide-react';

export const metadata = {
  title: 'Beranda - Fluenzy Pronounce AI',
  description: 'Dashboard utama latihan pelafalan bahasa Inggris.',
};

async function HomeContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ambil profil user
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Pembelajar';
  const userLevel = profile?.level || 'A1';
  const totalXp = profile?.xp ?? 0;
  const currentStreak = 1;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. SAPAAN PENGGUNA */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Platform Pelafalan AI
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
            Level {userLevel}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
          Halo, {displayName}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Siap melatih aksen bahasa Inggris Anda hari ini? Mari mulai dengan 1 sesi singkat.
        </p>
      </div>

      {/* 2. TIGA KARTU STATISTIK (STREAK, XP, LEVEL) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Kartu 1: Streak */}
        <Card className="border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-[#0A131C] p-3 sm:p-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-white">{currentStreak}</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hari Streak
            </span>
          </div>
        </Card>

        {/* Kartu 2: XP */}
        <Card className="border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-[#0A131C] p-3 sm:p-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-white">{totalXp}</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total XP
            </span>
          </div>
        </Card>

        {/* Kartu 3: Level */}
        <Card className="border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-[#0A131C] p-3 sm:p-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-white">{userLevel}</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tingkat CEFR
            </span>
          </div>
        </Card>
      </div>

      {/* 3. KARTU LATIHAN HARI INI */}
      <Card className="border-emerald-500/40 bg-gradient-to-br from-[#0F2231] via-[#0B1723] to-[#080E15] p-5 sm:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Mic className="h-44 w-44 text-emerald-400" />
        </div>

        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/20 text-emerald-300 text-xs font-bold">
              ✦
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Rekomendasi Harian
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Latihan Hari Ini: Fonem Sulit /θ/ & /ð/
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pelajari cara menempatkan ujung lidah di antara gigi depan untuk melafalkan kata{' '}
              <strong className="text-emerald-300">&ldquo;think&rdquo;</strong> dan{' '}
              <strong className="text-emerald-300">&ldquo;this&rdquo;</strong> secara akurat.
            </p>
          </div>

          {/* Contoh Mini Kalimat */}
          <div className="p-3.5 rounded-xl bg-[#070D14]/80 border border-[#1E374D] flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-white">&ldquo;I think this is very good.&rdquo;</div>
              <div className="text-xs font-mono text-cyan-400">/aɪ θɪŋk ðɪs ɪz ˈveri ɡʊd/</div>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#142433] text-slate-400">
              <Volume2 className="h-4 w-4" />
            </div>
          </div>

          <div className="pt-2">
            <Link href="/practice">
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2 font-black px-6">
                <Mic className="h-4 w-4" />
                <span>Mulai Latihan Sekarang</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 4. BANNER MOTIVASI SINGKAT */}
      <div className="p-4 rounded-xl bg-[#0E1722] border border-[#1E374D] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Tips Artikulasi Lidah</div>
            <div className="text-[11px] text-slate-400">
              Latihan 5 menit per hari lebih efektif daripada 1 jam per minggu.
            </div>
          </div>
        </div>
        <Link
          href="/practice"
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
        >
          Lihat Topik →
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-6 text-slate-400 text-xs">
          Memuat data beranda...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
