'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Download,
  ArrowLeft,
  CheckCircle2,
  Award,
  Sparkles,
  ClipboardList,
  BarChart2,
} from 'lucide-react';
import { SUS_QUESTIONS } from '@/lib/core/sus';

export default function ResearchEvaluationPage() {
  const [susAnswers, setSusAnswers] = useState<number[]>([4, 2, 4, 2, 4, 2, 4, 2, 4, 2]);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    grade: string;
    adjectiveRating: string;
    isAboveAverage: boolean;
  } | null>(null);

  function handleOptionChange(index: number, val: number) {
    setSusAnswers((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  }

  async function handleSubmitSus(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/research/sus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: susAnswers,
          feedbackText,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
    } catch {
      alert('Gagal mengirim evaluasi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Instrumen Evaluasi & Data Penelitian
              </h1>
              <p className="text-xs text-slate-500">Bahan Uji Empiris & Sidang Tugas Akhir</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
        {/* BAGIAN 1: EKSPOR DATASET CSV */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-500" />
              Ekspor Dataset Penelitian (Format CSV)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Data telah dianonimkan (User Hash) dan siap diolah ke SPSS, R, Python (Pandas), atau Excel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href="/api/research/export?type=answers"
              download
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 transition group"
            >
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                  Telemetri Jawaban
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600">
                  AnswerLog Dataset
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  errorType, durasi respon ms, isCorrect, timestamp per butir.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <Download className="h-4 w-4" /> Unduh CSV
              </div>
            </a>

            <a
              href="/api/research/export?type=mastery"
              download
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-500 transition group"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Penguasaan Kompetensi
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
                  Skill Mastery Dataset
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Skor EMA (0-1), akurasi %, attempts kumulatif per skill.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                <Download className="h-4 w-4" /> Unduh CSV
              </div>
            </a>

            <a
              href="/api/research/export?type=prepost"
              download
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40 hover:border-amber-500 transition group"
            >
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                  Uji Efektivitas (Hake)
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600">
                  Normalized Gain Dataset
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pre-test vs Post-test gain score g = (post-pre)/(1-pre).
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <Download className="h-4 w-4" /> Unduh CSV
              </div>
            </a>
          </div>
        </div>

        {/* BAGIAN 2: KUESIONER SYSTEM USABILITY SCALE (SUS) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-emerald-600" />
                Kuesioner Baku System Usability Scale (SUS)
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Brooke (1996)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Instrumen pengujian usability standar industri untuk mengukur kepuasan dan kemudahan pengguna.
            </p>
          </div>

          {result ? (
            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Hasil Evaluasi Usability
                </span>
                <div className="text-4xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
                  Skor SUS: {result.score} / 100
                </div>
                <div className="mt-2 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  Grade {result.grade} — {result.adjectiveRating}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {result.isAboveAverage
                    ? 'Aplikasi berada di atas rata-rata benchmark industri (skor > 68).'
                    : 'Aplikasi perlu pembenahan lebih lanjut pada kemudahan antarmuka.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white transition"
              >
                Isi Kuesioner Baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitSus} className="space-y-5 text-sm">
              <div className="space-y-4">
                {SUS_QUESTIONS.map((question, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                      {idx + 1}. {question}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] font-semibold text-rose-500">Sangat Tidak Setuju (1)</span>
                      <div className="flex items-center gap-3 sm:gap-6">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <label
                            key={val}
                            className="flex flex-col items-center gap-1 cursor-pointer font-bold text-slate-600 dark:text-slate-400"
                          >
                            <input
                              type="radio"
                              name={`sus_${idx}`}
                              value={val}
                              checked={susAnswers[idx] === val}
                              onChange={() => handleOptionChange(idx, val)}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{val}</span>
                          </label>
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600">Sangat Setuju (5)</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-xs block mb-1">
                  Komentar & Masukan Kualitatif (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Ceritakan pengalamanmu saat menggunakan Fluenzy..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-3 text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-sm font-extrabold text-white shadow-md transition"
              >
                {isSubmitting ? 'Menghitung Skor SUS...' : 'Kirim Evaluasi & Hitung Skor SUS'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
