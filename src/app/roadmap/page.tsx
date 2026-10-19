"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LessonItem {
  id: string;
  dayNumber: number;
  title: string;
  description?: string;
  category?: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  accuracy?: number;
}

export default function RoadmapPage() {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        const rawLessons = data?.lessons || data?.roadmap || [];
        if (Array.isArray(rawLessons) && rawLessons.length > 0) {
          setLessons(
            rawLessons.map((item: any, idx: number) => ({
              id: String(item.id ?? idx + 1),
              dayNumber: Number(item.dayNumber ?? item.day ?? idx + 1),
              title: item.title || `Modul Hari ${idx + 1}`,
              description: item.description || item.topic || "Latihan tata bahasa dan kosakata terstruktur.",
              category:
                item.category ||
                (idx < 10
                  ? "Fondasi Struktur"
                  : idx < 20
                  ? "Pengembangan Kalimat"
                  : "Kemahiran Kontekstual"),
              isCompleted: Boolean(item.isCompleted ?? item.completed),
              isUnlocked:
                item.isUnlocked !== undefined
                  ? Boolean(item.isUnlocked)
                  : idx === 0 || Boolean(rawLessons[idx - 1]?.isCompleted),
              accuracy: item.accuracy !== undefined ? Number(item.accuracy) : undefined,
            }))
          );
        } else {
          const fallback: LessonItem[] = Array.from({ length: 30 }, (_, i) => ({
            id: String(i + 1),
            dayNumber: i + 1,
            title: `Modul Pembelajaran Hari ${i + 1}`,
            description: "Penguasaan struktur tata bahasa dan evaluasi pemahaman.",
            category:
              i < 10
                ? "Fondasi Struktur"
                : i < 20
                ? "Pengembangan Kalimat"
                : "Kemahiran Kontekstual",
            isCompleted: false,
            isUnlocked: i === 0,
          }));
          setLessons(fallback);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
              Peta Kurikulum 30 Hari
            </span>
          </div>

          <Link
            href="/practice/review"
            className="btn-tactile-secondary px-3.5 py-1.5 text-xs"
          >
            Review Terjadwal
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
              30-Day Curriculum Architecture
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Kurikulum Pembelajaran Terstruktur
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Selesaikan modul secara berurutan untuk membuka materi tingkat lanjut.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Tuntas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Tersedia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              Terkunci
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className="h-36 bg-slate-200 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => {
              const badge = lesson.isCompleted
                ? {
                    label: "Tuntas",
                    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  }
                : lesson.isUnlocked
                ? {
                    label: "Tersedia",
                    style: "bg-blue-50 text-blue-700 border-blue-200",
                  }
                : {
                    label: "Terkunci",
                    style: "bg-slate-100 text-slate-500 border-slate-200",
                  };

              return (
                <div
                  key={lesson.id}
                  className={`surface-card p-5 flex flex-col justify-between transition-all ${
                    !lesson.isUnlocked
                      ? "opacity-60 bg-slate-50/70"
                      : "hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        HARI {String(lesson.dayNumber).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border font-medium ${badge.style}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-slate-900 leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {lesson.description || lesson.category}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">
                      {lesson.accuracy !== undefined
                        ? `Akurasi: ${Math.round(lesson.accuracy)}%`
                        : lesson.category}
                    </span>

                    {lesson.isUnlocked ? (
                      <Link
                        href={`/learn/${lesson.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        {lesson.isCompleted ? "Ulangi Modul" : "Mulai Modul"}
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    ) : (
                      <span className="text-xs font-mono text-slate-400">
                        Terkunci
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
