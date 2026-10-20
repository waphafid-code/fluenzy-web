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
  Languages,
  Mic,
  Compass,
} from 'lucide-react';
import {
  getUserPreferences,
  saveUserPreferences,
  UserPreferences,
  MascotChoice,
  AudioSpeedChoice,
  EnglishAccentChoice,
  COMPANIONS,
} from '@/lib/core/preferences';
import {
  speakText,
  speakBilingualText,
  stopSpeech,
  playBubblePop,
  getAvailableVoicesGrouped,
  GroupedVoices,
} from '@/lib/audio/speech';

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
  const [voices, setVoices] = useState<GroupedVoices>({
    indonesian: [],
    englishUS: [],
    englishUK: [],
    englishAU: [],
    allEnglish: [],
  });
  const [isPlayingTest, setIsPlayingTest] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrefs(getUserPreferences());
      setVoices(getAvailableVoicesGrouped());

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          setVoices(getAvailableVoicesGrouped());
        };
      }
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

  function handleTestEnglishVoice() {
    playBubblePop();
    stopSpeech();
    setIsPlayingTest('en');
    const text =
      prefs.englishAccent === 'uk'
        ? "Right then! Brilliant accent chosen. Let's practice English with proper British articulation."
        : prefs.englishAccent === 'au'
        ? "G'day! Wonderful choice mate. Let's sharpen your English speaking skills together."
        : "Awesome choice! Let's practice American English pronunciation and master your daily goals.";

    speakText(text, {
      lang: 'en-US',
      preferredAccent: prefs.englishAccent,
      customVoiceName: prefs.customEnglishVoice !== 'auto' ? prefs.customEnglishVoice : undefined,
      rate: prefs.audioSpeed,
      onEnd: () => setIsPlayingTest(null),
    });
  }

  function handleTestIndonesianVoice() {
    playBubblePop();
    stopSpeech();
    setIsPlayingTest('id');
    const text =
      'Halo! Ini adalah contoh suara bahasa Indonesia pilihanmu untuk penjelasan kaidah dan evaluasi.';

    speakText(text, {
      lang: 'id-ID',
      customVoiceName:
        prefs.customIndonesianVoice !== 'auto' ? prefs.customIndonesianVoice : undefined,
      rate: prefs.audioSpeed,
      onEnd: () => setIsPlayingTest(null),
    });
  }

  function handleTestBilingualAdaptation() {
    playBubblePop();
    stopSpeech();
    setIsPlayingTest('bilingual');
    const text =
      "Halo! Saya coach kamu. Kata 'resilience' berarti kemampuan bangkit dengan cepat. Let's master English together!";

    speakBilingualText(text, {
      rate: prefs.audioSpeed,
      preferredAccent: prefs.englishAccent,
      customVoiceName:
        prefs.customEnglishVoice !== 'auto' ? prefs.customEnglishVoice : undefined,
      onEnd: () => setIsPlayingTest(null),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0C1622] border border-[#1A2E40] rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A2E40] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 shadow-md">
              <Sliders className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Personalisasi & Voice Studio</h2>
              <p className="text-xs text-slate-400">
                Atur karakter AI, preferensi aksen native, dan penyesuaian suara dwibahasa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              stopSpeech();
              onClose();
            }}
            className="h-9 w-9 rounded-xl bg-[#142433] hover:bg-[#1A2E40] text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. SELEKSI MASKOT & KARAKTER AI */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-400" />
            Pilih AI Peer & Coach Utama
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Lily */}
            <button
              type="button"
              onClick={() => updateField('mascot', 'lily')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2.5 cursor-pointer ${
                prefs.mascot === 'lily' || prefs.mascot === 'girl'
                  ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(0,229,117,0.2)]'
                  : 'border-[#1A2E40] hover:border-slate-600 bg-[#142433]'
              }`}
            >
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-cyan-950/40 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="/mascot/lily_head_circle.png"
                  alt="Lily"
                  width={64}
                  height={64}
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
              </div>
            </button>

            {/* Arthur */}
            <button
              type="button"
              onClick={() => updateField('mascot', 'arthur')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2.5 cursor-pointer ${
                prefs.mascot === 'arthur' || prefs.mascot === 'boy'
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,210,255,0.2)]'
                  : 'border-[#1A2E40] hover:border-slate-600 bg-[#142433]'
              }`}
            >
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-cyan-950/60 to-blue-950/40 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="/mascot/arthur_head_circle.png"
                  alt="Arthur"
                  width={64}
                  height={64}
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
              </div>
            </button>
          </div>
        </div>

        {/* 2. VOICE-OVER ENGINE & ACCENT CUSTOMIZER */}
        <div className="p-4 rounded-2xl bg-[#081018] border border-cyan-500/40 space-y-4 shadow-inner">
          <div className="flex items-center justify-between border-b border-[#1A2E40] pb-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Languages className="h-4 w-4 text-cyan-400" />
              Kustomisasi Aksen & Pengisi Suara (Voice-Over)
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Adaptif Dwibahasa
            </span>
          </div>

          {/* A. Aksen Bahasa Inggris */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              1. Pilihan Aksen Bahasa Inggris:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'auto' as EnglishAccentChoice, label: '✨ Auto Natural', flag: '🌍' },
                { id: 'us' as EnglishAccentChoice, label: 'American (US)', flag: '🇺🇸' },
                { id: 'uk' as EnglishAccentChoice, label: 'British (UK)', flag: '🇬🇧' },
                { id: 'au' as EnglishAccentChoice, label: 'Australian (AU)', flag: '🇦🇺' },
              ].map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => updateField('englishAccent', acc.id)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    prefs.englishAccent === acc.id
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                      : 'border-[#1A2E40] bg-[#101C27] text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{acc.flag}</span>
                    <span>{acc.label}</span>
                  </span>
                  {prefs.englishAccent === acc.id && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* B. Dropdown Suara Spesifik Bahasa Inggris */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-cyan-400" />
                Spesifik Suara Bahasa Inggris:
              </label>
              <select
                value={prefs.customEnglishVoice}
                onChange={(e) => updateField('customEnglishVoice', e.target.value)}
                className="w-full text-xs font-mono bg-[#101C27] border border-[#1A2E40] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="auto">✨ Otomatis Terbaik (Rekomendasi)</option>
                {voices.allEnglish.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* C. Dropdown Suara Bahasa Indonesia */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-emerald-400" />
                Suara Bahasa Indonesia:
              </label>
              <select
                value={prefs.customIndonesianVoice}
                onChange={(e) => updateField('customIndonesianVoice', e.target.value)}
                className="w-full text-xs font-mono bg-[#101C27] border border-[#1A2E40] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="auto">✨ Otomatis Natural Indonesia (Rekomendasi)</option>
                {voices.indonesian.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* D. Interactive Stress Test Buttons */}
          <div className="pt-2 border-t border-[#1A2E40] space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block">
              Uji Coba Langsung Aksen & Adaptasi Bahasa:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleTestEnglishVoice}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                  isPlayingTest === 'en'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
                }`}
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{isPlayingTest === 'en' ? 'Memutar Aksen Inggris...' : '🔊 Tes Aksen Inggris'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestIndonesianVoice}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                  isPlayingTest === 'id'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(0,229,117,0.4)]'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                }`}
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{isPlayingTest === 'id' ? 'Memutar Suara Indonesia...' : '🔊 Tes Suara Indonesia'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestBilingualAdaptation}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                  isPlayingTest === 'bilingual'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {isPlayingTest === 'bilingual' ? 'Memutar Bahasa Campuran...' : '✨ Tes Campuran Dwibahasa'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. KECEPATAN SUARA (AUDIO SPEED) */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-cyan-400" />
            Kecepatan Bicara
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { speed: 0.8 as AudioSpeedChoice, label: '0.8x Lambat' },
              { speed: 0.95 as AudioSpeedChoice, label: '0.95x Alami (Default)' },
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
        </div>

        {/* 4. TARGET HARIAN XP */}
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
                className={`py-2 px-3 rounded-xl border text-xs font-black transition cursor-pointer ${
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

        {/* Footer */}
        <div className="pt-2 border-t border-[#1A2E40] flex justify-end">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              stopSpeech();
              onClose();
            }}
            className="btn-neon-pill px-8 py-3 text-xs cursor-pointer shadow-[0_0_20px_rgba(0,229,117,0.3)]"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
}
