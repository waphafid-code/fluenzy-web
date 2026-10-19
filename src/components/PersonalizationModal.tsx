'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Settings2,
  X,
  Volume2,
  Sparkles,
  Target,
  Compass,
  Check,
  User,
  Sliders,
} from 'lucide-react';
import {
  getUserPreferences,
  saveUserPreferences,
  UserPreferences,
  MascotChoice,
  LearningFocus,
  AudioSpeedChoice,
} from '@/lib/core/preferences';
import { speakText, playBubblePop, playCelebrationSound } from '@/lib/audio/speech';

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
    const sampleText =
      prefs.mascot === 'girl'
        ? "Hello! I am Maya, your personal English learning companion. Let's practice together!"
        : "Hello! I am Leo, your adaptive English coach. Let's master English step by step!";
    speakText(sampleText, { rate: speed });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="card-clay relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 p-6 md:p-8 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-md">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Personalisasi Belajarmu
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Atur karakter pendamping, target harian, dan preferensi belajar
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playBubblePop();
              onClose();
            }}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Companion Mascot Selection */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-500" />
            Pilih Karakter Maskot Pendamping
          </label>
          <div className="grid grid-cols-2 gap-3.5">
            {/* Leo (Boy) */}
            <button
              type="button"
              onClick={() => updateField('mascot', 'boy')}
              className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
                prefs.mascot === 'boy'
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-400/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
              }`}
            >
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-b from-emerald-100 to-teal-50 dark:from-emerald-900/50 dark:to-teal-950/40 flex items-center justify-center overflow-hidden">
                <Image
                  src="/mascot/mascot_boy_bust.png"
                  alt="Leo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="font-black text-sm text-slate-900 dark:text-white flex items-center justify-center gap-1">
                  Leo
                  {prefs.mascot === 'boy' && (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Cerdas & Analitis
                </div>
              </div>
            </button>

            {/* Maya (Girl) */}
            <button
              type="button"
              onClick={() => updateField('mascot', 'girl')}
              className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
                prefs.mascot === 'girl'
                  ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-400/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
              }`}
            >
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-b from-purple-100 to-pink-50 dark:from-purple-900/50 dark:to-pink-950/40 flex items-center justify-center overflow-hidden">
                <Image
                  src="/mascot/mascot_girl_bust.png"
                  alt="Maya"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="font-black text-sm text-slate-900 dark:text-white flex items-center justify-center gap-1">
                  Maya
                  {prefs.mascot === 'girl' && (
                    <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Teliti & Antusias
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Target Belajar Harian (Daily Goal) */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" />
            Target XP Harian
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { val: 20, label: 'Santai', time: '~5 mnt/hari' },
              { val: 50, label: 'Reguler', time: '~15 mnt/hari' },
              { val: 100, label: 'Intensif', time: '~30 mnt/hari' },
            ].map((option) => (
              <button
                key={option.val}
                type="button"
                onClick={() => updateField('dailyGoalXp', option.val)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                  prefs.dailyGoalXp === option.val
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="text-sm font-black">{option.val} XP</div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {option.label}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  {option.time}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Audio Speed & Voice Test */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-sky-500" />
              Kecepatan Suara Pronunciation
            </label>
            <button
              type="button"
              onClick={() => handleTestAudio(prefs.audioSpeed)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 rounded-lg transition-colors"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Uji Suara
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { val: 0.8 as AudioSpeedChoice, label: '0.85x (Pelan)' },
              { val: 0.95 as AudioSpeedChoice, label: '0.95x (Natural)' },
              { val: 1.1 as AudioSpeedChoice, label: '1.1x (Cepat)' },
            ].map((spd) => (
              <button
                key={spd.val}
                type="button"
                onClick={() => {
                  updateField('audioSpeed', spd.val);
                  handleTestAudio(spd.val);
                }}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-black transition-all ${
                  prefs.audioSpeed === spd.val
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 ring-2 ring-sky-400/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-850'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Fokus Pembelajaran (Learning Focus) */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-500" />
            Fokus Prioritas Belajar
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'balanced' as LearningFocus,
                title: 'Seimbang',
                desc: 'Kurikulum 30 hari standar',
              },
              {
                id: 'grammar' as LearningFocus,
                title: 'Tata Bahasa',
                desc: 'Remediasi titik lemah tenses',
              },
              {
                id: 'review' as LearningFocus,
                title: 'Review Cepat',
                desc: 'Fokus Spaced Repetition',
              },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => updateField('learningFocus', f.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  prefs.learningFocus === f.id
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-400/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="text-xs font-black flex items-center justify-between">
                  {f.title}
                  {prefs.learningFocus === f.id && (
                    <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {f.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playCelebrationSound();
              onClose();
            }}
            className="btn-clay-emerald px-6 py-2.5 text-xs font-black text-white uppercase tracking-wider"
          >
            Simpan & Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
