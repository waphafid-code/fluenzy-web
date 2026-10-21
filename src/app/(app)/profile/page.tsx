'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Flame,
  Gem,
  Heart,
  Award,
  Trophy,
  Shield,
  Zap,
  Sliders,
  LogOut,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Volume2,
  Mail,
  Swords,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { PersonalizationModal } from '@/components/PersonalizationModal';
import { getUserPreferences, getCompanionInfo, MascotChoice } from '@/lib/core/preferences';
import { playBubblePop, speakText } from '@/lib/audio/speech';
import { createClient } from '@/lib/supabase/client';

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    totalXp: number;
    gems: number;
    hearts: number;
    currentStreak: number;
    longestStreak: number;
    dailyGoalXp: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [mascotChoice, setMascotChoice] = useState<MascotChoice>('lily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userLevel, setUserLevel] = useState<string>('A1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prefs = getUserPreferences();
    setMascotChoice(prefs.mascot);

    async function loadData() {
      try {
        setLoading(true);
        const { data: authData } = await supabase.auth.getUser();
        const email = authData?.user?.email || 'budi@fluenzy.id';

        if (authData?.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('level, xp')
            .eq('id', authData.user.id)
            .single();

          if (profile?.level) {
            setUserLevel(profile.level);
          }
        }

        const res = await fetch(`/api/dashboard?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const json = await res.json();
          setProfileData(json);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const handlePrefChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.mascot) {
        setMascotChoice(customEvent.detail.mascot);
      }
    };
    window.addEventListener('fluenzy-preferences-updated', handlePrefChange);
    return () => window.removeEventListener('fluenzy-preferences-updated', handlePrefChange);
  }, [supabase]);

  const companion = getCompanionInfo(mascotChoice);

  const stats = profileData?.stats || {
    totalXp: 150,
    gems: 120,
    hearts: 5,
    currentStreak: 3,
    longestStreak: 7,
    dailyGoalXp: 50,
  };

  const user = profileData?.user || {
    id: 'user-default',
    name: 'Pembelajar Fluenzy',
    email: 'learner@fluenzy.id',
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* 1. HEADER SECTION */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Akun & Preferensi AI
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
            Level {userLevel}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Profil Pembelajar
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Kustomisasi maskot, dengarkan suara AI natural, dan pantau pencapaian liga Anda.
        </p>
      </div>

      {/* 2. PROFILE HERO CARD */}
      <Card className="border-[#1E374D] bg-[#0E1722] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Mascot Companion Avatar with Glowing Ring */}
          <div className="relative group shrink-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-[#102231] to-[#0A1520] border-2 border-emerald-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,117,0.25)] p-2">
              <Image
                src={companion.avatar}
                alt={companion.name}
                width={96}
                height={96}
                className="h-full w-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setIsModalOpen(true);
              }}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg transition hover:scale-110 active:scale-95 cursor-pointer"
              title="Ganti Karakter Maskot & Suara"
            >
              <Sliders className="h-4 w-4" />
            </button>
          </div>

          {/* User Details & League */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/40">
                Ruby League • Tier 1
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                Maskot: {companion.name} ({companion.role})
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {user.name}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 font-mono">
              <Mail className="h-3.5 w-3.5" />
              <span>{user.email}</span>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  playBubblePop();
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs font-bold"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Kustomisasi Maskot & Voice</span>
              </Button>

              <SignOutButton />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. CORE GAMIFICATION METRICS (4 Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="p-4 rounded-2xl bg-[#0E1722] border border-amber-500/30 flex items-center gap-3 shadow-lg">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Flame className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{stats.currentStreak} Hari</div>
            <div className="text-[11px] font-bold text-slate-400">Streak Belajar</div>
          </div>
        </div>

        {/* XP */}
        <div className="p-4 rounded-2xl bg-[#0E1722] border border-emerald-500/30 flex items-center gap-3 shadow-lg">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Zap className="h-5 w-5 fill-emerald-400 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{stats.totalXp} XP</div>
            <div className="text-[11px] font-bold text-slate-400">Total Pengalaman</div>
          </div>
        </div>

        {/* Gems */}
        <div className="p-4 rounded-2xl bg-[#0E1722] border border-cyan-500/30 flex items-center gap-3 shadow-lg">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Gem className="h-5 w-5 fill-cyan-400 text-cyan-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{stats.gems}</div>
            <div className="text-[11px] font-bold text-slate-400">Permata Fluenzy</div>
          </div>
        </div>

        {/* Hearts */}
        <div className="p-4 rounded-2xl bg-[#0E1722] border border-rose-500/30 flex items-center gap-3 shadow-lg">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{stats.hearts} / 5</div>
            <div className="text-[11px] font-bold text-slate-400">Nyawa Tersedia</div>
          </div>
        </div>
      </div>

      {/* 4. ACHIEVEMENTS & BADGES */}
      <Card className="border-[#1E374D] bg-[#0E1722] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E374D] pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-black text-white tracking-wide uppercase">
              Pencapaian & Medali Belajar
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            4 / 4 Terbuka
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0A131C] border border-amber-500/30 flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>First Steps</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Menyelesaikan sesi adaptif perdana di Fluenzy.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A131C] border border-cyan-500/30 flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Volume2 className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Pronounce Pro</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Skor akurasi fonem di atas 80% pada tes pelafalan.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A131C] border border-purple-500/30 flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Streak Master</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Konsisten melatih aksen tanpa bolos.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A131C] border border-emerald-500/30 flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Leitner Genius</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Review pengulangan berjarak 5 kotak memori.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. QUICK NAVIGATION SHORTCUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/roadmap"
          className="p-4 rounded-2xl bg-[#0E1722] border border-[#1E374D] hover:border-emerald-400 transition group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              <Compass className="h-5 w-5" />
            </div>
            <div className="text-xs font-black text-white group-hover:text-emerald-300">
              Roadmap 50 Stage
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jelajahi peta petualangan bertingkat dari A1 hingga C2.
            </p>
          </div>
        </Link>

        <Link
          href="/arena"
          className="p-4 rounded-2xl bg-[#0E1722] border border-[#1E374D] hover:border-cyan-400 transition group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 font-bold">
              <Swords className="h-5 w-5" />
            </div>
            <div className="text-xs font-black text-white group-hover:text-cyan-300">
              Practice Arena
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Drill pengucapan kata, susun kalimat, dan spelling blitz.
            </p>
          </div>
        </Link>

        <Link
          href="/mistakes"
          className="p-4 rounded-2xl bg-[#0E1722] border border-[#1E374D] hover:border-amber-400 transition group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div className="text-xs font-black text-white group-hover:text-amber-300">
              Bank Kesalahan Leitner
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Kaji ulang kata-kata yang sempat salah hingga tuntas.
            </p>
          </div>
        </Link>
      </div>

      <PersonalizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
