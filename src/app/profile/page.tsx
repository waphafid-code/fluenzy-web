'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Flame,
  Zap,
  Gem,
  FlaskConical,
  Award,
  Shield,
  Volume2,
  Check,
  ChevronRight,
  Settings,
  Sparkles,
  Trophy,
  Target,
  ExternalLink,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { playBubblePop, playCelebrationSound, speakText, speakTurtleMode } from '@/lib/audio/speech';
import {
  getUserPreferences,
  saveUserPreferences,
  UserPreferences,
  MascotChoice,
  AudioSpeedChoice,
  COMPANIONS,
  getCompanionInfo,
} from '@/lib/core/preferences';
import { PersonalizationModal } from '@/components/PersonalizationModal';

interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export default function ProfilePage() {
  const [prefs, setPrefs] = useState<UserPreferences>(() => getUserPreferences());
  const [activeTab, setActiveTab] = useState<'achievements' | 'preferences'>('achievements');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setPrefs(getUserPreferences());
    const handlePrefChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setPrefs(customEvent.detail);
      }
    };
    window.addEventListener('fluenzy-preferences-updated', handlePrefChange);
    return () => window.removeEventListener('fluenzy-preferences-updated', handlePrefChange);
  }, []);

  const companion = getCompanionInfo(prefs.mascot);

  const badges: BadgeItem[] = [
    {
      id: 'bug_hunter',
      name: 'Bug Hunter',
      desc: 'Selesaikan 10 drill tanpa typo',
      icon: '🛡️',
      unlocked: true,
      tier: 'gold',
    },
    {
      id: 'native_cadence',
      name: 'Native Cadence',
      desc: 'Akurasi intonasi sempurna 95%+',
      icon: '🎯',
      unlocked: true,
      tier: 'diamond',
    },
    {
      id: 'turtle_master',
      name: 'Turtle Master',
      desc: 'Gunakan Turtle Mode 10x untuk analisis audio',
      icon: '🐢',
      unlocked: true,
      tier: 'silver',
    },
    {
      id: 'global_citizen',
      name: 'Global Citizen',
      desc: 'Capai level CEFR B2 internasional',
      icon: '🌐',
      unlocked: true,
      tier: 'diamond',
    },
    {
      id: 'streak_warrior',
      name: 'Streak Warrior',
      desc: '7 hari berturut-turut konsisten berlatih',
      icon: '🔥',
      unlocked: true,
      tier: 'gold',
    },
    {
      id: 'tech_explorer',
      name: 'Tech Explorer',
      desc: 'Buka 5 unit vocabulary engineering',
      icon: '⚡',
      unlocked: false,
      tier: 'silver',
    },
  ];

  function handleSwitchMascot(choice: MascotChoice) {
    playBubblePop();
    const next = saveUserPreferences({ mascot: choice });
    setPrefs(next);
  }

  function handleTestAudio(speed: AudioSpeedChoice) {
    playBubblePop();
    const next = saveUserPreferences({ audioSpeed: speed });
    setPrefs(next);
    speakText('Suara audio dikonfigurasi ke kecepatan natural.', { rate: speed });
  }

  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-between pb-24 md:pb-12">
      <Navigation activeTab="profile" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full space-y-8">
        {/* PROFILE HEADER & IDENTITY (Matching Reference Image 1 Screen 4) */}
        <div className="card-cyber p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar Circle with Glow */}
            <div className="relative h-24 w-24 rounded-3xl overflow-hidden border-2 border-emerald-400 bg-[#0A131C] shadow-[0_0_25px_rgba(0,229,117,0.3)] shrink-0">
              <Image
                src={companion.avatar}
                alt="User Avatar"
                width={96}
                height={96}
                className="object-cover"
              />
            </div>

            {/* User Title & Level Progress */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Tech Polyglot
                </h1>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/40 shadow-[0_0_12px_rgba(0,229,117,0.2)]">
                  Lv. 12
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Adaptive Learner • Mentor Aktif:{' '}
                <span className="text-emerald-400 font-bold">{companion.name}</span>
              </p>

              {/* XP Progress Bar */}
              <div className="w-full sm:w-72 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">XP Progres Level</span>
                  <span className="text-emerald-400 font-mono">1,260 / 2,000 XP</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#142433] overflow-hidden">
                  <div
                    style={{ width: '63%' }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(0,229,117,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings & Personalization Action Button */}
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setIsModalOpen(true);
            }}
            className="btn-cyber-pill px-5 py-2.5 text-xs gap-2 shrink-0 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Personalisasi Maskot</span>
          </button>
        </div>

        {/* 4 STATS GRID (Streak 14 Hari, Total XP 4820, Gems 320, Lab Progress 6/10) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Streak */}
          <div className="card-cyber p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Flame className="h-6 w-6 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Streak</div>
              <div className="text-lg font-black text-amber-300 tabular-nums">14 Hari</div>
            </div>
          </div>

          {/* Total XP */}
          <div className="card-cyber p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(0,229,117,0.25)]">
              <Zap className="h-6 w-6 fill-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Total XP</div>
              <div className="text-lg font-black text-emerald-300 tabular-nums">4,820</div>
            </div>
          </div>

          {/* Gems */}
          <div className="card-cyber p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.25)]">
              <Gem className="h-6 w-6 fill-cyan-400" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Gems</div>
              <div className="text-lg font-black text-cyan-300 tabular-nums">320</div>
            </div>
          </div>

          {/* Lab Progress */}
          <div className="card-cyber p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              <FlaskConical className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Lab Progress</div>
              <div className="text-lg font-black text-purple-300 tabular-nums">6/10 Unit</div>
            </div>
          </div>
        </div>

        {/* LIGA SAAT INI (Silver League) */}
        <div className="card-cyber-glow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-400/20 border border-slate-300/40 text-slate-200 shadow-[0_0_20px_rgba(203,213,225,0.25)]">
                <Shield className="h-7 w-7 text-slate-200 fill-slate-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Kompetisi Mingguan
                </span>
                <h2 className="text-xl font-black text-white">Silver League</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span>Naik dalam 3 hari</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {/* Mini Leaderboard preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { rank: 1, name: 'Sarah W.', xp: 520, isUser: false },
              { rank: 2, name: 'You (Tech Polyglot)', xp: 480, isUser: true },
              { rank: 3, name: 'Alex K.', xp: 410, isUser: false },
            ].map((user) => (
              <div
                key={user.rank}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  user.isUser
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-white font-bold'
                    : 'bg-[#0A131C] border-[#1A2E40] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-400">#{user.rank}</span>
                  <span>{user.name}</span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">{user.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* MEDALI & LENCANA & AUDIO PREFERENCES (Matching Reference Image 1 Screen 4) */}
        <div className="card-cyber p-6 space-y-6">
          {/* Sub-Tabs */}
          <div className="flex items-center justify-between border-b border-[#1A2E40] pb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setActiveTab('achievements');
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'achievements'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(0,229,117,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Medali & Lencana
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setActiveTab('preferences');
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'preferences'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Audio & Mentor Preferences
              </button>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              {badges.filter((b) => b.unlocked).length} / {badges.length} Terbuka
            </span>
          </div>

          {/* TAB CONTENT 1: MEDALI & LENCANA */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  onClick={() => {
                    playBubblePop();
                    if (badge.unlocked) playCelebrationSound();
                  }}
                  className={`p-4 rounded-2xl border transition flex items-center gap-3.5 cursor-pointer ${
                    badge.unlocked
                      ? 'bg-[#0A131C] border-[#1E374D] hover:border-emerald-500/40'
                      : 'bg-[#0A131C]/50 border-[#1A2E40] opacity-50'
                  }`}
                >
                  <div className="text-3xl shrink-0 p-2 rounded-xl bg-[#142433] border border-[#1E374D]">
                    {badge.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">{badge.name}</h3>
                      {badge.unlocked && (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT 2: AUDIO & MENTOR PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Mentor Switcher */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Pilih Karakter Mentor 3D
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lily */}
                  <button
                    type="button"
                    onClick={() => handleSwitchMascot('lily')}
                    className={`p-4 rounded-2xl border-2 transition flex items-center gap-3.5 cursor-pointer text-left ${
                      prefs.mascot === 'lily' || prefs.mascot === 'girl'
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(0,229,117,0.2)]'
                        : 'border-[#1A2E40] bg-[#0A131C] hover:border-slate-600'
                    }`}
                  >
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-emerald-400/40 bg-[#080E15]">
                      <Image
                        src="/mascot/lily_head_circle.png"
                        alt="Lily"
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        Lily (Lumi)
                        {(prefs.mascot === 'lily' || prefs.mascot === 'girl') && (
                          <Check className="h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">
                        AI Peer & Speaking Coach
                      </div>
                      <div className="text-[10px] text-slate-400 italic mt-0.5">
                        &ldquo;Kamu pasti bisa! Sedikit demi sedikit, pasti bisa!&rdquo;
                      </div>
                    </div>
                  </button>

                  {/* Arthur */}
                  <button
                    type="button"
                    onClick={() => handleSwitchMascot('arthur')}
                    className={`p-4 rounded-2xl border-2 transition flex items-center gap-3.5 cursor-pointer text-left ${
                      prefs.mascot === 'arthur' || prefs.mascot === 'boy'
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                        : 'border-[#1A2E40] bg-[#0A131C] hover:border-slate-600'
                    }`}
                  >
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-cyan-400/40 bg-[#080E15]">
                      <Image
                        src="/mascot/arthur_head_circle.png"
                        alt="Arthur"
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        Arthur
                        {(prefs.mascot === 'arthur' || prefs.mascot === 'boy') && (
                          <Check className="h-4 w-4 text-cyan-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-cyan-400 mt-0.5">
                        Tech Lead & Diagnostic Mentor
                      </div>
                      <div className="text-[10px] text-slate-400 italic mt-0.5">
                        &ldquo;Teknik yang tepat, membuatmu selangkah lebih maju.&rdquo;
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Audio Speed & Turtle Mode Test */}
              <div className="space-y-3 pt-4 border-t border-[#1A2E40]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Kecepatan Suara TTS & Turtle Mode
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Voice: Natural Engine (American Accent)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { speed: 0.8 as AudioSpeedChoice, label: '0.8x Slow' },
                    { speed: 0.95 as AudioSpeedChoice, label: '0.95x Natural (Default)' },
                    { speed: 1.1 as AudioSpeedChoice, label: '1.1x Fast' },
                  ].map(({ speed, label }) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleTestAudio(speed)}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        prefs.audioSpeed === speed
                          ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                          : 'border-[#1A2E40] bg-[#0A131C] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span>{label}</span>
                      {prefs.audioSpeed === speed && <Check className="h-4 w-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A131C] border border-[#1A2E40] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🐢</span>
                    <div>
                      <div className="text-xs font-bold text-white">Turtle Mode 0.65x</div>
                      <div className="text-[11px] text-slate-400">
                        Untuk pengucapan artikulatif kata demi kata
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      speakTurtleMode('Let us test turtle mode pronunciation.');
                    }}
                    className="btn-cyber-pill px-3 py-1.5 text-xs cursor-pointer"
                  >
                    Dengarkan 0.65x
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <PersonalizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPreferencesChanged={(newPrefs) => setPrefs(newPrefs)}
      />
    </div>
  );
}
