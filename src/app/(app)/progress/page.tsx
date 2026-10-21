'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  BarChart3,
  Flame,
  Award,
  Trophy,
  Sparkles,
  BookOpen,
  Target,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Volume2,
  Zap,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LottiePlayer } from '@/components/ui/LottiePlayer';
import { playBubblePop, speakText } from '@/lib/audio/speech';

interface DayXp {
  day: string;
  short: string;
  xp: number;
  heightPct: number;
}

const WEEK_XP_DATA: DayXp[] = [
  { day: 'Monday', short: 'M', xp: 35, heightPct: 45 },
  { day: 'Tuesday', short: 'T', xp: 50, heightPct: 65 },
  { day: 'Wednesday', short: 'W', xp: 45, heightPct: 58 },
  { day: 'Thursday', short: 'T', xp: 60, heightPct: 80 },
  { day: 'Friday', short: 'F', xp: 70, heightPct: 95 },
  { day: 'Saturday', short: 'S', xp: 50, heightPct: 65 },
  { day: 'Sunday', short: 'S', xp: 40, heightPct: 52 },
];

const ACHIEVEMENTS = [
  {
    id: 'streak_7',
    title: '7 Days Streak',
    desc: 'Practiced 7 days in a row without breaking streak',
    icon: Flame,
    color: 'from-amber-500/20 to-orange-500/20 text-orange-400 border-orange-500/30',
    status: 'Unlocked',
    progress: 100,
  },
  {
    id: 'words_100',
    title: '100 Words Learner',
    desc: 'Mastered 86 of 100 essential conversational words',
    icon: BookOpen,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    status: '86%',
    progress: 86,
  },
  {
    id: 'perfect_score',
    title: 'First Perfect Score',
    desc: 'Scored 100% pronunciation accuracy in a speaking drill',
    icon: Sparkles,
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    status: 'Unlocked',
    progress: 100,
  },
  {
    id: 'weekly_goal',
    title: 'Week Goal Achiever',
    desc: 'Surpassed the 300 XP weekly practice milestone',
    icon: Trophy,
    color: 'from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30',
    status: 'Unlocked',
    progress: 100,
  },
];

const WEAK_PHONEMES = [
  { phoneme: '/θ/', example: 'think, thank, thought', accuracy: 68, status: 'Needs Practice' },
  { phoneme: '/ð/', example: 'this, that, brother', accuracy: 74, status: 'Improving' },
  { phoneme: '/r/', example: 'red, road, foreign', accuracy: 82, status: 'Good' },
];

