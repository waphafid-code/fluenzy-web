"use client";

import { useState } from "react";
import Link from "next/link";

const SUS_QUESTIONS = [
  "Saya rasa saya akan sering menggunakan sistem pembelajaran Fluenzy ini.",
  "Saya merasa sistem ini terlalu rumit padahal bisa dibuat lebih sederhana.",
  "Saya rasa sistem ini mudah digunakan.",
  "Saya rasa saya membutuhkan bantuan teknis dari orang lain untuk dapat menggunakan sistem ini.",
  "Saya menemukan berbagai fitur dalam sistem ini terintegrasi dengan baik.",
  "Saya rasa terlalu banyak ketidakkonsistenan dalam sistem ini.",
  "Saya bayangkan kebanyakan orang akan belajar menggunakan sistem ini dengan sangat cepat.",
  "Saya merasa sistem ini sangat kaku dan merepotkan untuk digunakan.",
  "Saya merasa sangat percaya diri saat menggunakan sistem ini.",
  "Saya perlu mempelajari banyak hal terlebih dahulu sebelum dapat mulai menggunakan sistem ini.",
];

export default function ResearchSusPage() {
  const [participantName, setParticipantName] = useState("");
  const [scores, setScores] = useState<number[]>(Array(10).fill(3));
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSelectScore(questionIndex: number, value: number) {
    setScores((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  }

  function calculateSusScore(currentScores: number[]): number {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        sum += currentScores[i] - 1;
      } else {
        sum += 5 - currentScores[i];
      }
    }
    return sum * 2.5;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const calculated = calculateSusScore(scores);

    try {
      await fetch("/api/research/sus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: participantName || "Anonim",
          scores,
          totalScore: calculated,
        }),
      });
    } catch {
      // Tetap tampilkan skor meskipun offline
    } finally {
      setSubmittedScore(calculated);
      setSubmitting(false);
    }
  }

  const liveScore = calculateSusScore(scores);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-sm text-slate-900">
              Evaluasi System Usability Scale (SUS)
            </span>
          </div>

          <a
            href="/api/research/export"
            className="btn-tactile-secondary px-3.5 py-1.5 text-xs"
          >
            Unduh Dataset Riset
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
              Human-Computer Interaction Evaluation
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Kuesioner Pengujian Ketergunaan (SUS)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Berikan penilaian objektif dari skala 1 (Sangat Tidak Setuju) hingga 5 (Sangat Setuju).
            </p>
          </div>

          <div className="surface-card px-4 py-2.5 text-right shrink-0">
            <div className="text-[11px] font-mono uppercase text-slate-400">
              Estimasi Skor SUS
            </div>
            <div className="text-xl font-bold text-blue-600 metric-value">
              {liveScore.toFixed(1)} / 100
            </div>
          </div>
        </div>

        {submittedScore !== null ? (
          <div className="surface-card p-8 text-center space-y-4">
            <div className="text-xs font-mono uppercase text-emerald-700 font-semibold">
              Data Evaluasi Tersimpan
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Skor Akhir SUS: {submittedScore.toFixed(1)}
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Terima kasih atas partisipasi Anda dalam pengujian perangkat lunak pendidikan ini. Respons Anda telah tercatat ke dalam basis data penelitian.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setSubmittedScore(null)}
                className="btn-tactile-secondary px-4 py-2 text-xs"
              >
                Isi Ulang Kuesioner
              </button>
              <Link
                href="/dashboard"
                className="btn-tactile-primary px-4 py-2 text-xs"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="surface-card p-5">
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Nama / Kode Responden (Opsional)
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Contoh: Responden-01"
                className="input-clean max-w-sm"
              />
            </div>

            <div className="space-y-4">
              {SUS_QUESTIONS.map((question, idx) => (
                <div
                  key={idx}
                  className="surface-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      ITEM {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm font-medium text-slate-900">
                      {question}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const active = scores[idx] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectScore(idx, val)}
                          className={`w-10 h-10 rounded-lg font-mono text-xs font-semibold border transition-all cursor-pointer ${
                            active
                              ? "bg-blue-600 text-white border-blue-700 border-b-[3px]"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-tactile-primary px-6 py-3 text-sm"
              >
                {submitting ? "Menyimpan..." : "Kirim Evaluasi SUS"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}