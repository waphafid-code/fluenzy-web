import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import {
  Flame,
  Zap,
  Award,
  Mic,
  ArrowRight,
  Sparkles,
  Volume2,
  BookOpen,
  Headphones,
  PenTool,
  Target,
  Gift,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'Beranda - Fluenzy AI',
  description: 'Platform latihan pelafalan dan komunikasi bahasa Inggris modern.',
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

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Alex';
  const userLevel = profile?.level || 'A2';
  const totalXp = profile?.xp ?? 350;
  const currentStreak = 12;

  return (
    <div className="space-y-7 sm:space-y-8 max-w-4xl mx-auto pb-8">
      {/* 1. HEADER (Hello, Alex! What do you want to learn today? + Streak) */}
      <div className="animate-fade-in-down flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Hello, {displayName}!</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400">
            What do you want to learn today?
          </p>
        </div>

        {/* Streak Counter Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-sm shrink-0 animate-fire-glow">
          <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse" />
          <span className="text-xs font-black font-mono">{currentStreak}</span>
        </div>
      </div>

      {/* 2. HERO CARD ("Pick up where you left off" - Matching Reference Image 1) */}
      <div className="animate-fade-in-up hero-lingua-card card-hover-lift p-6 sm:p-7 text-white relative">
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-md">
            <span className="inline-block text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white/90 border border-white/20">
              Pick up where you left off
            </span>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                English for Engineers & Career
              </h2>
              <p className="text-xs text-white/80 font-medium">
                Kuasai fonem teknis, diskusi standup, dan presentasi arsitektur.
              </p>
            </div>

            {/* Progress Bar with 65% */}
            <div className="space-y-1.5 max-w-xs">
              <div className="flex justify-between text-[11px] font-bold text-white/90">
                <span>Progres Sesi</span>
                <span className="font-mono">65%</span>
              </div>
              <div className="h-2 rounded-full bg-black/20 overflow-hidden backdrop-blur-xs">
                <div
                  style={{ width: '65%' }}
                  className="h-full bg-white rounded-full shadow-sm transition-all duration-500"
                />
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/learn/lesson-1"
                className="btn-lingua-white px-5 py-2.5 text-xs gap-2 font-black shadow-lg"
              >
                <span>Continue Learning</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#4338CA]" />
              </Link>
            </div>
          </div>

          {/* Friendly Mascot Avatar on Right with Greeting */}
          <div className="hidden sm:flex flex-col items-center shrink-0 relative self-end md:self-center">
            <div className="mb-2 px-3 py-1 rounded-2xl bg-white text-[#4338CA] text-xs font-black shadow-md border border-white/40 animate-bounce">
              ¡Hola! ✨
            </div>
            <div className="relative h-28 w-28 rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl bg-white/10 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
              <Image
                src="/mascot/lingua_girl_waving.jpg"
                alt="Fluenzy Mascot Mentor"
                width={112}
                height={112}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK PRACTICE (4 Soft Pastel Squircle Cards - Matching Reference Image 1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white tracking-tight">Quick Practice</h3>
          <span className="text-[11px] text-slate-400 font-medium">Practice anytime, anywhere</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Vocabulary */}
          <Link
            href="/practice/review"
            className="card-lingua p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 hover:scale-102 transition group cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-500/30 group-hover:bg-violet-500/30 transition shadow-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-black text-white">Vocabulary</div>
              <div className="text-[10px] text-slate-400 font-medium">Flashcard SRS</div>
            </div>
          </Link>

          {/* Card 2: Listening */}
          <Link
            href="/arena"
            className="card-lingua p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 hover:scale-102 transition group cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 group-hover:bg-rose-500/30 transition shadow-sm">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-black text-white">Listening</div>
              <div className="text-[10px] text-slate-400 font-medium">Audio Sample</div>
            </div>
          </Link>

          {/* Card 3: Speaking */}
          <Link
            href="/practice/speaking"
            className="card-lingua p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 hover:scale-102 transition group cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500/30 transition shadow-sm">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-black text-white">Speaking</div>
              <div className="text-[10px] text-slate-400 font-medium">Phonetic AI</div>
            </div>
          </Link>

          {/* Card 4: Grammar */}
          <Link
            href="/arena"
            className="card-lingua p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 hover:scale-102 transition group cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500/30 transition shadow-sm">
              <PenTool className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-black text-white">Grammar</div>
              <div className="text-[10px] text-slate-400 font-medium">Syntax Surgery</div>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. TODAY'S GOAL CARD (Matching Reference Image 1) */}
      <div className="card-lingua p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
            <Target className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Learn 20 new words today</span>
              <span className="text-[11px] font-mono text-violet-400 font-bold">12 / 20 words</span>
            </div>
            <div className="h-2 rounded-full bg-[#1A2736] overflow-hidden">
              <div
                style={{ width: '60%' }}
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Gift className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 5. MY COURSES / ACTIVE TRACKS (Matching Reference Image 1 Middle Section) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white tracking-tight">My Courses</h3>
          <Link
            href="/roadmap"
            className="text-xs font-bold text-violet-400 hover:text-violet-300 transition"
          >
            View All Roadmap →
          </Link>
        </div>

        <div className="space-y-2.5">
          {/* Course 1 */}
          <Link
            href="/roadmap"
            className="card-lingua p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-violet-500/50 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Mic className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  Speaking & Phonetics Masterclass
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 max-w-xs h-1.5 rounded-full bg-[#1A2736] overflow-hidden">
                    <div style={{ width: '65%' }} className="h-full bg-emerald-400 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">65% Completed</span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition" />
          </Link>

          {/* Course 2 */}
          <Link
            href="/roadmap"
            className="card-lingua p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-violet-500/50 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  Engineering RFCs & Documentation
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 max-w-xs h-1.5 rounded-full bg-[#1A2736] overflow-hidden">
                    <div style={{ width: '40%' }} className="h-full bg-cyan-400 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">40% Completed</span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition" />
          </Link>

          {/* Course 3 */}
          <Link
            href="/roadmap"
            className="card-lingua p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-violet-500/50 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Headphones className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  Technical Interview Listening
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 max-w-xs h-1.5 rounded-full bg-[#1A2736] overflow-hidden">
                    <div style={{ width: '20%' }} className="h-full bg-rose-400 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">20% Completed</span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition" />
          </Link>
        </div>
      </div>

      {/* 6. MOTIVATIONAL QUOTE CARD (Bottom Left of Reference Image) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-indigo-600/20 border border-violet-500/30 relative overflow-hidden flex items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold">
            Daily Fluency Inspiration
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium italic leading-relaxed">
            &ldquo;The best way to predict your future is to create it in another language.&rdquo;
          </p>
        </div>
        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
          <Sparkles className="h-5 w-5 text-violet-400" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-7 max-w-4xl mx-auto pb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 rounded-xl bg-slate-800 animate-pulse" />
              <div className="h-4 w-64 rounded-lg bg-slate-800/60 animate-pulse" />
            </div>
            <div className="h-8 w-20 rounded-full bg-slate-800 animate-pulse" />
          </div>
          <div className="h-56 rounded-3xl bg-slate-800/80 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
