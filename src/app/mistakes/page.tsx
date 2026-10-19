"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MistakeRecord {
  id: string;
  prompt?: string;
  questionPrompt?: string;
  userAnswer: string;
  correctAnswer?: string;
  errorType?: string;
  skillName?: string;
  explanation?: string;
  createdAt?: string;
}

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mistakes")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.mistakes || [];
        setMistakes(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const errorTypes = Array.from(
    new Set(mistakes.map((m) => m.errorType || "Grammar").filter(Boolean))
  );

  const filteredMistakes =
    selectedFilter === "ALL"
      ? mistakes
      : mistakes.filter((m) => (m.errorType || "Grammar") === selectedFilter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
              Log & Diagnostik Kesalahan
            </span>
          </div>

          <Link
            href="/practice/weakness"
            className="btn-tactile-primary px-4 py-2 text-xs"
          >
            Latih Topik Lemah
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-red-600 font-semibold">
              Diagnostic Error Log
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Analisis Riwayat Kesalahan
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Daftar komprehensif kesalahan jawaban beserta klasifikasi tipe error dan penjelasan kaidah tata bahasanya.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter("ALL")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-colors ${
                selectedFilter === "ALL"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Semua ({mistakes.length})
            </button>
            {errorTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-colors ${
                  selectedFilter === type
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl" />
            ))}
          </div>
        ) : filteredMistakes.length === 0 ? (
          <div className="surface-card p-10 text-center space-y-2">
            <div className="text-sm font-semibold text-slate-900">
              Belum Ada Catatan Kesalahan
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Anda belum memiliki kesalahan yang tercatat pada kategori ini. Teruskan latihan harian untuk memantau perkembangan akurasi Anda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMistakes.map((item, idx) => (
              <div key={item.id || idx} className="surface-card p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">
                      {item.errorType || "Grammar Error"}
                    </span>
                    {item.skillName && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.skillName}
                      </span>
                    )}
                  </div>
                  {item.createdAt && (
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                <div className="text-base font-semibold text-slate-900">
                  {item.prompt || item.questionPrompt || "Pertanyaan Latihan"}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-red-50/60 border border-red-200/80 text-xs">
                    <span className="text-red-600 font-mono uppercase block text-[10px] font-semibold">
                      Jawaban Anda
                    </span>
                    <span className="font-medium text-red-950 mt-0.5 block">
                      {item.userAnswer}
                    </span>
                  </div>

                  {item.correctAnswer && (
                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-xs">
                      <span className="text-emerald-700 font-mono uppercase block text-[10px] font-semibold">
                        Jawaban Seharusnya
                      </span>
                      <span className="font-medium text-emerald-950 mt-0.5 block">
                        {item.correctAnswer}
                      </span>
                    </div>
                  )}
                </div>

                {item.explanation && (
                  <div className="pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    <strong className="text-slate-800">Penjelasan Kaidah: </strong>
                    {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}