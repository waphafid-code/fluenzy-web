"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface SkillItem {
  id?: string;
  name?: string;
  skillName?: string;
  mastery?: number;
  masteryScore?: number;
  accuracy?: number;
}

interface InsightItem {
  type?: string;
  title: string;
  message: string;
}

export default function DashboardPage() {
  const [rawData, setRawData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setRawData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-14 bg-slate-200 rounded-lg w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const user = rawData?.user || {
    name: rawData?.userName || "Pelajar",
    xp: rawData?.xp ?? 0,
    streak: rawData?.streak ?? 0,
    level: rawData?.level ?? 1,
  };

  const masteryScore =
    rawData?.stats?.masteryScore ??
    rawData?.averageMastery ??
    rawData?.masteryScore ??
    0;

  const dueReviewsCount =
    rawData?.stats?.dueReviewsCount ??
    rawData?.dueReviews ??
    rawData?.dueCount ??
    0;

  const weakSkills: SkillItem[] =
    rawData?.weakSkills || rawData?.skills?.filter((s: any) => (s.mastery ?? 0) < 70) || [];

  const weakSkillsCount =
    rawData?.stats?.weakSkillsCount ?? weakSkills.length ?? 0;

  const completedLessons =
    rawData?.stats?.completedLessons ?? rawData?.completedLessonsCount ?? 0;

  const totalLessons =
    rawData?.stats?.totalLessons ?? rawData?.totalLessonsCount ?? 30;

  const insights: InsightItem[] = rawData?.insights || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                FL
              </div>
              <span className="font-semibold text-base tracking-tight">
                Fluenzy
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                href="/roadmap"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                Kurikulum 30 Hari
              </Link>
              <Link
                href="/mistakes"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                Log Kesalahan
              </Link>
              <Link
                href="/teacher"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                Panel Pengajar
              </Link>
              <Link
                href="/research"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                Evaluasi SUS
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-700 metric-value">
              <svg
                className="w-3.5 h-3.5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>{user.streak} Hari</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-700 metric-value">
              <span className="text-blue-600 font-bold">XP</span>
              <span>{user.xp}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* User Card */}
        <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/mascot/mascot_boy_bust.png"
                alt="Avatar"
                width={56}
                height={56}
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {user.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium">
                  Level {user.level || 1}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Pantau perkembangan penguasaan kompetensi dan selesaikan antrean latihan adaptif Anda.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              href="/roadmap"
              className="btn-tactile-primary px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 flex-1 md:flex-initial"
            >
              Buka Modul Harian
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Rata-rata Penguasaan</span>
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-slate-900 metric-value mt-2">
              {Math.round(Number(masteryScore))}%
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(Number(masteryScore)))}%`,
                }}
              />
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Antrean Spaced Repetition</span>
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-slate-900 metric-value mt-2">
              {dueReviewsCount}{" "}
              <span className="text-sm font-normal text-slate-500">item</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Materi yang jatuh tempo untuk diulas
            </p>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Topik Perlu Penguatan</span>
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-slate-900 metric-value mt-2">
              {weakSkillsCount}{" "}
              <span className="text-sm font-normal text-slate-500">kompetensi</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Terdeteksi di bawah ambang penguasaan
            </p>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Penyelesaian Kurikulum</span>
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-slate-900 metric-value mt-2">
              {completedLessons} / {totalLessons}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Modul harian tuntas dikerjakan
            </p>
          </div>
        </section>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Jalur Latihan Terfokus
            </h2>

            <div className="surface-card p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <h3 className="font-semibold text-sm text-slate-900">
                    Review Spaced Repetition
                  </h3>
                </div>
                <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                  Kerjakan kembali soal-soal yang telah mencapai jadwal pengulangan agar tersimpan di memori jangka panjang.
                </p>
              </div>
              <Link
                href="/practice/review"
                className="btn-tactile-secondary px-4 py-2 text-xs shrink-0"
              >
                Mulai Review ({dueReviewsCount})
              </Link>
            </div>

            <div className="surface-card p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <h3 className="font-semibold text-sm text-slate-900">
                    Latihan Fokus Kelemahan
                  </h3>
                </div>
                <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                  Sesi intensif yang memprioritaskan aturan tata bahasa dengan tingkat kesalahan tertinggi.
                </p>
              </div>
              <Link
                href="/practice/weakness"
                className="btn-tactile-secondary px-4 py-2 text-xs shrink-0"
              >
                Remediasi Topik
              </Link>
            </div>

            <div className="surface-card p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <h3 className="font-semibold text-sm text-slate-900">
                    Evaluasi Log Kesalahan
                  </h3>
                </div>
                <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                  Tinjau riwayat jawaban yang keliru beserta klasifikasi tipe error dan penjelasan perbaikannya.
                </p>
              </div>
              <Link
                href="/mistakes"
                className="btn-tactile-secondary px-4 py-2 text-xs shrink-0"
              >
                Lihat Log
              </Link>
            </div>
          </div>

          {/* Diagnostic Insights Column */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Laporan Diagnostik
            </h2>

            <div className="surface-card p-5 space-y-4">
              {insights.length > 0 ? (
                insights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1"
                  >
                    <div className="text-xs font-semibold text-slate-900">
                      {item.title}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                  Mesin analitik siap merekam respons Anda. Selesaikan modul harian untuk menghasilkan rekomendasi pembelajaran yang dipersonalisasi.
                </div>
              )}

              {weakSkills.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-mono uppercase text-slate-500 font-semibold">
                    Kompetensi Prioritas
                  </div>
                  {weakSkills.slice(0, 4).map((skill, idx) => {
                    const score = Math.round(
                      Number(skill.mastery ?? skill.masteryScore ?? skill.accuracy ?? 0)
                    );
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">
                            {skill.skillName || skill.name || `Kompetensi ${idx + 1}`}
                          </span>
                          <span className="font-mono text-slate-500 metric-value">
                            {score}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, score)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
