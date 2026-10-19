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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="text-center space-y-3">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Menyiapkan materi adaptif untukmu...
          </p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 text-center shadow-lg border border-slate-200 dark:border-slate-800">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Belum Ada Soal Tersedia
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {error || 'Bank soal untuk kategori ini sedang kosong.'}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
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
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-500">
            <Heart className="h-8 w-8 fill-rose-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Hatimu Telah Habis!
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Jangan khawatir. Kamu dapat beristirahat (1 hati teregenerasi per 30 menit) atau lanjut berlatih tanpa risiko kehilangan hati.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/practice/weakness"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 py-3.5 text-sm font-extrabold text-white shadow-md transition"
            >
              <Sparkles className="h-4 w-4" />
              Latihan Titik Lemah (Bebas Risiko)
            </Link>
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition"
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-8 text-center shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
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
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Selesai!
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Latihan Selesai
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{title}</p>
          </div>

          {/* Kartu Metrik Hasil */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 p-4">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Total XP Didapat
              </span>
              <div className="text-3xl font-black text-indigo-700 dark:text-indigo-300 mt-1 flex items-center justify-center gap-1">
                <Zap className="h-6 w-6 fill-indigo-500" />
                +{totalXpEarned}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
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
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-sm font-extrabold text-white shadow-md transition"
            >
              Lihat Pembaruan di Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/roadmap"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 py-3.5 text-sm font-extrabold text-white shadow-md transition"
            >
              Buka Roadmap 50 Stage
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/mistakes"
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 transition"
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* 1. TOP PROGRESS BAR & CONTROLS */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Keluar dari sesi"
          >
            <X className="h-5 w-5" />
          </Link>

          {/* Progress Bar */}
          <div className="flex-1 h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Kontrol Kecepatan Suara & Hati */}
          <div className="flex items-center gap-3">
            {/* Speed Pill */}
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <Gauge className="h-3.5 w-3.5" />
              <button
                type="button"
                onClick={() => setSpeechRate(0.7)}
                className={`px-1.5 py-0.5 rounded ${
                  speechRate === 0.7 ? 'bg-emerald-500 text-white' : 'hover:text-slate-900'
                }`}
              >
                0.7x 🐢
              </button>
              <button
                type="button"
                onClick={() => setSpeechRate(1.0)}
                className={`px-1.5 py-0.5 rounded ${
                  speechRate === 1.0 ? 'bg-emerald-500 text-white' : 'hover:text-slate-900'
                }`}
              >
                1.0x
              </button>
            </div>

            {/* Mode & Heart Indicator */}
            {mode === 'weakness' ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Bebas Risiko
              </span>
            ) : (
              <div className="flex items-center gap-1 text-sm font-extrabold text-rose-500">
                <Heart className="h-5 w-5 fill-rose-500" />
                <span>{feedback?.heartsRemaining ?? 5}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. AREA SOAL + STANDING CHARACTER (2-COLUMN DUOLINGO LAYOUT) */}
      <main className="mx-auto flex flex-1 w-full max-w-4xl flex-col md:flex-row items-center justify-center gap-8 px-4 py-6">
        {/* KOLOM KIRI: STANDING ANIMATED MASCOT */}
        <div className="shrink-0 flex flex-col items-center">
          <StandingMascot
            size="md"
            mood={mascotMood}
            isTalking={isTalking}
            message={mascotMessage}
            showSpeechBubble={true}
            canSwitchCharacter={true}
          />
        </div>

        {/* KOLOM KANAN: KARTU SOAL AKTIF */}
        <div className="w-full max-w-xl space-y-6">
          {/* Metadata Skill & Tingkat Kesulitan */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Brain className="h-3.5 w-3.5" />
              {currentQ.skill?.name || 'Materi Bahasa Inggris'}
            </span>
            <span className="font-medium bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              Tingkat Kesulitan: {currentQ.difficulty}/5
            </span>
          </div>

          {/* PERTANYAAN / PROMPT DENGAN TOMBOL AUDIO SPEAKER & TURTLE */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {/* Tombol Speaker Normal 1.0x */}
              <button
                type="button"
                onClick={() => handleSpeakPrompt(speechRate)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition active:scale-95 group"
                title="Dengarkan pengucapan normal"
              >
                <Volume2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>

              {/* Tombol Speaker Lambat 0.65x (Turtle Mode) */}
              <button
                type="button"
                onClick={() => handleSpeakPrompt(0.65)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-md transition active:scale-95 text-lg"
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

          {/* TIPE 1: PILIHAN GANDA (MULTIPLE CHOICE) */}
          {currentQ.type === 'multiple_choice' && (
            <div className="grid grid-cols-1 gap-3 pt-2">
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
                    className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left font-bold transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-sm scale-[1.01]'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TIPE 2: SUSUN KATA (WORD ORDER) DENGAN PENGUCAPAN TIAP KATA */}
          {currentQ.type === 'word_order' && (
            <div className="space-y-4 pt-2">
              {/* Slot Jawaban Terpilih */}
              <div className="min-h-[70px] w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-3 flex flex-wrap gap-2 items-center bg-white/50 dark:bg-slate-900/50">
                {wordOrderTokens.length === 0 ? (
                  <span className="text-xs text-slate-400 pl-2">
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
                      className="rounded-xl border border-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3.5 py-2 text-sm font-bold text-emerald-800 dark:text-emerald-200 shadow-sm active:scale-95"
                    >
                      {word}
                    </button>
                  ))
                )}
              </div>

              {/* Pool Token Tersedia */}
              <div className="flex flex-wrap gap-2 pt-2">
                {availableTokens.map((word, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!!feedback}
                    onClick={() => {
                      // Bunyikan dan lafalkan kata
                      speakWord(word, speechRate);
                      // Pindahkan ke slot jawaban
                      setWordOrderTokens((prev) => [...prev, word]);
                      setAvailableTokens((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 transition active:scale-95"
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
                className="w-full rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 text-base font-bold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none transition shadow-sm"
                autoFocus
              />
            </div>
          )}
        </div>
      </main>

      {/* 3. BOTTOM FEEDBACK SHEET & ACTION BAR */}
      <footer
        className={`border-t p-4 sm:p-6 transition-all duration-300 ${
          feedback
            ? feedback.isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-900'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-900'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="mx-auto flex max-w-4xl flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tampilan Feedback Jawaban */}
          {feedback ? (
            <div className="flex-1 space-y-1 text-left w-full">
              <div className="flex items-center gap-2">
                {feedback.isCorrect ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    <span className="font-black text-lg text-emerald-800 dark:text-emerald-200">
                      {celebrationTitle} (+{feedback.xpEarned} XP)
                    </span>
                    {feedback.weakSkillBonusEarned > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                        +3 Bonus Materi Lemah
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-rose-600" />
                    <span className="font-black text-lg text-rose-800 dark:text-rose-200">
                      {feedback.errorType
                        ? `Diagnosis: ${feedback.errorType.replace('_', ' ').toUpperCase()}`
                        : 'Belum Tepat'}
                    </span>
                  </>
                )}
              </div>

              {/* Rincian Kunci Jawaban & Penjelasan */}
              {!feedback.isCorrect && (
                <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300 pt-1">
                  <p>
                    <span className="font-bold">Kunci Jawaban: </span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {feedback.correctAnswer}
                    </span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Penjelasan: </span>
                    {feedback.explanation}
                  </p>
                  {feedback.explanationSource === 'ai_live' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                      <Sparkles className="h-3 w-3" /> Penjelasan AI Gemini
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 hidden sm:block">
              Pilih atau ketik jawabanmu, lalu tekan Periksa.
            </div>
          )}

          {/* Tombol Periksa / Lanjut */}
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
                className="w-full sm:w-auto rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-8 py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-95"
              >
                {isEvaluating ? 'Memeriksa...' : 'Periksa'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className={`w-full sm:w-auto rounded-2xl px-8 py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-95 ${
                  feedback.isCorrect
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
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
