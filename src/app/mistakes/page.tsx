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
} from 'lucide-react';
import { ERROR_TYPE_LABELS } from '@/lib/core/insights';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Header Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Review Kesalahan & Pembahasan
              </h1>
              <p className="text-xs text-slate-500">
                Total {data?.totalMistakes || 0} kekeliruan yang pernah tercatat
              </p>
            </div>
          </div>

          <Link
            href="/practice/weakness"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
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
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5" /> Filter Materi:
            </span>
            <button
              onClick={() => setSelectedSkillFilter('ALL')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                selectedSkillFilter === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Semua ({data?.totalMistakes})
            </button>
            {skills.map((s) => (
              <button
                key={s.skillId}
                onClick={() => setSelectedSkillFilter(s.skillId)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedSkillFilter === s.skillId
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {s.skillName} ({s.totalMistakes})
              </button>
            ))}
          </div>
        )}

        {/* Daftar Kesalahan */}
        {filteredSkills.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-12 text-center border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Tidak Ada Rekaman Kesalahan!
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Hebat! Kamu belum memiliki catatan jawaban salah pada kategori ini.
            </p>
          </div>
        ) : (
          filteredSkills.map((group) => (
            <div
              key={group.skillId}
              className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
            >
              {/* Header Skill Group */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      {group.skillName}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {group.totalMistakes} kali kesalahan tercatat
                    </span>
                  </div>
                </div>
              </div>

              {/* Kelompokkan per ErrorType */}
              <div className="space-y-4">
                {Object.values(group.byErrorType).map((errGroup) => {
                  const errorLabel = ERROR_TYPE_LABELS[errGroup.errorType] || errGroup.errorType;
                  return (
                    <div key={errGroup.errorType} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {errorLabel}
                        </span>
                        <span className="text-xs text-slate-400">({errGroup.items.length} butir)</span>
                      </div>

                      {/* Kartu Soal dan Pembahasan */}
                      <div className="space-y-3">
                        {errGroup.items.map((item) => (
                          <div
                            key={item.logId}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-sm"
                          >
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                              {item.prompt}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3">
                                <span className="font-bold text-rose-700 dark:text-rose-300 block mb-0.5">
                                  Jawabanmu yang salah:
                                </span>
                                <span className="text-rose-900 dark:text-rose-200 font-semibold line-through">
                                  {item.userAnswer || '(kosong)'}
                                </span>
                              </div>

                              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 p-3">
                                <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                                  Kunci Jawaban yang Benar:
                                </span>
                                <span className="text-emerald-900 dark:text-emerald-200 font-bold">
                                  {item.correctAnswer}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                                Penjelasan Kaidah:
                              </span>
                              {item.explanation}
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
