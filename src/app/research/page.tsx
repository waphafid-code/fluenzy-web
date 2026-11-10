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
  Brain,
} from 'lucide-react';
import { SUS_QUESTIONS } from '@/lib/core/sus';
import { ThesisReportGenerator } from '@/components/ThesisReportGenerator';

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
        {/* LINK KE TES DIAGNOSTIK PRE/POST TEST */}
        <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
              Instrumen Pengujian Fonetik
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Brain className="h-4 w-4 text-emerald-600" />
              <span>Tes Diagnostik Fonetik (Pengukuran Pre-Test &amp; Post-Test Efektivitas)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Jalankan tes fonetik 3 butir untuk mengukur peningkatan kemampuan responden sebelum dan sesudah perlakuan modul latihan.
            </p>
          </div>
          <Link
            href="/practice/diagnostic"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-center"
          >
            <span>Buka Modul Tes Diagnostik</span>
          </Link>
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <a
              href="/api/research/export?type=answers&key=fluenzy-thesis-2026"
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
              href="/api/research/export?type=mastery&key=fluenzy-thesis-2026"
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
              href="/api/research/export?type=prepost&key=fluenzy-thesis-2026"
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

            <a
              href="/api/research/export?type=sus&key=fluenzy-thesis-2026"
              download
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40 hover:border-cyan-500 transition group"
            >
              <div>
                <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider block mb-1">
                  Usability Standar
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-600">
                  SUS Survey Dataset
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  10 Butir Likert, skor SUS murni, grade, dan feedback kualitatif.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-cyan-600">
                <Download className="h-4 w-4" /> Unduh CSV
              </div>
            </a>
          </div>
        </div>

        {/* BAGIAN 1.5: LANDASAN METODOLOGI & FORMULA STATISTIK SKRIPSI */}
        <div className="rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-emerald-500" />
              Landasan Metodologi &amp; Formula Analisis Skripsi (Bab 3 &amp; 4)
            </h2>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Statistical Standard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Hake Gain */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  1. Normalized Gain (Hake, 1998)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-mono">
                  Uji Efektivitas Belajar
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Mengukur efektivitas peningkatan kemampuan pelafalan antara nilai pre-test dan post-test responden:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                g = (PostTest - PreTest) / (1 - PreTest)
              </div>
              <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                <li><strong>Tinggi:</strong> g &ge; 0.70</li>
                <li><strong>Sedang:</strong> 0.30 &le; g &lt; 0.70</li>
                <li><strong>Rendah:</strong> g &lt; 0.30</li>
              </ul>
            </div>

            {/* SUS Scale */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-cyan-600 dark:text-cyan-400">
                  2. System Usability Scale (Brooke, 1996)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 font-mono">
                  Uji Usabilitas Sistem
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                10 butir pertanyaan terstandar dengan bobot butir ganjil (X-1) dan butir genap (5-X) dikali 2.5:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                Skor SUS = [&sum;(Ganjil - 1) + &sum;(5 - Genap)] &times; 2.5
              </div>
              <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                <li><strong>Ambang Industri:</strong> &ge; 68.0 (Good / Acceptable)</li>
                <li><strong>Grade A+ / A:</strong> &ge; 80.3 (Excellent / Best Imaginable)</li>
                <li><strong>Grade C / Marginal:</strong> 51.0 - 67.9</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BAGIAN 1.8: THESIS ASSISTANT & AUTO-GENERATOR TABEL BAB 4 */}
        <ThesisReportGenerator />

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
