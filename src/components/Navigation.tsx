'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Swords,
  BarChart3,
  User,
  Flame,
  Zap,
  Gem,
  FlaskConical,
  Sparkles,
  Settings,
} from 'lucide-react';
import { playBubblePop, speakText } from '@/lib/audio/speech';
import { getUserPreferences, getCompanionInfo, MascotChoice } from '@/lib/core/preferences';
import { PersonalizationModal } from '@/components/PersonalizationModal';

export interface NavTabItem {
  id: 'roadmap' | 'arena' | 'insights' | 'profile';
  label: string;
  sublabel: string;
  href: string;
  icon: React.ElementType;
}

export const NAV_TABS: NavTabItem[] = [
  {
    id: 'roadmap',
    label: 'Roadmap',
    sublabel: 'Peta Petualangan 50 Stage',
    href: '/roadmap',
    icon: Compass,
  },
  {
    id: 'arena',
    label: 'Arena',
    sublabel: 'Pusat Latihan 5 Mode Drill',
    href: '/arena',
    icon: Swords,
  },
  {
    id: 'insights',
    label: 'Insights',
    sublabel: 'Analitik & Performa',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    id: 'profile',
    label: 'Profile',
    sublabel: 'Profil, Liga & Pencapaian',
    href: '/profile',
    icon: User,
  },
];

interface NavigationProps {
  activeTab?: 'home' | 'roadmap' | 'arena' | 'insights' | 'profile';
}

export function Navigation({ activeTab }: NavigationProps) {
  const pathname = usePathname();
  const [mascotChoice, setMascotChoice] = useState<MascotChoice>('lily');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const prefs = getUserPreferences();
    setMascotChoice(prefs.mascot);

    const handlePrefChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.mascot) {
        setMascotChoice(customEvent.detail.mascot);
      }
    };
    window.addEventListener('fluenzy-preferences-updated', handlePrefChange);
    return () => window.removeEventListener('fluenzy-preferences-updated', handlePrefChange);
  }, []);

  const companion = getCompanionInfo(mascotChoice);

  // Auto-detect current active tab from pathname if not explicitly passed
  const currentTab =
    activeTab ||
    (pathname === '/home' || pathname.startsWith('/home')
      ? 'home'
      : pathname.startsWith('/roadmap')
      ? 'roadmap'
      : pathname.startsWith('/arena') || pathname.startsWith('/practice')
      ? 'arena'
      : pathname.startsWith('/dashboard') || pathname.startsWith('/insights')
      ? 'insights'
      : pathname.startsWith('/profile')
      ? 'profile'
      : undefined);

  function handleTabClick() {
    playBubblePop();
  }

  function handleCompanionGreeting() {
    playBubblePop();
    const greeting =
      companion.id === 'arthur' || companion.id === 'boy'
        ? 'Kamu semakin dekat dengan tujuanmu. Tetap konsisten!'
        : 'Ayo lanjutkan petualangan belajarmu hari ini!';
    speakText(greeting);
  }

  return (
    <>
      {/* TOP DESKTOP HEADER */}
      <header className="animate-fade-in-down sticky top-0 z-40 bg-[#080E15]/90 backdrop-blur-md border-b border-[#1A2E40]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* LOGO & BRAND */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={handleTabClick}
              className="flex items-center gap-2.5 group"
            >
              {/* Cyan & Green Cross Logo Mark */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(0,229,117,0.3)] group-hover:scale-105 transition">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0A131C]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-cyan-400 font-black text-lg">
                    ✦
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition">
                  Fluency
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 -mt-1">
                  Adaptive Language Learning
                </span>
              </div>
            </Link>
          </div>

          {/* DESKTOP 4 TABS */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#0F1B26] p-1.5 rounded-2xl border border-[#1A2E40]">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={handleTabClick}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'tab-cyber-active font-extrabold text-violet-300'
                      : 'tab-cyber-inactive'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT GAMIFIED STATS & COMPANION AVATAR */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#101C27] border border-[#1A2E40] text-xs font-bold text-amber-400 shadow-xs animate-fire-glow">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-500 animate-pulse" />
              <span className="tabular-nums">14 Hari</span>
            </div>

            {/* Total XP */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#101C27] border border-[#1A2E40] text-xs font-bold text-emerald-400 shadow-xs">
              <Zap className="h-4 w-4 fill-emerald-400 text-emerald-500" />
              <span className="tabular-nums">4,820</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#101C27] border border-[#1A2E40] text-xs font-bold text-cyan-400 shadow-xs animate-glow-pulse">
              <Gem className="h-4 w-4 fill-cyan-400 text-cyan-500" />
              <span className="tabular-nums">320</span>
            </div>

            {/* Companion Dialogue / Avatar Button */}
            <div className="flex items-center gap-2 pl-1 border-l border-[#1A2E40]">
              <button
                type="button"
                onClick={handleCompanionGreeting}
                title={`Sapa ${companion.name} (${companion.role})`}
                className="relative flex items-center gap-2 p-1 rounded-xl bg-[#142433] hover:bg-[#1A2F42] border border-[#1E374D] hover:border-emerald-500/40 transition group cursor-pointer"
              >
                <div className="relative h-7 w-7 rounded-lg overflow-hidden border border-emerald-400/40 bg-[#080E15]">
                  <Image
                    src={companion.avatar}
                    alt={companion.name}
                    width={28}
                    height={28}
                    className="object-cover"
                  />
                </div>
                <div className="hidden lg:flex flex-col text-left pr-1">
                  <span className="text-[11px] font-bold text-white group-hover:text-emerald-400 transition leading-tight">
                    {companion.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 leading-none">
                    {companion.role.split('&')[0]}
                  </span>
                </div>
              </button>

              {/* Personalization / Settings Trigger */}
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setIsModalOpen(true);
                }}
                title="Pengaturan & Personalisasi Maskot"
                className="p-1.5 rounded-xl bg-[#101C27] hover:bg-[#142433] border border-[#1A2E40] text-slate-400 hover:text-white transition cursor-pointer"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Matching Reference Image "Bottom Navigation Bar") */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1118]/95 backdrop-blur-lg border-t border-[#1E2E40] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={handleTabClick}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                isActive
                  ? 'text-violet-400 bg-violet-500/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
              <span className="text-[10px] font-bold mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <PersonalizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPreferencesChanged={(newPrefs) => setMascotChoice(newPrefs.mascot)}
      />
    </>
  );
}
