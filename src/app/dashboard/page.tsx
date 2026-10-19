'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Flame,
  Gem,
  Award,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Brain,
  Shield,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  Compass,
} from 'lucide-react';
import { StandingMascot } from '@/components/StandingMascot';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    totalXp: number;
    gems: number;
    hearts: number;
    nextHeartRegenSeconds: number | null;
    currentStreak: number;
    longestStreak: number;
    streakFreezeCount: number;
    dailyGoalXp: number;
  };
  skillsOverview: {
    skillId: string;
    skillName: string;
    description: string;
    mastery: number;
    level: 'weak' | 'medium' | 'strong';
    attempts: number;
    correctCount: number;
  }[];
  weakSkills: {
    skillId: string;
    skillName: string;
    mastery: number;
    level: 'weak' | 'medium' | 'strong';
  }[];
  errorDistribution: {
    type: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  insights: string[];
  charts: {
    xp7Days: { date: string; xp: number; label: string }[];
    xp30Days: { date: string; xp: number; label: string }[];
    streakCalendar: { date: string; day: number; active: boolean; xp: number }[];
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xpTimeframe, setXpTimeframe] = useState<'7' | '30'>('7');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Gagal mengambil data dashboard');
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Menganalisis penguasaan dan riwayat belajar...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 text-center shadow-lg border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gagal Memuat Dashboard</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  const { stats, skillsOverview, weakSkills, errorDistribution, insights, charts } = data;

  // Format data untuk Bar Chart penguasaan skill
  const skillChartData = skillsOverview.map((s) => ({
    name: s.skillName.split(' ')[0] + ' ' + (s.skillName.split(' ')[1] || ''),
    fullName: s.skillName,
    percent: Math.round(s.mastery * 100),
    level: s.level,
  }));

  // Format data untuk Radar Chart
  const radarChartData = skillsOverview.map((s) => ({
    subject: s.skillName.length > 15 ? s.skillName.slice(0, 13) + '..' : s.skillName,
    score: Math.round(s.mastery * 100),
    fullMark: 100,
  }));

  const activeXpData = xpTimeframe === '7' ? charts.xp7Days : charts.xp30Days;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* 1. TOP NAVBAR / STATS HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-xl shadow-sm">
              F
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-lg text-emerald-700 dark:text-emerald-400">
                Fluenzy
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Kemampuanmu
              </span>
            </div>
          </div>

          {/* Gamification Stats Badges */}
          <div className="flex items-center gap-3 sm:gap-6 text-sm font-bold">
            {/* Streak */}
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400" title="Streak Belajar Harian">
              <Flame className="h-5 w-5 fill-amber-500" />
              <span>{stats.currentStreak} Hari</span>
              {stats.streakFreezeCount > 0 && (
                <span title="Streak Freeze Aktif">
                  <Shield className="h-4 w-4 text-sky-500 ml-0.5" />
                </span>
              )}
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400" title="Gems Terkumpul">
              <Gem className="h-5 w-5 fill-sky-500" />
              <span>{stats.gems}</span>
            </div>

            {/* Hearts (Lazy Regen) */}
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400" title="Nyawa Tersisa">
              <Heart className="h-5 w-5 fill-rose-500" />
              <span>{stats.hearts}/5</span>
              {stats.nextHeartRegenSeconds && (
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 hidden sm:inline">
                  (+1 dlm {Math.ceil(stats.nextHeartRegenSeconds / 60)}m)
                </span>
              )}
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400" title="Total XP">
              <Award className="h-5 w-5 fill-indigo-500" />
              <span>{stats.totalXp} XP</span>
            </div>

            {/* Roadmap Link Button */}
            <Link
              href="/roadmap"
              className="flex items-center gap-1.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition"
            >
              <Compass className="h-4 w-4 text-sky-500" />
              <span className="hidden sm:inline">Roadmap 50 Stage</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Banner Selamat Datang dengan Standing Mascot */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              Selamat Datang Kembali, {data.user.name}!
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Siap Melanjutkan Belajar Hari Ini?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Streak belajarmu saat ini sudah mencapai{' '}
              <strong className="text-amber-600 dark:text-amber-400">
                {stats.currentStreak} hari
              </strong>{' '}
              berturut-turut. Lanjutkan petualangan belajarmu di Roadmap 50 Stage atau perkuat materi yang masih sering keliru!
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 px-5 py-2.5 text-xs font-black text-white shadow-sm transition active:scale-95"
              >
                <Compass className="h-4 w-4" />
                Lanjut ke Roadmap (Stage 8)
              </Link>
              <Link
                href="/learn/lesson-1"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-black text-white shadow-sm transition active:scale-95"
              >
                <Brain className="h-4 w-4" />
                Mulai Sesi Adaptif
              </Link>
              <Link
                href="/practice/weakness"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                Latihan Titik Lemah
              </Link>
            </div>
          </div>
          <div className="shrink-0">
            <StandingMascot
              size="md"
              mood="idle"
              message={`Semangat, ${data.user.name}! Streak ${stats.currentStreak} harimu luar biasa!`}
              showSpeechBubble={true}
              canSwitchCharacter={true}
            />
          </div>
        </div>
        {/* Banner Wawasan Kognitif Otomatis (Rule-Based Insights) */}
        {insights.length > 0 && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Wawasan Diagnostik Belajarmu</span>
                  <span className="text-[11px] font-semibold bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                    Sistem Pakar
                  </span>
                </h3>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. GRID 2 KOLOM: TITIK LEMAH & RINGKASAN POLA KESALAHAN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom 1 (2 span): 3 Skill Perlu Diperkuat (Weak Skills) */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-amber-500" />
                  Materi yang Perlu Diperkuat
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Berdasarkan pemodelan Exponential Moving Average (EMA) terkini
                </p>
              </div>

              <Link
                href="/practice/weakness"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Latihan Titik Lemah
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {weakSkills.map((ws) => {
                const percent = Math.round(ws.mastery * 100);
                const isWeak = ws.mastery < 0.5;
                return (
                  <div
                    key={ws.skillId}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-400 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isWeak
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {isWeak ? 'Prioritas Tinggi' : 'Sedang'}
                        </span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                          {percent}%
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                        {ws.skillName}
                      </h4>
                    </div>

                    <div className="mt-4">
                      {/* Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isWeak ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom 2 (1 span): Ringkasan Pola Kesalahan (30 Hari) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Pola Kesalahan (30 Hari)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Surface Strategy Taxonomy (Dulay, Burt, Krashen)
            </p>

            {errorDistribution.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                Belum ada rekaman kesalahan dalam 30 hari terakhir.
              </div>
            ) : (
              <div className="space-y-3">
                {errorDistribution.map((err) => (
                  <div key={err.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {err.label}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {err.percentage}% ({err.count}x)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${err.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. VISUALISASI GRAFIK: RADAR & BAR PENGUASAAN SKILL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart Multi-Dimensi */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Radar className="h-5 w-5 text-emerald-500" />
              Peta Radar Kompetensi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Keseimbangan penguasaan pada 5 bidang tata bahasa & kosakata utama
            </p>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar
                    name="Penguasaan (%)"
                    dataKey="score"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.45}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Tingkat Penguasaan']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart Komparasi Level */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-500" />
              Skor Penguasaan Per Skill
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Merah: Lemah (&lt;50%), Kuning: Sedang (50-80%), Hijau: Kuat (&gt;80%)
            </p>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} width={110} />
                  <Tooltip
                    formatter={(val, name, item) => [`${val}%`, item.payload.fullName]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  />
                  <Bar dataKey="percent" radius={[0, 8, 8, 0]}>
                    {skillChartData.map((entry, index) => {
                      const color =
                        entry.percent < 50
                          ? '#f43f5e' // Rose
                          : entry.percent <= 80
                          ? '#f59e0b' // Amber
                          : '#10b981'; // Emerald
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 5. GRAFIK XP HARIAN & KALENDER STREAK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grafik XP Harian (2 span) */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  Perolehan XP Harian
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target harian: {stats.dailyGoalXp} XP per hari
                </p>
              </div>

              {/* Toggle Timeframe 7 / 30 Hari */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
                <button
                  onClick={() => setXpTimeframe('7')}
                  className={`px-3 py-1 rounded-lg transition ${
                    xpTimeframe === '7'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => setXpTimeframe('30')}
                  className={`px-3 py-1 rounded-lg transition ${
                    xpTimeframe === '30'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  30 Hari
                </button>
              </div>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeXpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val} XP`, 'Perolehan']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#xpGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Kalender Streak Bulan Ini (1 span) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Calendar className="h-5 w-5 text-amber-500" />
              Kalender Keaktifan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Aktivitas belajar pada bulan berjalan
            </p>

            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                <div key={d} className="font-semibold text-slate-400 py-1">
                  {d}
                </div>
              ))}
              {charts.streakCalendar.map((item) => (
                <div
                  key={item.date}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition ${
                    item.active
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                  title={`${item.date}: ${item.xp} XP`}
                >
                  {item.day}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Aktif Belajar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                Belum Ada
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
