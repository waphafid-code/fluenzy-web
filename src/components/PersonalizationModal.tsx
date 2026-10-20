'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sliders,
  X,
  Volume2,
  Sparkles,
  Target,
  Check,
  User,
  Zap,
} from 'lucide-react';
import {
  getUserPreferences,
  saveUserPreferences,
  UserPreferences,
  MascotChoice,
  LearningFocus,
  AudioSpeedChoice,
  COMPANIONS,
} from '@/lib/core/preferences';
import { speakText, speakBilingualText, playBubblePop } from '@/lib/audio/speech';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesChanged?: (prefs: UserPreferences) => void;
}

export function PersonalizationModal({
  isOpen,
  onClose,
  onPreferencesChanged,
}: PersonalizationModalProps) {
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());

  useEffect(() => {
    if (isOpen) {
      setPrefs(getUserPreferences());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function updateField<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    playBubblePop();
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    saveUserPreferences(next);
    onPreferencesChanged?.(next);
  }

  function handleTestAudio(speed: number) {
    playBubblePop();
    const isLily = prefs.mascot === 'lily' || prefs.mascot === 'girl';
    const sampleText = isLily
      ? 'Halo! Saya Lily, AI Peer kamu. Let\'s practice English together!'
      : 'Halo! Saya Arthur, Tech Lead kamu. Let\'s master English syntax with precision!';
    speakBilingualText(sampleText, { rate: speed });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#101C27] border border-[#1A2E40] rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A2E40] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 shadow-md">
              <Sliders className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Personalisasi Belajarmu
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Pilih karakter maskot pendamping, target XP harian, dan kecepatan audio
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playBubblePop();
              onClose();
            }}
            className="rounded-xl p-2 text-slate-400 hover:bg-[#182838] hover:text-white transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Companion Mascot Selection (Lily / Lumi & Arthur) */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-400" />
            2 Karakter Mentor 3D di Tahap 2
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Lily (AI Peer & Speaking Coach) */}
            <button
              type="button"
              onClick={() => updateField('mascot', 'lily')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2.5 cursor-pointer ${
                prefs.mascot === 'lily' || prefs.mascot === 'girl'
                  ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(0,229,117,0.2)]'
                  : 'border-[#1A2E40] hover:border-slate-600 bg-[#142433]'
              }`}
            >
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-cyan-950/40 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="/mascot/lily_head_circle.png"
                  alt="Lily"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-black text-sm text-white flex items-center justify-center gap-1.5">
                  Lily (Lumi)
                  {(prefs.mascot === 'lily' || prefs.mascot === 'girl') && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                  AI Peer & Speaking Coach
                </div>
                <div className="text-[10px] text-slate-400 italic mt-1 max-w-[200px]">
                  &ldquo;Kamu pasti bisa! Sedikit demi sedikit, pasti bisa!&rdquo;
                </div>
              </div>
            </button>

            {/* Arthur (Tech Lead & Diagnostic Mentor) */}
            <button
              type="button"
              onClick={() => updateField('mascot', 'arthur')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2.5 cursor-pointer ${
                prefs.mascot === 'arthur' || prefs.mascot === 'boy'
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,210,255,0.2)]'
                  : 'border-[#1A2E40] hover:border-slate-600 bg-[#142433]'
              }`}
            >
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-cyan-950/60 to-blue-950/40 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="/mascot/arthur_head_circle.png"
                  alt="Arthur"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-black text-sm text-white flex items-center justify-center gap-1.5">
                  Arthur
                  {(prefs.mascot === 'arthur' || prefs.mascot === 'boy') && (
                    <Check className="h-4 w-4 text-cyan-400" />
                  )}
                </div>
                <div className="text-[11px] font-bold text-cyan-400 mt-0.5">
                  Tech Lead & Diagnostic Mentor
                </div>
                <div className="text-[10px] text-slate-400 italic mt-1 max-w-[200px]">
                  &ldquo;Teknik yang tepat, membuatmu selangkah lebih maju.&rdquo;
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Daily Goal Target (XP) */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" />
            Target Harian XP
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[30, 50, 75, 100].map((xp) => (
              <button
                key={xp}
                type="button"
                onClick={() => updateField('dailyGoalXp', xp)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-black transition cursor-pointer ${
                  prefs.dailyGoalXp === xp
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'border-[#1A2E40] bg-[#142433] text-slate-300 hover:border-slate-500'
                }`}
              >
                {xp} XP
                <span className="block text-[10px] font-medium text-slate-400">
                  {xp <= 30 ? 'Santai' : xp <= 50 ? 'Standar' : xp <= 75 ? 'Intensif' : 'Master'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Audio Preferences (Kecepatan Suara & Turtle Mode) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-cyan-400" />
              Preferensi Audio & Kecepatan Suara
            </label>
            <span className="text-[11px] text-cyan-400 font-bold">
              Suara Natural Luna / Lily
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { speed: 0.8 as AudioSpeedChoice, label: '0.8x Lambat' },
              { speed: 0.95 as AudioSpeedChoice, label: '0.95x Natural (Default)' },
              { speed: 1.1 as AudioSpeedChoice, label: '1.1x Cepat' },
            ].map(({ speed, label }) => (
              <button
                key={speed}
                type="button"
                onClick={() => updateField('audioSpeed', speed)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  prefs.audioSpeed === speed
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                    : 'border-[#1A2E40] bg-[#142433] text-slate-300 hover:border-slate-500'
                }`}
              >
                <span>{label}</span>
                {prefs.audioSpeed === speed && <Check className="h-3.5 w-3.5 text-cyan-400" />}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#1A2E40]/60">
            <span className="text-xs text-slate-400">Uji Suara Karakter Aktif:</span>
            <button
              type="button"
              onClick={() => handleTestAudio(prefs.audioSpeed)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Dengarkan Contoh
            </button>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-2 border-t border-[#1A2E40] flex justify-end">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onClose();
            }}
            className="btn-neon-pill px-6 py-2.5 text-xs cursor-pointer"
          >
            Simpan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
