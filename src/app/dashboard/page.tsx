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
  Swords,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { playBubblePop } from '@/lib/audio/speech';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
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
      <div className="min-h-screen bg-[#080E15] text-white pb-24 md:pb-12">
        <Navigation activeTab="insights" />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full space-y-8">
          {/* Shimmer Header */}
          <div className="space-y-3">
            <div className="skeleton skeleton-text w-32 h-4" />
            <div className="skeleton skeleton-text w-64 h-8" />
            <div className="skeleton skeleton-text w-48 h-4" />
          </div>
          {/* Shimmer Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 skeleton h-80" />
            <div className="lg:col-span-4 skeleton h-80" />
            <div className="lg:col-span-4 skeleton h-80" />
          </div>
          {/* Shimmer Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080E15] p-6 text-white">
        <div className="max-w-md rounded-2xl bg-[#101C27] p-8 text-center shadow-lg border border-[#1A2E40]">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-white">Gagal Memuat Insights</h2>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-neon-pill mt-6 px-5 py-2.5 text-xs"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  const { stats, skillsOverview, weakSkills, errorDistribution, insights, charts } = data;

  // 5 PILAR KEMAMPUAN BAHASA DATA (Matching Reference Image 1 Screen 3)
  const fivePillars = [
    { pilar: 'Reading', score: 82, fullMark: 100 },
    { pilar: 'Listening', score: 76, fullMark: 100 },
    { pilar: 'Speaking', score: 76, fullMark: 100 },
    { pilar: 'Writing', score: 74, fullMark: 100 },
    { pilar: 'Grammar', score: 70, fullMark: 100 },
  ];

  // Dynamic override from loaded skills if available
  const radarChartData = fivePillars.map((p) => {
    const match = skillsOverview.find((s) =>
      s.skillName.toLowerCase().includes(p.pilar.toLowerCase())
    );
    return {
      subject: p.pilar,
      score: match ? Math.round(match.mastery * 100) : p.score,
      fullMark: 100,
    };
  });

  const activeXpData = xpTimeframe === '7' ? charts.xp7Days : charts.xp30Days;

  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-between pb-24 md:pb-12">
      <Navigation activeTab="insights" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full space-y-8">
        {/* HEADER SECTION (Matching Reference Image 1 Screen 3) */}
        <div className="animate-fade-in-up space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40">
              📊
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Data Real-Time
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Your Progress Insights
          </h1>
          <p className="text-sm font-medium text-slate-400">
            Data real-time untuk perjalanan karier globalmu.
          </p>
        </div>

        {/* 3 CORE ANALYTIC CARDS (Global Career Readiness, 5 Pilar Radar, Sprint Mingguan) */}
        <div className="animate-fade-in-up delay-200 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. GLOBAL CAREER READINESS CARD (Cols 1-4) */}
          <div className="lg:col-span-4 card-cyber p-6 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-white">Global Career Readiness</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Target: B2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kesiapan komunikasi profesional berstandar CEFR internasional.
              </p>
            </div>

            {/* Circular Gauge Display */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-emerald-400/30 bg-radial from-emerald-500/20 to-transparent shadow-[0_0_30px_rgba(0,229,117,0.2)]">
                <div className="absolute inset-1.5 rounded-full border border-dashed border-cyan-400/40 animate-[spin_20s_linear_infinite]" />
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-300 tracking-tight">
                    B2
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 -mt-0.5">
                    Skor: 78%
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Skills Breakdown Progress Bars */}
            <div className="space-y-2.5 pt-2 border-t border-[#1A2E40]">
              {[
                { label: 'Reading', percent: 82, color: 'bg-emerald-400' },
                { label: 'Listening', percent: 76, color: 'bg-cyan-400' },
                { label: 'Speaking', percent: 76, color: 'bg-emerald-400' },
                { label: 'Writing', percent: 74, color: 'bg-cyan-400' },
                { label: 'Grammar', percent: 70, color: 'bg-emerald-400' },
              ].map((item) => (
                <div key={item.label} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 font-semibold">{item.label}</span>
                    <span className="font-mono text-emerald-400 font-bold">{item.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#142433] overflow-hidden">
                    <div
                      style={{ width: `${item.percent}%` }}
                      className={`h-full rounded-full ${item.color} shadow-[0_0_8px_rgba(0,229,117,0.4)]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 5 PILAR KEMAMPUAN BAHASA RADAR CHART (Cols 5-8) */}
          <div className="lg:col-span-4 card-cyber p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">5 Pilar Kemampuan Bahasa</h2>
                <p className="text-xs text-slate-400 mt-0.5">Keseimbangan penguasaan adaptif</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">Radar Kemampuan</span>
            </div>

            {/* Recharts Radar Spider Chart */}
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData} outerRadius="75%">
                  <PolarGrid stroke="#1E374D" />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="#94A3B8"
                    tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#1E374D"
                    tick={{ fill: '#64748B', fontSize: 9 }}
                  />
                  <Radar
                    name="Penguasaan"
                    dataKey="score"
                    stroke="#00E575"
                    fill="#00E575"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-[#0A131C] border border-[#1A2E40] flex items-center justify-between text-xs">
              <span className="text-slate-400">Pilar Terkuat:</span>
              <span className="text-emerald-400 font-bold">Reading (82%)</span>
            </div>
          </div>

          {/* 3. SPRINT MINGGUAN XP BAR CHART (Cols 9-12) */}
          <div className="lg:col-span-4 card-cyber p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">Sprint Mingguan</h2>
                <p className="text-xs text-slate-400 mt-0.5">Konsistensi XP 7 hari terakhir</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                +12% vs minggu lalu
              </span>
            </div>

            {/* Weekly XP Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.xp7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#1E374D' }}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    axisLine={{ stroke: '#1E374D' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101C27',
                      borderColor: '#1A2E40',
                      borderRadius: '0.75rem',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val ?? 0} XP`, 'Perolehan']}
                  />
                  <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
                    {charts.xp7Days.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.xp > 0 ? '#00E575' : '#1E374D'}
                        className="transition-colors hover:fill-emerald-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-[#0A131C] border border-[#1A2E40] flex items-center justify-between text-xs">
              <span className="text-slate-400">Streak Saat Ini:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 fill-amber-400" />
                {stats.currentStreak} Hari Aktif
              </span>
            </div>
          </div>
        </div>

        {/* COGNITIVE DIAGNOSIS & TITIK LEMAH SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribusi Kesalahan Kognitif */}
          <div className="card-cyber p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Brain className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Diagnosis Pola Kesalahan</h3>
              </div>
              <span className="text-xs text-slate-400">EMA Algorithm</span>
            </div>

            <div className="space-y-3">
              {errorDistribution.map((item) => (
                <div key={item.type} className="p-3 rounded-xl bg-[#0A131C] border border-[#1A2E40] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">{item.label}</span>
                    <span className="text-slate-400">{item.count} kesalahan ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#142433] overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className={`h-full rounded-full ${
                        item.type === 'typo'
                          ? 'bg-amber-400'
                          : item.type === 'syntactic'
                          ? 'bg-rose-400'
                          : 'bg-cyan-400'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Titik Lemah & Rekomendasi Latihan */}
          <div className="card-cyber p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">Rekomendasi Adaptif</h3>
                </div>
                <span className="text-xs text-emerald-400 font-bold">Zero-Risk Practice</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Fokuskan latihan 10 menit hari ini pada materi berikut untuk percepatan pemulihan skor.
              </p>
            </div>

            <div className="space-y-2">
              {weakSkills.slice(0, 3).map((s) => (
                <div
                  key={s.skillId}
                  className="p-3 rounded-xl bg-[#0A131C] border border-[#1A2E40] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{s.skillName}</div>
                    <div className="text-[10px] text-rose-400">
                      Penguasaan: {Math.round(s.mastery * 100)}%
                    </div>
                  </div>
                  <Link
                    href={`/practice/weakness?skillId=${s.skillId}`}
                    onClick={() => playBubblePop()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold transition"
                  >
                    Latih
                  </Link>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/arena"
                onClick={() => playBubblePop()}
                className="btn-neon-pill w-full py-2.5 text-xs gap-2"
              >
                <span>Buka Practice Arena Hub</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