export default function ProgressPage() {
  const [selectedRange, setSelectedRange] = useState<'week' | 'month'>('week');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(4); // Friday default

  const activeDay = WEEK_XP_DATA[activeDayIndex];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* 1. TOP HEADER (Progress Title + Timeframe Filter) */}
      <div className="animate-fade-in-down flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#6366F1]">
              Analytics & Insights
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Progress
          </h1>
          <p className="text-xs text-slate-400">
            Track your weekly XP velocity, speaking streak, and vocabulary mastery.
          </p>
        </div>

        {/* Dropdown Filter Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-full bg-[#1E293B] p-1 border border-white/10 text-xs font-bold text-slate-300">
            <button
              onClick={() => {
                playBubblePop();
                setSelectedRange('week');
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                selectedRange === 'week'
                  ? 'bg-[#4338CA] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => {
                playBubblePop();
                setSelectedRange('month');
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                selectedRange === 'month'
                  ? 'bg-[#4338CA] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN XP CHART CARD (Screen 5 Lingua Area Chart Style) */}
      <Card className="animate-fade-in-up relative overflow-hidden border-0 bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#0A0E1A] p-6 sm:p-7 text-white shadow-2xl rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">
                XP Earned
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="h-3 w-3" /> +18%
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                350 XP
              </h2>
              <span className="text-xs text-slate-400">Total this week</span>
            </div>
          </div>

          {/* Active Day XP Callout */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 backdrop-blur-sm self-start sm:self-auto">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {activeDay.day}
            </span>
            <span className="text-sm font-black text-indigo-400">
              {activeDay.xp} XP earned
            </span>
          </div>
        </div>

        {/* Spline Area Chart Visual with Mon-Sun Bars & SVG Curve */}
        <div className="relative pt-8 pb-2">
          {/* SVG Smooth Wave curve background */}
          <div className="absolute inset-x-0 bottom-12 top-4 pointer-events-none opacity-40">
            <svg
              className="w-full h-full"
              viewBox="0 0 700 120"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 50,70 Q 150,30 250,50 T 450,15 T 550,45 T 650,55 L 650,120 L 50,120 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M 50,70 Q 150,30 250,50 T 450,15 T 550,45 T 650,55"
                stroke="#818CF8"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Interactive Mon-Sun Day Columns */}
          <div className="relative z-10 grid grid-cols-7 gap-2 items-end h-40">
            {WEEK_XP_DATA.map((item, idx) => {
              const isSelected = idx === activeDayIndex;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    playBubblePop();
                    setActiveDayIndex(idx);
                  }}
                  className="flex flex-col items-center justify-end h-full group focus:outline-none"
                >
                  {/* Tooltip on top of active pillar */}
                  {isSelected && (
                    <div className="mb-2 px-2 py-0.5 rounded-md bg-[#6366F1] text-white text-[10px] font-black shadow-lg animate-bounce">
                      {item.xp} XP
                    </div>
                  )}

                  {/* Vertical Bar Capsule */}
                  <div className="w-8 sm:w-11 bg-white/5 rounded-2xl p-1 flex flex-col justify-end h-28 border border-white/5 group-hover:border-indigo-400/50 transition-all">
                    <div
                      style={{ height: `${item.heightPct}%` }}
                      className={`w-full rounded-xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#4338CA] to-[#818CF8] shadow-lg shadow-indigo-500/50'
                          : 'bg-white/10 group-hover:bg-white/20'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`mt-2 text-xs font-bold transition-colors ${
                      isSelected ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'
                    }`}
                  >
                    {item.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 3. MASCOT CHEER COMPANION CARD (Cute Baby Owl Coach Lumi) */}
      <div className="animate-fade-in-scale relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181E36] via-[#1E293B] to-[#141B2D] border border-white/10 p-5 sm:p-6 shadow-xl card-hover-lift">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Owl Coach 3D Squircle */}
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-3xl overflow-hidden border-2 border-indigo-500/40 shadow-xl bg-indigo-950/40">
            <Image
              src="/mascot/lingua_owl_coach.jpg"
              alt="Coach Lumi the Cute Owl"
              width={96}
              height={96}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-black border border-indigo-500/30">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Coach Lumi Says</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              You&apos;re 82% towards your Weekly Master Trophy! 🦉
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Just 3 more conversational drills to secure the Diamond League. Keep your speaking momentum alive!
            </p>
          </div>

          {/* Lottie Achievement Medal Celebration */}
          <div className="hidden md:flex h-20 w-24 shrink-0 items-center justify-center pointer-events-none">
            <LottiePlayer
              animationPath="/animations/achievement_certify.json"
              loop={true}
              className="w-full h-full scale-125"
            />
          </div>

          <div className="shrink-0">
            <Link href="/practice/speaking">
              <Button
                onClick={() => {
                  playBubblePop();
                  speakText('Keep going! You are doing amazing.', { gender: 'female', emotion: 'encouraging' });
                }}
                className="btn-lingua-primary px-4 py-2.5 text-xs font-black gap-2 shadow-lg"
              >
                <span>Practice Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. THREE STAT CARDS (Lessons, Words Learned, Streak - Screen 5 Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Lessons */}
        <Card className="border-0 bg-[#0F172A] p-5 rounded-2xl border border-white/5 space-y-2 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              +3 today
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Lessons</span>
            <div className="text-2xl font-black text-white">12</div>
          </div>
        </Card>

        {/* Card 2: Words Learned */}
        <Card className="border-0 bg-[#0F172A] p-5 rounded-2xl border border-white/5 space-y-2 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Target className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
              Top 10%
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Words Learned</span>
            <div className="text-2xl font-black text-white">86</div>
          </div>
        </Card>

        {/* Card 3: Streak */}
        <Card className="border-0 bg-[#0F172A] p-5 rounded-2xl border border-white/5 space-y-2 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              Active 🔥
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Day Streak</span>
            <div className="text-2xl font-black text-white">7 Days</div>
          </div>
        </Card>
      </div>

      {/* 5. ACHIEVEMENTS SECTION (Screen 5 Lingua Badges Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-black text-white tracking-tight">Achievements</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">4 / 8 Unlocked</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ACHIEVEMENTS.map((ach) => {
            const Icon = ach.icon;
            return (
              <div
                key={ach.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#0F172A] border border-white/5 hover:border-white/15 transition-all group"
              >
                <div
                  className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${ach.color} flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-white truncate">
                      {ach.title}
                    </h4>
                    <span className="text-[10px] font-black text-slate-400">
                      {ach.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {ach.desc}
                  </p>
                  {/* Progress Bar */}
                  <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-[#6366F1] h-full rounded-full transition-all duration-500"
                      style={{ width: `${ach.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. FOCUS PHONEMES & REMEDIATION (Targeted Pronunciation) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-black text-white tracking-tight">
              Focus Phonemes
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Diagnostic Drill Target</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WEAK_PHONEMES.map((ph, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#0F172A] border border-white/5 space-y-2 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-cyan-400 font-mono">
                  {ph.phoneme}
                </span>
                <span className="text-xs font-black text-white">{ph.accuracy}%</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">&ldquo;{ph.example}&rdquo;</p>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full"
                  style={{ width: `${ph.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
