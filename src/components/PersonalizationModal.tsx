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
  Server,
  Cpu,
} from 'lucide-react';
import {
  getUserPreferences,
  saveUserPreferences,
  UserPreferences,
  MascotChoice,
  AudioSpeedChoice,
  EnglishAccentChoice,
  VoiceGenderChoice,
  VoiceEngineProvider,
  COMPANIONS,
} from '@/lib/core/preferences';
import { LottieToggle } from '@/components/ui/LottieToggle';
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
  const [vibeVoiceTesting, setVibeVoiceTesting] = useState(false);
  const [vibeVoiceStatus, setVibeVoiceStatus] = useState<string | null>(null);

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

  async function handleTestVibeVoice() {
    playBubblePop();
    const endpoint = prefs.vibeVoiceEndpoint?.trim();
    if (!endpoint) {
      setVibeVoiceStatus('Masukkan endpoint URL VibeVoice terlebih dahulu.');
      return;
    }

    setVibeVoiceTesting(true);
    setVibeVoiceStatus('Menghubungkan ke VibeVoice server...');

    try {
      let url = endpoint;
      if (!url.includes('/audio/speech') && !url.includes('/models/')) {
        url = `${url.replace(/\/+$/, '')}/v1/audio/speech`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (prefs.vibeVoiceApiKey?.trim()) {
        headers['Authorization'] = `Bearer ${prefs.vibeVoiceApiKey.trim()}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'microsoft/VibeVoice-1.5B',
          input: 'Hello from Microsoft VibeVoice in Fluenzy!',
          voice: prefs.englishAccent === 'uk' ? 'british-coach' : 'american-tutor',
          response_format: 'mp3',
        }),
      });

      if (!res.ok) {
        setVibeVoiceStatus(`Server merespons error ${res.status}.`);
        setVibeVoiceTesting(false);
        return;
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      setVibeVoiceStatus('✅ Terhubung! Memutar suara VibeVoice...');
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setVibeVoiceTesting(false);
        setVibeVoiceStatus('✅ Sukses! VibeVoice aktif dan siap digunakan.');
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setVibeVoiceTesting(false);
        setVibeVoiceStatus('⚠️ Audio diterima namun gagal diputar.');
      };
      await audio.play();
    } catch (e) {
      setVibeVoiceTesting(false);
      setVibeVoiceStatus(`❌ Gagal: ${e instanceof Error ? e.message : 'Koneksi ditolak'}`);
    }
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
      emotion: 'cheerful',
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
      emotion: 'cheerful',
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
      emotion: 'cheerful',
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
              onClick={() => {
                updateField('mascot', 'lily');
                speakText(COMPANIONS.lily.quote, { gender: 'female' });
              }}
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
                  Karakter Cewek • AI Peer Coach
                </div>
              </div>
            </button>

            {/* Arthur */}
            <button
              type="button"
              onClick={() => {
                updateField('mascot', 'arthur');
                speakText(COMPANIONS.arthur.quote, { gender: 'male' });
              }}
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
                  Karakter Cowok • Tech Lead Mentor
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
              Kustomisasi Suara & Gender AI
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Adaptif Dwibahasa
            </span>
          </div>

          {/* Gender Suara AI (Voice Gender Setting) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              1. Karakter Gender Suara AI:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'auto' as VoiceGenderChoice,
                  label: 'Sesuai Maskot (Otomatis)',
                  desc: 'Arthur: Suara Cowok, Lily: Suara Cewek',
                },
                {
                  id: 'male' as VoiceGenderChoice,
                  label: 'Suara Pria (Male)',
                  desc: 'Karakter suara cowok yang berwibawa & natural',
                },
                {
                  id: 'female' as VoiceGenderChoice,
                  label: 'Suara Wanita (Female)',
                  desc: 'Karakter suara cewek yang hangat & artikulatif',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    updateField('voiceGender', item.id);
                    const effective =
                      item.id === 'auto'
                        ? prefs.mascot === 'girl' || prefs.mascot === 'lily'
                          ? 'female'
                          : 'male'
                        : item.id;
                    const sample =
                      effective === 'male'
                        ? 'Hello! This is the male English coach voice.'
                        : 'Hello! This is the female English coach voice.';
                    speakText(sample, { gender: effective });
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col justify-between text-left cursor-pointer ${
                    prefs.voiceGender === item.id
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                      : 'border-[#1A2E40] bg-[#101C27] text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white font-black">{item.label}</span>
                    {prefs.voiceGender === item.id && (
                      <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] font-normal text-slate-400 mt-1 leading-relaxed">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Penyedia Mesin Suara (Engine Provider) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              2. Mesin Pengisi Suara (Voice Engine):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateField('voiceEngine', 'browser-groq')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  prefs.voiceEngine === 'browser-groq'
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                    : 'border-[#1A2E40] bg-[#101C27] text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  <div className="text-left">
                    <div className="text-white">Standar (Browser Neural TTS)</div>
                    <div className="text-[10px] font-normal text-slate-400">Instan, bebas kuota, & hemat memori</div>
                  </div>
                </div>
                {prefs.voiceEngine === 'browser-groq' && <Check className="h-4 w-4 text-cyan-400" />}
              </button>

              <button
                type="button"
                onClick={() => updateField('voiceEngine', 'vibevoice')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  prefs.voiceEngine === 'vibevoice'
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'border-[#1A2E40] bg-[#101C27] text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-white">Microsoft VibeVoice API</div>
                    <div className="text-[10px] font-normal text-slate-400">Frontier Voice AI, ultra-natural</div>
                  </div>
                </div>
                {prefs.voiceEngine === 'vibevoice' && <Check className="h-4 w-4 text-emerald-400" />}
              </button>
            </div>

            {/* Panel Konfigurasi VibeVoice */}
            {prefs.voiceEngine === 'vibevoice' && (
              <div className="mt-2 p-3 rounded-xl bg-[#0F1B27] border border-emerald-500/30 space-y-2.5 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300">
                      VibeVoice Endpoint URL:
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateField('vibeVoiceEndpoint', 'http://localhost:8000')}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A2E40] text-cyan-300 hover:bg-[#253E55]"
                      >
                        Localhost (8000)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            'vibeVoiceEndpoint',
                            'https://api-inference.huggingface.co/models/microsoft/VibeVoice-1.5B'
                          )
                        }
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A2E40] text-emerald-300 hover:bg-[#253E55]"
                      >
                        Hugging Face
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={prefs.vibeVoiceEndpoint || ''}
                    onChange={(e) => updateField('vibeVoiceEndpoint', e.target.value)}
                    placeholder="http://localhost:8000 atau https://..."
                    className="w-full text-xs font-mono bg-[#081018] border border-[#1A2E40] rounded-lg px-2.5 py-1.5 text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    API Key / Bearer Token (Opsional):
                  </label>
                  <input
                    type="password"
                    value={prefs.vibeVoiceApiKey || ''}
                    onChange={(e) => updateField('vibeVoiceApiKey', e.target.value)}
                    placeholder="hf_xxxxxxxx atau API token server"
                    className="w-full text-xs font-mono bg-[#081018] border border-[#1A2E40] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleTestVibeVoice}
                    disabled={vibeVoiceTesting}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Server className="h-3.5 w-3.5" />
                    <span>{vibeVoiceTesting ? 'Menghubungkan...' : 'Tes Koneksi VibeVoice'}</span>
                  </button>

                  {vibeVoiceStatus && (
                    <span className="text-[11px] text-slate-300 max-w-[280px] truncate">
                      {vibeVoiceStatus}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pilihan Aksen Bahasa Inggris */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              3. Pilihan Aksen Bahasa Inggris:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'auto' as EnglishAccentChoice, label: 'Auto Natural', code: 'AUTO' },
                { id: 'us' as EnglishAccentChoice, label: 'American (US)', code: 'US' },
                { id: 'uk' as EnglishAccentChoice, label: 'British (UK)', code: 'UK' },
                { id: 'au' as EnglishAccentChoice, label: 'Australian (AU)', code: 'AU' },
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
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#162738] text-cyan-400 border border-cyan-500/30">
                      {acc.code}
                    </span>
                    <span>{acc.label}</span>
                  </span>
                  {prefs.englishAccent === acc.id && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dropdown Suara Spesifik */}
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
                <option value="auto">Otomatis Natural (Rekomendasi)</option>
                {voices.allEnglish.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Suara Bahasa Indonesia */}
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
                <option value="auto">Otomatis Natural Indonesia (Rekomendasi)</option>
                {voices.indonesian.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Stress Test Buttons */}
          <div className="pt-2 border-t border-[#1A2E40] space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block">
              Uji Coba Langsung Suara & Artikulasi:
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
                <span>{isPlayingTest === 'en' ? 'Memutar Suara Inggris...' : 'Tes Suara Inggris'}</span>
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
                <span>{isPlayingTest === 'id' ? 'Memutar Suara Indonesia...' : 'Tes Suara Indonesia'}</span>
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
                  {isPlayingTest === 'bilingual' ? 'Memutar Campuran...' : 'Tes Campuran Dwibahasa'}
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

        {/* 5. TOGGLE INTERAKTIF: AUDIO & EFEK SUARA */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            Preferensi Suara & Interaksi
          </label>
          <div className="space-y-2.5">
            <LottieToggle
              id="pref-sound-effects"
              checked={prefs.soundEffectsEnabled}
              onChange={(checked) => updateField('soundEffectsEnabled', checked)}
              label="Efek Suara Sentuhan & Haptik (Sound FX)"
              description="Memutar efek audio saat menekan tombol, menyusun huruf, atau memilih jawaban."
            />
            <LottieToggle
              id="pref-auto-pronounce"
              checked={prefs.autoPronounce}
              onChange={(checked) => updateField('autoPronounce', checked)}
              label="Pelafalan Otomatis (Auto-Pronounce)"
              description="Secara otomatis menyuarakan kalimat atau kosakata baru begitu kartu latihan dibuka."
            />
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
