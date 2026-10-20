'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Filter,
  Volume2,
} from 'lucide-react';
import { ERROR_TYPE_LABELS } from '@/lib/core/insights';
import { speakBilingualText, stopSpeech, playBubblePop } from '@/lib/audio/speech';

interface MistakeItem {
  logId: string;
  questionId: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  createdAt: string;
}

interface SkillMistakesGroup {
  skillId: string;
  skillName: string;
  totalMistakes: number;
  byErrorType: Record<string, { errorType: string; items: MistakeItem[] }>;
}

export default function MistakesReviewPage() {
  const [data, setData] = useState<{ totalMistakes: number; skills: SkillMistakesGroup[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');
  const [playingLogId, setPlayingLogId] = useState<string | null>(null);

  function handlePlayExplanation(logId: string, explanation: string) {
    playBubblePop();
    if (playingLogId === logId) {
      stopSpeech();
      setPlayingLogId(null);
      return;
    }
    stopSpeech();
    setPlayingLogId(logId);
    speakBilingualText(explanation, {
      onEnd: () => setPlayingLogId(null),
    });
  }

  useEffect(() => {
    async function fetchMistakes() {
      try {
        setLoading(true);
        const res = await fetch('/api/mistakes');
        if (!res.ok) throw new Error('Gagal memuat rekapitulasi kesalahan');
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }
    fetchMistakes();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="text-center space-y-3">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Mengumpulkan catatan kesalahan dan pembahasannya...
          </p>
        </div>
      </div>
    );
  }

  const skills = data?.skills || [];
  const filteredSkills =
    selectedSkillFilter === 'ALL'
      ? skills
      : skills.filter((s) => s.skillId === selectedSkillFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-slate-50 to-rose-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 pb-16 relative overflow-hidden">
      {/* AMBIENT GLOW BLOBS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-400/15 dark:bg-rose-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-amber-400/15 dark:bg-amber-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="border-b-2 border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 transition shadow-xs"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Review Kesalahan & Pembahasan
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Total {data?.totalMistakes || 0} kekeliruan yang pernah tercatat
              </p>
            </div>
          </div>

          <Link
            href="/practice/weakness"
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 border-b-4 border-amber-700 active:translate-y-1 active:border-b-0 px-4 py-2 text-xs font-black text-white shadow-md transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Latihan Remedial
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Filter per Skill */}
        {skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5 text-indigo-500" /> Filter Materi:
            </span>
            <button
              onClick={() => setSelectedSkillFilter('ALL')}
              className={`rounded-2xl px-3.5 py-1.5 text-xs font-black transition-all ${
                selectedSkillFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md border-b-2 border-indigo-800'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              Semua ({data?.totalMistakes})
            </button>
            {skills.map((s) => (
              <button
                key={s.skillId}
                onClick={() => setSelectedSkillFilter(s.skillId)}
                className={`rounded-2xl px-3.5 py-1.5 text-xs font-black transition-all ${
                  selectedSkillFilter === s.skillId
                    ? 'bg-indigo-600 text-white shadow-md border-b-2 border-indigo-800'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                }`}
              >
                {s.skillName} ({s.totalMistakes})
              </button>
            ))}
          </div>
        )}

        {/* Daftar Kesalahan */}
        {filteredSkills.length === 0 ? (
          <div className="rounded-3xl bg-white/95 dark:bg-slate-900/90 p-12 text-center border-2 border-slate-200/90 dark:border-slate-800 shadow-xl backdrop-blur-md">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Tidak Ada Rekaman Kesalahan!
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Hebat! Kamu belum memiliki catatan jawaban salah pada kategori ini.
            </p>
          </div>
        ) : (
          filteredSkills.map((group) => (
            <div
              key={group.skillId}
              className="rounded-3xl bg-white/95 dark:bg-slate-900/90 p-6 sm:p-7 border-2 border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6 backdrop-blur-md"
            >
              {/* Header Skill Group */}
              <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                      {group.skillName}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      {group.totalMistakes} kali kesalahan tercatat
                    </span>
                  </div>
                </div>
              </div>

              {/* Kelompokkan per ErrorType */}
              <div className="space-y-5">
                {Object.values(group.byErrorType).map((errGroup) => {
                  const errorLabel = ERROR_TYPE_LABELS[errGroup.errorType] || errGroup.errorType;
                  return (
                    <div key={errGroup.errorType} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-xs">
                          {errorLabel}
                        </span>
                        <span className="text-xs font-bold text-slate-400">({errGroup.items.length} butir)</span>
                      </div>

                      {/* Kartu Soal dan Pembahasan */}
                      <div className="space-y-3">
                        {errGroup.items.map((item) => (
                          <div
                            key={item.logId}
                            className="rounded-2xl border-2 border-slate-200/90 dark:border-slate-800 p-5 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 text-sm shadow-xs"
                          >
                            <h4 className="font-black text-slate-900 dark:text-slate-100 text-base leading-snug">
                              {item.prompt}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                              <div className="rounded-2xl bg-rose-50/80 dark:bg-rose-950/50 border-2 border-rose-200 dark:border-rose-900 p-3.5">
                                <span className="font-black text-rose-700 dark:text-rose-300 block mb-1">
                                  Jawabanmu yang keliru:
                                </span>
                                <span className="text-rose-900 dark:text-rose-200 font-bold line-through">
                                  {item.userAnswer || '(kosong)'}
                                </span>
                              </div>

                              <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border-2 border-emerald-200 dark:border-emerald-900 p-3.5">
                                <span className="font-black text-emerald-700 dark:text-emerald-300 block mb-1">
                                  Kunci Jawaban yang Benar:
                                </span>
                                <span className="text-emerald-900 dark:text-emerald-200 font-black">
                                  {item.correctAnswer}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 mt-2 leading-relaxed">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                                  Penjelasan Kaidah:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handlePlayExplanation(item.logId, item.explanation)}
                                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition cursor-pointer ${
                                    playingLogId === item.logId
                                      ? 'bg-rose-500/20 text-rose-500 dark:text-rose-300 border-rose-500/40'
                                      : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                                  }`}
                                  title="Dengarkan penjelasan suara bilingual"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                  <span>{playingLogId === item.logId ? 'Berhenti' : 'Dengar Penjelasan'}</span>
                                </button>
                              </div>
                              <p className="leading-relaxed">{item.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
