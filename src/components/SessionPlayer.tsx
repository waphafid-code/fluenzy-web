'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { StandingMascot, MascotMood } from '@/components/StandingMascot';
import {
  speakText,
  speakWord,
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
  'Luar Biasa! 🔥',
  'Kerja Bagus! 🌟',
  'Tepat Sekali! 🎯',
  'Sempurna! ✨',
  'Mantap Jiwa! 🚀',
  'Luar Biasa Cepat! ⚡',
];

export function SessionPlayer({ mode, lessonId, title }: SessionPlayerProps) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio & Kecepatan Suara
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isTalking, setIsTalking] = useState<boolean>(false);

  // Status Maskot
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState<string | null>(
    'Semangat! Aku siap menemanimu belajar!'
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

  const startTimeRef = useRef<number>(0);

  // Ambil butir soal sesi
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const url = `/api/session/questions?mode=${mode}${lessonId ? `&lessonId=${lessonId}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Gagal mengambil soal');
        const json = await res.json();
        setQuestions(json.questions || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [mode, lessonId]);

  // Siapkan soal saat indeks berubah
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const q = questions[currentIndex];
      setSelectedOption('');
      setTextAnswer('');
      setFeedback(null);
      setMascotMood('idle');
      setMascotMessage('Pilih atau susun jawaban yang paling tepat ya!');
      startTimeRef.current = Date.now();

      try {
        const payload = JSON.parse(q.payload);
        if (q.type === 'word_order' && payload.tokens) {
          // Acak token kata untuk disortir
          const shuffled = [...payload.tokens].sort(() => Math.random() - 0.5);
          setAvailableTokens(shuffled);
          setWordOrderTokens([]);
        }
      } catch {
        setAvailableTokens([]);
      }
    }
  }, [currentIndex, questions]);

  const currentQ = questions[currentIndex];

  // Putar Pengucapan Soal / Prompt
  function handleSpeakPrompt(rate: number = 1.0) {
    if (!currentQ) return;
    playBubblePop();
    setIsTalking(true);
    setMascotMood('talking');
    setMascotMessage('Dengarkan pelafalan kalimat ini baik-baik...');

    speakText(currentQ.prompt, {
      rate,
      onStart: () => setIsTalking(true),
      onEnd: () => {
        setIsTalking(false);
        setMascotMood('idle');
      },
    });
  }

  // Kirim Jawaban
  async function handleSubmitAnswer() {
    if (!currentQ || isEvaluating) return;

    let finalUserAnswer = '';
    if (currentQ.type === 'multiple_choice') {
      finalUserAnswer = selectedOption;
    } else if (currentQ.type === 'word_order') {
      finalUserAnswer = wordOrderTokens.join(' ');
    } else {
      finalUserAnswer = textAnswer.trim();
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
        setMascotMood('celebrate');
        setMascotMessage(randomTitle);
      } else {
        setMascotMood('encouraging');
        setMascotMessage('Jangan khawatir! Cermati pembahasannya ya.');
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
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      playCelebrationSound();
      setSessionCompleted(true);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 p-8 shadow-xl border-2 border-emerald-200 dark:border-emerald-800 text-center space-y-4 max-w-sm">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100">Memuat Sesi Adaptif</h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Menyiapkan materi personalisasi berdasarkan tingkat penguasaanmu...
          </p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-md rounded-3xl bg-white dark:bg-slate-900 p-8 text-center shadow-xl border-2 border-slate-200 dark:border-slate-800">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Belum Ada Soal Tersedia
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {error || 'Bank soal untuk kategori ini sedang kosong.'}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 px-6 py-3 text-sm font-black text-white shadow-md transition"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODAL HATI HABIS
  // =========================================================================
  if (heartsOut) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-8 text-center shadow-2xl border-2 border-rose-300 dark:border-rose-900 space-y-5 animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-500 shadow-inner">
            <Heart className="h-10 w-10 fill-rose-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Hatimu Telah Habis!
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Jangan khawatir. Kamu dapat beristirahat (1 hati teregenerasi per 30 menit) atau lanjut berlatih tanpa risiko kehilangan hati.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/practice/weakness"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 border-b-4 border-amber-700 active:translate-y-1 active:border-b-0 py-3.5 text-sm font-black text-white shadow-md transition"
            >
              <Sparkles className="h-4 w-4" />
              Latihan Titik Lemah (Bebas Risiko)
            </Link>
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LAYAR SESI SELESAI
  // =========================================================================
  if (sessionCompleted) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-8 text-center shadow-2xl border-2 border-emerald-300 dark:border-emerald-800 space-y-6">
          {/* Standing Character Merayakan */}
          <div className="flex justify-center -mb-2">
            <StandingMascot
              size="md"
              mood="celebrate"
              message="Yayy! Kamu hebat sekali telah menyelesaikan sesi ini!"
              showSpeechBubble={true}
            />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
              Selesai!
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
              Latihan Selesai
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{title}</p>
          </div>

          {/* Kartu Metrik Hasil */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border-2 border-indigo-200 dark:border-indigo-900 p-4 shadow-sm">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Total XP Didapat
              </span>
              <div className="text-3xl font-black text-indigo-700 dark:text-indigo-300 mt-1 flex items-center justify-center gap-1">
                <Zap className="h-6 w-6 fill-indigo-500" />
                +{totalXpEarned}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-200 dark:border-emerald-900 p-4 shadow-sm">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Akurasi Jawaban
              </span>
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {accuracy}%
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 py-3.5 text-sm font-black text-white shadow-md transition"
            >
              Lihat Pembaruan di Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/roadmap"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 active:translate-y-1 active:border-b-0 py-3.5 text-sm font-black text-white shadow-md transition"
            >
              Buka Roadmap 50 Stage
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/mistakes"
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Review Kesalahan Sesi Ini
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PARSING DATA SOAL AKTIF
  // =========================================================================
  let options: string[] = [];
  try {
    const payload = JSON.parse(currentQ.payload);
    options = payload.options || [];
  } catch {
    options = [];
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-sky-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* DEKORASI LATAR BELAKANG TIDAK MONOTON (AMBIENT GLOW BLOBS) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none -z-10" />

      {/* 1. TOP PROGRESS BAR & CONTROLS */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 sm:px-8 shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 transition shadow-xs"
            title="Keluar dari sesi"
          >
            <X className="h-5 w-5" />
          </Link>

          {/* Progress Bar 3D */}
          <div className="flex-1 h-3.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Kontrol Kecepatan Suara & Hati */}
          <div className="flex items-center gap-3">
            {/* Speed Pill 3D */}
            <div className="hidden sm:flex items-center gap-1 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-black text-slate-600 dark:text-slate-300 shadow-xs">
              <Gauge className="h-3.5 w-3.5 text-emerald-500" />
              <button
                type="button"
                onClick={() => setSpeechRate(0.7)}
                className={`px-2 py-0.5 rounded-xl transition ${
                  speechRate === 0.7
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                0.7x 🐢
              </button>
              <button
                type="button"
                onClick={() => setSpeechRate(1.0)}
                className={`px-2 py-0.5 rounded-xl transition ${
                  speechRate === 1.0
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                1.0x
              </button>
            </div>

            {/* Mode & Heart Indicator */}
            {mode === 'weakness' ? (
              <span className="text-xs font-black px-3 py-1.5 rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Bebas Risiko
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-sm font-black text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-200 dark:border-rose-900 px-3 py-1 rounded-2xl shadow-xs">
                <Heart className="h-5 w-5 fill-rose-500 animate-pulse" />
                <span>{feedback?.heartsRemaining ?? 5}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. AREA SOAL + STANDING CHARACTER (2-COLUMN CLAYMORPHISM STAGE) */}
      <main className="mx-auto flex flex-1 w-full max-w-5xl flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 px-4 py-8">
        {/* KOLOM KIRI: STANDING MASCOT PADA STAGE POD */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative rounded-3xl bg-gradient-to-b from-emerald-100/70 via-teal-50/50 to-white/90 dark:from-emerald-950/40 dark:via-slate-900/40 dark:to-slate-900/80 p-5 sm:p-6 border-2 border-emerald-300/80 dark:border-emerald-800/80 shadow-xl backdrop-blur-md">
            <StandingMascot
              size="md"
              mood={mascotMood}
              isTalking={isTalking}
              message={mascotMessage}
              showSpeechBubble={true}
              canSwitchCharacter={true}
            />
          </div>
        </div>

        {/* KOLOM KANAN: KARTU SOAL AKTIF DENGAN TACTILE DEPTH */}
        <div className="w-full max-w-xl rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-2 border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          {/* Metadata Skill & Tingkat Kesulitan */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-xl">
              <Brain className="h-3.5 w-3.5 text-emerald-600" />
              {currentQ.skill?.name || 'Materi Bahasa Inggris'}
            </span>
            <span className="font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
              Tingkat Kesulitan: {currentQ.difficulty}/5
            </span>
          </div>

          {/* PERTANYAAN / PROMPT DENGAN TOMBOL AUDIO SPEAKER & TURTLE */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              {/* Tombol Speaker Normal 1.0x 3D */}
              <button
                type="button"
                onClick={() => handleSpeakPrompt(speechRate)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 text-white shadow-md transition group"
                title="Dengarkan pengucapan normal"
              >
                <Volume2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>

              {/* Tombol Speaker Lambat 0.65x (Turtle Mode) 3D */}
              <button
                type="button"
                onClick={() => handleSpeakPrompt(0.65)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 hover:bg-amber-600 border-b-4 border-amber-700 active:translate-y-1 active:border-b-0 text-white shadow-md transition text-lg"
                title="Dengarkan pengucapan lambat (Turtle mode)"
              >
                🐢
              </button>

              {/* Teks Prompt */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug pt-1">
                {currentQ.prompt}
              </h2>
            </div>
          </div>

          {/* TIPE 1: PILIHAN GANDA (MULTIPLE CHOICE) DENGAN TACTILE 3D BUTTONS */}
          {currentQ.type === 'multiple_choice' && (
            <div className="grid grid-cols-1 gap-3.5 pt-2">
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
                    className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left font-black transition-all ${
                      isSelected
                        ? 'border-2 border-emerald-500 border-b-4 border-b-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 shadow-md scale-[1.01]'
                        : 'border-2 border-slate-200 dark:border-slate-700 border-b-4 border-b-slate-300 dark:border-b-slate-800 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:border-emerald-400 hover:bg-emerald-50/20 active:translate-y-1 active:border-b-2 shadow-xs'
                    }`}
                  >
                    <span className="text-base">{opt}</span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-xl border-2 text-xs font-black ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                          : 'border-slate-300 dark:border-slate-600 text-slate-400 bg-slate-50 dark:bg-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TIPE 2: SUSUN KATA (WORD ORDER) CLAYMOPHISM TOKENS */}
          {currentQ.type === 'word_order' && (
            <div className="space-y-4 pt-2">
              {/* Slot Jawaban Terpilih */}
              <div className="min-h-[75px] w-full rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 p-3.5 flex flex-wrap gap-2.5 items-center bg-emerald-50/30 dark:bg-emerald-950/20 shadow-inner">
                {wordOrderTokens.length === 0 ? (
                  <span className="text-xs font-bold text-slate-400 pl-2">
                    Ketuk kata-kata di bawah untuk menyusun kalimat...
                  </span>
                ) : (
                  wordOrderTokens.map((word, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!!feedback}
                      onClick={() => {
                        playBubblePop();
                        // Kembalikan ke pool
                        setWordOrderTokens((prev) => prev.filter((_, i) => i !== idx));
                        setAvailableTokens((prev) => [...prev, word]);
                      }}
                      className="rounded-2xl border-2 border-emerald-500 border-b-4 border-b-emerald-700 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow-md active:scale-95 transition"
                    >
                      {word}
                    </button>
                  ))
                )}
              </div>

              {/* Pool Token Tersedia */}
              <div className="flex flex-wrap gap-2.5 pt-2">
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
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 border-b-4 border-b-slate-300 dark:border-b-slate-800 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-black text-slate-800 dark:text-slate-100 shadow-sm hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-slate-700 active:translate-y-1 active:border-b-2 transition"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TIPE 3: KETIK JAWABAN / ISIAN SINGKAT (FILL BLANK) */}
          {currentQ.type === 'fill_blank' && (
            <div className="pt-2">
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
                className="w-full rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-5 py-4 text-base font-black text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition shadow-inner"
                autoFocus
              />
            </div>
          )}
        </div>
      </main>

      {/* 3. BOTTOM FEEDBACK SHEET & ACTION BAR */}
      <footer
        className={`border-t-2 p-4 sm:p-6 transition-all duration-300 backdrop-blur-md ${
          feedback
            ? feedback.isCorrect
              ? 'bg-emerald-100/90 dark:bg-emerald-950/90 border-emerald-400 dark:border-emerald-800 shadow-xl'
              : 'bg-rose-100/90 dark:bg-rose-950/90 border-rose-400 dark:border-rose-800 shadow-xl'
            : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="mx-auto flex max-w-4xl flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tampilan Feedback Jawaban */}
          {feedback ? (
            <div className="flex-1 space-y-1.5 text-left w-full">
              <div className="flex items-center gap-2">
                {feedback.isCorrect ? (
                  <>
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <span className="font-black text-xl text-emerald-900 dark:text-emerald-100">
                      {celebrationTitle} (+{feedback.xpEarned} XP)
                    </span>
                    {feedback.weakSkillBonusEarned > 0 && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-300 text-emerald-950 shadow-xs">
                        +3 Bonus Materi Lemah
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <span className="font-black text-xl text-rose-900 dark:text-rose-100">
                      {feedback.errorType
                        ? `Diagnosis: ${feedback.errorType.replace('_', ' ').toUpperCase()}`
                        : 'Belum Tepat'}
                    </span>
                  </>
                )}
              </div>

              {/* Rincian Kunci Jawaban & Penjelasan */}
              {!feedback.isCorrect && (
                <div className="text-xs space-y-1.5 text-slate-800 dark:text-slate-200 pt-1 bg-white/70 dark:bg-slate-900/70 p-3 rounded-2xl border border-rose-200 dark:border-rose-900">
                  <p>
                    <span className="font-black">Kunci Jawaban: </span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                      {feedback.correctAnswer}
                    </span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-black">Penjelasan: </span>
                    {feedback.explanation}
                  </p>
                  {feedback.explanationSource === 'ai_live' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                      <Sparkles className="h-3 w-3" /> Penjelasan AI Gemini
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-400 hidden sm:block">
              Pilih atau ketik jawabanmu, lalu tekan Periksa.
            </div>
          )}

          {/* Tombol Periksa / Lanjut Tactile 3D */}
          <div className="w-full sm:w-auto">
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
                className="w-full sm:w-auto rounded-2xl bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:border-b-0 disabled:translate-y-0 px-9 py-4 text-sm font-black tracking-wide text-white shadow-lg transition"
              >
                {isEvaluating ? 'Memeriksa...' : 'Periksa'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className={`w-full sm:w-auto rounded-2xl px-9 py-4 text-sm font-black tracking-wide text-white shadow-lg transition active:translate-y-1 active:border-b-0 ${
                  feedback.isCorrect
                    ? 'bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700'
                    : 'bg-rose-500 hover:bg-rose-600 border-b-4 border-rose-700'
                }`}
              >
                Lanjut
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
