'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LottiePlayer } from '@/components/ui/LottiePlayer';
import {
  Heart,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Volume2,
  Brain,
  Award,
  Zap,
  Gauge,
  Lightbulb,
  Sliders,
  Play,
  Pause,
  ChevronRight,
  Headphones,
  Shield,
  Gem,
} from 'lucide-react';
import { PersonalizationModal } from '@/components/PersonalizationModal';
import { getUserPreferences, getCompanionInfo, MascotChoice } from '@/lib/core/preferences';
import {
  speakText,
  speakWord,
  speakLetter,
  speakTurtleMode,
  speakBilingualText,
  extractEnglishTarget,
  stopSpeech,
  playBubblePop,
  playCelebrationSound,
} from '@/lib/audio/speech';

export interface QuestionData {
  id: string;
  lessonId: string;
  skillId: string;
  skill?: { name: string };
  type: string;
  difficulty: number;
  prompt: string;
  payload: string;
  explanation: string;
}

interface SessionPlayerProps {
  mode: 'lesson' | 'weakness' | 'review';
  lessonId?: string;
  title: string;
}

const CELEBRATION_TITLES = [
  'Luar Biasa',
  'Kerja Bagus',
  'Tepat Sekali',
  'Sempurna',
  'Jawaban Sangat Tepat',
  'Artikulasi Akurat',
];

export function SessionPlayer({ mode, lessonId, title }: SessionPlayerProps) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Companion & Audio Speed
  const [mascotChoice, setMascotChoice] = useState<MascotChoice>('lily');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [isTurtleMode, setIsTurtleMode] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPlayingTargetOnly, setIsPlayingTargetOnly] = useState<boolean>(false);
  const [isPlayingExplanation, setIsPlayingExplanation] = useState<boolean>(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);

  useEffect(() => {
    const prefs = getUserPreferences();
    setMascotChoice(prefs.mascot);
    setSpeechRate(prefs.audioSpeed);

    const handlePrefChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.mascot) setMascotChoice(customEvent.detail.mascot);
        if (customEvent.detail.audioSpeed) setSpeechRate(customEvent.detail.audioSpeed);
      }
    };
    window.addEventListener('fluenzy-preferences-updated', handlePrefChange);
    return () => window.removeEventListener('fluenzy-preferences-updated', handlePrefChange);
  }, []);

  const companion = getCompanionInfo(mascotChoice);

  // Companion Message
  const [companionMessage, setCompanionMessage] = useState<string>(
    'Ayo mulai! Aku siap mendampingimu!'
  );

  // Jawaban & State Interaktif
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [wordOrderTokens, setWordOrderTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  // Hasil Jawaban & Feedback
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [celebrationTitle, setCelebrationTitle] = useState('Tepat Sekali!');
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    errorType: string | null;
    detail: string;
    explanation: string;
    explanationSource: string;
    correctAnswer: string;
    xpEarned: number;
    weakSkillBonusEarned: number;
    newMastery: number;
    masteryDelta: number;
    skillName: string;
    heartsRemaining: number;
    canContinueSession: boolean;
  } | null>(null);

  // Rekapitulasi Sesi
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [heartsOut, setHeartsOut] = useState(false);

  // Pengukuran Waktu Respons
  const startTimeRef = useRef<number>(Date.now());

  // Ambil data soal dari server
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const url = `/api/session/questions?mode=${mode}${lessonId ? `&lessonId=${lessonId}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Gagal mengambil daftar soal.');
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [mode, lessonId]);

  // Reset state saat berganti soal
  const currentQ = questions[currentIndex];
  useEffect(() => {
    if (!currentQ) return;
    startTimeRef.current = Date.now();
    stopSpeech();
    setSelectedOption('');
    setTextAnswer('');
    setFeedback(null);
    setIsPlayingAudio(false);
    setIsPlayingTargetOnly(false);
    setIsPlayingExplanation(false);

    // Siapkan token untuk word_order
    if (currentQ.type === 'word_order') {
      try {
        const payload = JSON.parse(currentQ.payload);
        const tokens: string[] = payload.tokens || [];
        setAvailableTokens([...tokens].sort(() => Math.random() - 0.5));
        setWordOrderTokens([]);
      } catch {
        setAvailableTokens([]);
        setWordOrderTokens([]);
      }
    }

    setCompanionMessage(
      companion.id === 'arthur' || companion.id === 'boy'
        ? 'Fokus pada pola kalimat dan struktur teknisnya.'
        : 'Kamu pasti bisa! Sedikit demi sedikit, pasti bisa!'
    );
  }, [currentIndex, currentQ, companion]);

  // Audio Playback
  // Audio Playback: Memutar soal dengan transisi bahasa yang tepat
  function handlePlayAudio() {
    if (!currentQ) return;
    playBubblePop();
    setIsPlayingAudio(true);
    setIsPlayingTargetOnly(false);
    const textToSpeak = currentQ.prompt;
    if (isTurtleMode) {
      speakTurtleMode(textToSpeak, {
        onEnd: () => setIsPlayingAudio(false),
      });
    } else {
      speakBilingualText(textToSpeak, {
        rate: speechRate,
        onEnd: () => setIsPlayingAudio(false),
      });
    }
  }

  // Audio Playback: Hanya memutar target kalimat bahasa Inggris
  function handlePlayTargetOnly() {
    if (!currentQ) return;
    const target = extractEnglishTarget(currentQ.prompt);
    if (!target) {
      handlePlayAudio();
      return;
    }
    playBubblePop();
    setIsPlayingTargetOnly(true);
    setIsPlayingAudio(false);
    speakText(target, {
      lang: 'en-US',
      rate: isTurtleMode ? 0.65 : speechRate,
      onEnd: () => setIsPlayingTargetOnly(false),
    });
  }

  // Audio Playback: Memutar penjelasan kaidah bilingual
  function handlePlayExplanation(explanationText?: string) {
    if (!explanationText) return;
    if (isPlayingExplanation) {
      stopSpeech();
      setIsPlayingExplanation(false);
      return;
    }
    playBubblePop();
    setIsPlayingExplanation(true);
    speakBilingualText(explanationText, {
      rate: speechRate,
      onStart: () => setIsPlayingExplanation(true),
      onEnd: () => setIsPlayingExplanation(false),
    });
  }

  // Kirim Jawaban
  async function handleSubmitAnswer() {
    if (isEvaluating || feedback || !currentQ) return;

    let finalUserAnswer = '';
    if (currentQ.type === 'multiple_choice') {
      finalUserAnswer = selectedOption;
    } else if (currentQ.type === 'fill_blank') {
      finalUserAnswer = textAnswer.trim();
    } else if (currentQ.type === 'word_order') {
      finalUserAnswer = wordOrderTokens.join(' ');
    }

    if (!finalUserAnswer) return;

    const responseTimeMs = Math.max(500, Date.now() - startTimeRef.current);
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/session/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          userAnswer: finalUserAnswer,
          exerciseType: currentQ.type,
          responseTimeMs,
          isWeakPractice: mode === 'weakness',
        }),
      });

      const result = await res.json();
      setFeedback(result);

      if (result.isCorrect) {
        playCelebrationSound();
        const randomTitle =
          CELEBRATION_TITLES[Math.floor(Math.random() * CELEBRATION_TITLES.length)];
        setCelebrationTitle(randomTitle);
        setCorrectCount((prev) => prev + 1);
        setTotalXpEarned((prev) => prev + (result.xpEarned || 10));
        setCompanionMessage(randomTitle);
      } else {
        setCompanionMessage('Jangan khawatir! Cermati pembahasannya ya.');
        if (!result.canContinueSession) {
          setHeartsOut(true);
        }
      }
    } catch {
      alert('Gagal mengirimkan jawaban. Periksa koneksi.');
    } finally {
      setIsEvaluating(false);
    }
  }

  // Lanjut ke soal berikutnya
  function handleNextQuestion() {
    stopSpeech();
    setIsPlayingAudio(false);
    setIsPlayingTargetOnly(false);
    setIsPlayingExplanation(false);
    if (currentIndex + 1 < questions.length) {
      playBubblePop();
      setCurrentIndex((prev) => prev + 1);
    } else {
      playCelebrationSound();
      setSessionCompleted(true);
    }
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080E15] text-white p-6">
        <div className="card-cyber-glow p-8 text-center space-y-4 max-w-sm animate-fade-in-scale">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <LottiePlayer
              animationPath="/animations/live_signal_pulse.json"
              className="w-16 h-16"
            />
          </div>
          <h3 className="font-extrabold text-white text-base">Menyiapkan Sesi Belajar</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Menghubungkan AI Adaptive Engine & materi personalisasi...
          </p>
        </div>
      </div>
    );
  }

  // ERROR OR EMPTY STATE
  if (error || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080E15] text-white p-6">
        <div className="card-cyber max-w-md p-8 text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-400" />
          <h2 className="text-xl font-black text-white">Belum Ada Soal Tersedia</h2>
          <p className="text-xs text-slate-400">
            {error || 'Bank soal untuk kategori ini sedang kosong.'}
          </p>
          <Link
            href="/roadmap"
            className="btn-neon-pill px-6 py-3 text-xs"
          >
            Kembali ke Roadmap
          </Link>
        </div>
      </div>
    );
  }

  // HEARTS OUT MODAL
  if (heartsOut) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="card-cyber w-full max-w-md p-8 text-center space-y-5 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <Heart className="h-10 w-10 fill-rose-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Hatimu Telah Habis!</h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Kamu bisa beristirahat sejenak atau melanjutkan latihan tanpa risiko kehilangan hati di Practice Arena.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/practice/weakness"
              className="btn-neon-pill w-full py-3 text-xs gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Latihan Titik Lemah (Zero Risk ❤️)
            </Link>
            <Link
              href="/dashboard"
              className="btn-cyber-pill w-full py-3 text-xs"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SESSION COMPLETED CELEBRATION
  if (sessionCompleted) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080E15] text-white p-6">
        <div className="card-cyber-glow w-full max-w-lg p-8 text-center space-y-6 shadow-[0_0_40px_rgba(0,229,117,0.2)]">
          {/* Avatar Mentor Merayakan dengan Lottie Achievement Confetti */}
          <div className="flex flex-col items-center justify-center -mb-4 relative">
            <div className="w-56 h-36 -mb-12 pointer-events-none z-10">
              <LottiePlayer
                animationPath="/animations/achievement_certify.json"
                loop={true}
                className="w-full h-full scale-110"
              />
            </div>
            <div className="relative h-24 w-24 rounded-3xl overflow-hidden border-2 border-emerald-400 bg-[#080E15] shadow-[0_0_25px_rgba(0,229,117,0.4)] z-0">
              <Image
                src={companion.avatar}
                alt={companion.name}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Selesai!
            </span>
            <h2 className="text-3xl font-black text-white mt-2">
              Latihan Selesai
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">{title}</p>
          </div>

          {/* Kartu Metrik Hasil */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0A131C] border border-[#1A2E40]">
              <span className="text-xs font-bold text-slate-400">Total XP Didapat</span>
              <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center justify-center gap-1 font-mono">
                <Zap className="h-5 w-5 fill-emerald-400 text-emerald-400" />
                +{totalXpEarned} XP
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#0A131C] border border-[#1A2E40]">
              <span className="text-xs font-bold text-slate-400">Akurasi Jawaban</span>
              <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">
                {accuracy}%
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/roadmap"
              onClick={() => playBubblePop()}
              className="btn-neon-pill w-full py-3.5 text-xs gap-2"
            >
              <span>Melangkah di Roadmap 50 Stage</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/arena"
              onClick={() => playBubblePop()}
              className="btn-cyber-pill w-full py-3.5 text-xs gap-2"
            >
              <span>Masuk ke Practice Arena</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PARSE OPTIONS
  let options: string[] = [];
  try {
    const payload = JSON.parse(currentQ.payload);
    options = payload.options || [];
  } catch {
    options = [];
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-between relative overflow-hidden">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />

      {/* 1. TOP PROGRESS BAR & GAMIFIED STATUS (Matching Reference Image 3 Screen 5) */}
      <header className="border-b border-[#1A2E40] bg-[#080E15]/90 backdrop-blur-md px-4 py-3 sm:px-8 sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          {/* Exit Button */}
          <Link
            href="/roadmap"
            onClick={() => playBubblePop()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101C27] border border-[#1A2E40] text-slate-400 hover:text-white hover:border-slate-500 transition"
            title="Keluar dari sesi"
          >
            <X className="h-5 w-5" />
          </Link>

          {/* Progress Bar with Glowing Emerald Fill */}
          <div className="flex-1 max-w-md h-3 rounded-full bg-[#101C27] border border-[#1A2E40] overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,229,117,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question Counter (e.g. 1/6) */}
          <div className="text-xs font-mono font-black text-slate-300 bg-[#101C27] px-3 py-1.5 rounded-xl border border-[#1A2E40]">
            {currentIndex + 1} / {questions.length}
          </div>

          {/* Health / Heart Status */}
          <div className="flex items-center gap-2">
            {mode === 'weakness' ? (
              <span className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Bebas Risiko ❤️
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-400 bg-rose-500/15 border border-rose-500/40 px-3 py-1.5 rounded-xl shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                <Heart className="h-4 w-4 fill-rose-500 animate-pulse" />
                <span className="font-mono">{feedback?.heartsRemaining ?? 5}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. LEARNING CONTENT AREA */}
      <main className="mx-auto flex flex-1 w-full max-w-4xl flex-col items-center justify-center px-4 py-8 space-y-6">
        {/* SKILL PILLS & LEVEL ESTIMATE HEADER */}
        <div className="w-full flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {currentQ.skill?.name || 'Listening'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#142433] text-cyan-400 border border-[#1E374D]">
              Tech Vocab
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#142433] text-purple-400 border border-[#1E374D]">
              Grammar
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold">Estimated Level:</span>
            <span className="text-xs font-mono font-black text-emerald-400 bg-[#101C27] border border-emerald-500/30 px-2.5 py-0.5 rounded-lg shadow-[0_0_8px_rgba(0,229,117,0.2)]">
              B1+ → B2
            </span>
          </div>
        </div>

        {/* AUDIO PLAYER & WAVEFORM CARD (Matching Reference Image 3 Screen 5) */}
        <div className="card-cyber w-full p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dengarkan percakapan berikut lalu pilih jawaban yang paling tepat.</span>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setIsTurtleMode(!isTurtleMode);
              }}
              className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition cursor-pointer ${
                isTurtleMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-[#142433] text-slate-300 border-[#1A2E40]'
              }`}
            >
              Mode Lambat 0.65x {isTurtleMode ? 'Aktif' : 'Mati'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A131C] border border-[#1A2E40] flex items-center gap-3.5">
            <button
              type="button"
              onClick={handlePlayAudio}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,210,255,0.4)] transition cursor-pointer"
              title="Putar Audio Soal Lengkap"
            >
              {isPlayingAudio ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 fill-slate-950 ml-0.5" />
              )}
            </button>

            {/* Dynamic Waveform */}
            <div className="flex-1 flex items-center gap-1.5 h-8">
              {[40, 70, 85, 55, 95, 65, 45, 80, 60, 35, 75, 90, 50, 65, 80, 40].map((h, i) => (
                <div
                  key={i}
                  style={{ height: isPlayingAudio || isPlayingTargetOnly ? `${h}%` : '25%' }}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    isPlayingAudio || isPlayingTargetOnly
                      ? 'bg-cyan-400 shadow-[0_0_6px_rgba(0,210,255,0.5)]'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <span className="text-xs font-mono text-slate-400">Audio Drill</span>
          </div>

          {/* VISUAL BILINGUAL SEPARATION (Indonesia Instruction vs English Target) */}
          {(() => {
            const rawPrompt = currentQ.prompt || '';
            const quoteMatch = /^(.*?)(["'“‘`][^"'”’`]+["'”’`])(.*)$/.exec(rawPrompt);
            const colonMatch = !quoteMatch && rawPrompt.includes(':') ? rawPrompt.split(':') : null;

            let instruction = '';
            let target = rawPrompt;
            let suffix = '';

            if (quoteMatch) {
              instruction = quoteMatch[1].replace(/[:\-–—]+$/, '').trim();
              target = quoteMatch[2].replace(/^["'“‘`]|["'”’`]$/g, '').trim();
              suffix = quoteMatch[3].replace(/^[:\-–—]+/, '').trim();
            } else if (colonMatch) {
              instruction = colonMatch[0].trim();
              target = colonMatch.slice(1).join(':').trim();
            }

            return (
              <div className="space-y-2 pt-1">
                {instruction && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                      🇮🇩 Petunjuk
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-300">
                      {instruction}
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#0A1520] to-[#0A131C] border border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.1)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      🇬🇧 Target English
                    </span>
                    <button
                      type="button"
                      onClick={handlePlayTargetOnly}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md border transition flex items-center gap-1.5 cursor-pointer ${
                        isPlayingTargetOnly
                          ? 'bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,210,255,0.5)]'
                          : 'bg-[#102231] hover:bg-[#162D42] text-cyan-300 border-cyan-500/30'
                      }`}
                      title="Dengarkan pengucapan kalimat bahasa Inggris murni"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{isPlayingTargetOnly ? 'Memutar English...' : 'Dengar English Saja'}</span>
                    </button>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-mono text-white tracking-wide">
                    {target}
                    {suffix && (
                      <span className="text-xs font-sans text-slate-400 ml-2">
                        {suffix}
                      </span>
                    )}
                  </h2>
                </div>
              </div>
            );
          })()}
        </div>

        {/* QUESTION INPUTS (MULTIPLE CHOICE, WORD ORDER, OR FILL BLANK) */}
        <div className="w-full">
          {/* TIPE 1: MULTIPLE CHOICE */}
          {currentQ.type === 'multiple_choice' && (
            <div className="grid grid-cols-1 gap-3">
              {options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!!feedback}
                    onClick={() => {
                      playBubblePop();
                      setSelectedOption(opt);
                      speakWord(opt, speechRate);
                    }}
                    className={`p-4 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/15 text-white shadow-[0_0_15px_rgba(0,229,117,0.25)] font-bold'
                        : 'border-[#1A2E40] bg-[#101C27] text-slate-300 hover:border-slate-500 hover:bg-[#142433]'
                    }`}
                  >
                    <span className="text-sm font-semibold">{opt}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        const letter = String.fromCharCode(65 + idx);
                        speakLetter(letter);
                        setSelectedOption(opt);
                      }}
                      title={`Dengarkan huruf ${String.fromCharCode(65 + idx)}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-mono font-black transition hover:scale-110 active:scale-95 ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(0,229,117,0.5)]'
                          : 'border-[#1E374D] bg-[#0A131C] text-slate-400 hover:border-cyan-400 hover:text-cyan-300'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TIPE 2: WORD ORDER (GRAMMAR SURGERY) */}
          {currentQ.type === 'word_order' && (
            <div className="card-cyber p-5 space-y-4">
              <div className="text-xs text-slate-400">
                Susun kata-kata di bawah ini menjadi kalimat yang tepat:
              </div>

              {/* Dropzone */}
              <div className="min-h-[56px] p-3 rounded-xl bg-[#0A131C] border border-dashed border-[#1E374D] flex flex-wrap gap-2 items-center">
                {wordOrderTokens.length === 0 ? (
                  <span className="text-xs text-slate-500 italic pl-1">
                    Ketuk kata di bawah untuk menyusun...
                  </span>
                ) : (
                  wordOrderTokens.map((word, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!!feedback}
                      onClick={() => {
                        speakWord(word, speechRate);
                        setWordOrderTokens((prev) => prev.filter((_, i) => i !== idx));
                        setAvailableTokens((prev) => [...prev, word]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold transition hover:bg-emerald-500/30 cursor-pointer active:scale-95"
                    >
                      {word}
                    </button>
                  ))
                )}
              </div>

              {/* Pool Tokens */}
              <div className="flex flex-wrap gap-2 pt-1">
                {availableTokens.map((word, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!!feedback}
                    onClick={() => {
                      speakWord(word, speechRate);
                      setWordOrderTokens((prev) => [...prev, word]);
                      setAvailableTokens((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#142433] hover:bg-[#1A2F42] border border-[#1E374D] text-xs font-bold text-white transition cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TIPE 3: FILL IN THE BLANK */}
          {currentQ.type === 'fill_blank' && (
            <div className="card-cyber p-5">
              <input
                type="text"
                disabled={!!feedback}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !feedback && textAnswer.trim()) {
                    handleSubmitAnswer();
                  }
                }}
                placeholder="Ketik jawabanmu di sini..."
                className="w-full rounded-xl border border-[#1A2E40] bg-[#0A131C] px-4 py-3.5 text-sm font-bold text-white focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                autoFocus
              />
            </div>
          )}
        </div>
      </main>

      {/* 3. BOTTOM MENTOR AVATAR & FEEDBACK ACTION BAR */}
      <footer
        className={`border-t border-[#1A2E40] p-4 sm:p-5 transition-all duration-300 backdrop-blur-md sticky bottom-0 z-30 ${
          feedback
            ? feedback.isCorrect
              ? 'bg-[#0B2017]/95 border-emerald-500/50 shadow-[0_-4px_25px_rgba(0,229,117,0.2)]'
              : 'bg-[#250E14]/95 border-rose-500/50 shadow-[0_-4px_25px_rgba(244,63,94,0.2)]'
            : 'bg-[#080E15]/95'
        }`}
      >
        <div className="mx-auto flex max-w-4xl flex-col sm:flex-row items-center justify-between gap-4">
          {/* MENTOR AVATAR & DIALOGUE (Lily or Arthur) */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative h-11 w-11 rounded-xl overflow-hidden shrink-0 border border-emerald-400/40 bg-[#080E15]">
              <Image
                src={companion.avatar}
                alt={companion.name}
                width={44}
                height={44}
                className="object-cover"
              />
            </div>

            <div className="flex-1 text-left">
              {feedback ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {feedback.isCorrect ? (
                      <>
                        <LottiePlayer
                          animationPath="/animations/success_check.json"
                          loop={false}
                          className="h-6 w-6 shrink-0 -my-1"
                        />
                        <span className="font-black text-sm text-emerald-300">
                          {celebrationTitle} (+{feedback.xpEarned} XP)
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        <span className="font-black text-sm text-rose-300">
                          {feedback.errorType
                            ? `Diagnosis: ${feedback.errorType.replace('_', ' ').toUpperCase()}`
                            : 'Belum Tepat'}
                        </span>
                      </>
                    )}
                  </div>
                  {!feedback.isCorrect && (
                    <div className="text-xs text-slate-300 leading-tight">
                      <span className="font-bold text-emerald-400">Jawaban benar: </span>
                      <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                        {feedback.correctAnswer}
                      </span>
                    </div>
                  )}

                  {/* Penjelasan Kaidah Cerdas Bilingual */}
                  {feedback.explanation && (
                    <div className="p-3 rounded-xl bg-[#091522] border border-cyan-500/30 text-slate-200 text-xs space-y-1.5 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-black text-cyan-400 text-[11px]">
                          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                          Penjelasan Kaidah:
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlayExplanation(feedback.explanation)}
                          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition cursor-pointer ${
                            isPlayingExplanation
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                          }`}
                          title="Dengarkan penjelasan suara bilingual"
                        >
                          {isPlayingExplanation ? (
                            <LottiePlayer
                              animationPath="/animations/audio_speaker_wave.json"
                              loop={true}
                              className="h-3.5 w-3.5 shrink-0"
                            />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                          <span>{isPlayingExplanation ? 'Hentikan Suara' : 'Dengar Penjelasan'}</span>
                        </button>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed font-sans">
                        {feedback.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-[11px] font-black text-emerald-400">{companion.name}</div>
                  <div className="text-[10px] text-slate-300 leading-tight">{companionMessage}</div>
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTON (PERIKSA / NEXT) */}
          <div className="w-full sm:w-auto flex justify-end">
            {!feedback ? (
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={
                  isEvaluating ||
                  (currentQ?.type === 'multiple_choice' && !selectedOption) ||
                  (currentQ?.type === 'fill_blank' && !textAnswer.trim()) ||
                  (currentQ?.type === 'word_order' && wordOrderTokens.length === 0)
                }
                className="btn-neon-pill px-8 py-3 text-xs w-full sm:w-auto disabled:opacity-40 cursor-pointer"
              >
                {isEvaluating ? 'Memeriksa...' : 'Periksa'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className={`px-8 py-3 rounded-full text-xs font-black w-full sm:w-auto transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  feedback.isCorrect
                    ? 'btn-neon-pill'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                }`}
              >
                <span>Lanjut</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* PERSONALISASI MODAL */}
      <PersonalizationModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        onPreferencesChanged={(p) => {
          setMascotChoice(p.mascot);
          setSpeechRate(p.audioSpeed);
        }}
      />
    </div>
  );
}
