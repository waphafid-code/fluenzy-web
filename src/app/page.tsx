'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Brain,
  Zap,
  BarChart3,
  ArrowRight,
  Flame,
  CheckCircle2,
  Compass,
  Swords,
  User,
  Shield,
  Volume2,
  Globe,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { playBubblePop, speakText } from '@/lib/audio/speech';

export default function HomePage() {
  function handlePlayGreeting(text: string) {
    playBubblePop();
    speakText(text);
  }

  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-between relative overflow-hidden">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 rounded-full bg-emerald-500/08 blur-3xl pointer-events-none -z-10" />

      {/* TOP HEADER (Matching Reference Image 2) */}
      <header className="border-b border-[#1A2E40] bg-[#080E15]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(0,229,117,0.35)] group-hover:scale-105 transition">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0A131C]">
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-cyan-400 font-black text-lg">
                  ✦
                </span>
              </div>
            </div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition">
              Fluency
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-300">
            <Link href="/" className="text-emerald-400 border-b-2 border-emerald-400 pb-0.5">
              Home
            </Link>
            <Link href="/roadmap" className="hover:text-emerald-400 transition">
              Roadmap 50 Stage
            </Link>
            <Link href="/arena" className="hover:text-emerald-400 transition">
              Practice Arena
            </Link>
            <Link href="/dashboard" className="hover:text-emerald-400 transition">
              Progress Insights
            </Link>
            <Link href="/profile" className="hover:text-emerald-400 transition">
              Profile & Liga
            </Link>
          </nav>

          {/* HEADER CTAS */}
          <div className="flex items-center gap-3">
            <Link
              href="/teacher"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 transition hidden sm:inline-block"
            >
              Log In
            </Link>
            <Link
              href="/roadmap"
              onClick={() => playBubblePop()}
              className="btn-neon-pill px-4 py-2 text-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Faithfully matching Reference Image 2: "Master a New Language, Your Way") */}
      <main className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 w-full space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT HERO TEXT (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Pill */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-4 py-1.5 text-xs font-black text-emerald-300 shadow-[0_0_15px_rgba(0,229,117,0.15)]">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>LEARN SMARTER, GROW FASTER</span>
            </div>

            {/* Main Headline */}
            <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Master a New{' '}
              <span className="block text-gradient-animated">
                Language,
              </span>
              Your Way.
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up delay-200 text-base sm:text-lg font-medium text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Learn English through personalized lessons, interactive exercises, and a learning path that adapts to your progress.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up delay-300 flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/roadmap"
                onClick={() => playBubblePop()}
                className="btn-neon-pill px-7 py-3.5 text-sm gap-2"
              >
                <span>→ Start Learning</span>
              </Link>
              <Link
                href="/arena"
                onClick={() => playBubblePop()}
                className="btn-cyber-pill px-6 py-3.5 text-sm"
              >
                Explore Features
              </Link>
            </div>

            {/* 3 Value Propositions */}
            <div className="animate-fade-in-up delay-400 grid grid-cols-3 gap-3 pt-6 border-t border-[#1A2E40]/80 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Adaptive</div>
                  <div className="text-[11px] text-slate-400">Learning</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Interactive</div>
                  <div className="text-[11px] text-slate-400">Practice</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Track Your</div>
                  <div className="text-[11px] text-slate-400">Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT HERO GRAPHIC: LUMI WITH TECH HEADPHONES & FLOATING BUBBLES (Cols 8-12) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Glowing Floor Pedestal */}
            <div className="absolute bottom-4 w-72 h-20 mascot-pedestal-glow -z-10" />

            {/* Mascot Image Container with Interactive Speech */}
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
              {/* Center Mascot Image */}
              <div
                onClick={() => handlePlayGreeting("Hey, I'm Lumi! Ready for today's lesson?")}
                className="animate-pop-in delay-300 relative w-[340px] h-[340px] cursor-pointer group transition-transform duration-300 hover:scale-105"
                title="Klik untuk menyapa Lumi!"
              >
                <Image
                  src="/mascot/lumi_hero.png"
                  alt="Lumi Mascot"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                />
              </div>

              {/* FLOATING SPEECH BUBBLE 1: Hello! (Top Left - Cyan) */}
              <button
                type="button"
                onClick={() => handlePlayGreeting('Hello!')}
                className="animate-bubble-1 absolute top-8 left-4 px-3.5 py-1.5 rounded-full bg-[#142D3D] border border-cyan-400/50 text-cyan-300 text-xs font-black shadow-[0_0_15px_rgba(0,210,255,0.3)] hover:scale-110 transition cursor-pointer"
              >
                Hello!
              </button>

              {/* FLOATING SPEECH BUBBLE 2: 你好 (Top Right - Blue) */}
              <button
                type="button"
                onClick={() => handlePlayGreeting('Ni hao!')}
                className="animate-bubble-2 absolute top-2 right-12 px-3 py-1.5 rounded-full bg-[#152338] border border-blue-400/50 text-blue-300 text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-110 transition cursor-pointer"
              >
                你好
              </button>

              {/* FLOATING SPEECH BUBBLE 3: Hola! (Bottom Left - Indigo) */}
              <button
                type="button"
                onClick={() => handlePlayGreeting('Hola!')}
                className="animate-bubble-3 absolute bottom-16 left-6 px-3.5 py-1.5 rounded-full bg-[#18233C] border border-indigo-400/50 text-indigo-300 text-xs font-black shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-110 transition cursor-pointer"
              >
                Hola!
              </button>

              {/* FLOATING SPEECH BUBBLE 4: Bonjour! (Bottom Right - Emerald) */}
              <button
                type="button"
                onClick={() => handlePlayGreeting('Bonjour!')}
                className="animate-bubble-4 absolute bottom-10 right-4 px-3.5 py-1.5 rounded-full bg-[#112D22] border border-emerald-400/50 text-emerald-300 text-xs font-black shadow-[0_0_15px_rgba(0,229,117,0.3)] hover:scale-110 transition cursor-pointer"
              >
                Bonjour!
              </button>

              {/* MASCOT DIALOGUE CARD: "Hey, I'm Lumi! Ready for today's lesson?" */}
              <div
                onClick={() => handlePlayGreeting("Hey, I'm Lumi! Ready for today's lesson?")}
                className="absolute top-14 right-0 max-w-[210px] bg-[#101C27]/95 border border-emerald-500/40 rounded-2xl p-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center gap-2 cursor-pointer hover:border-emerald-400 transition"
              >
                <div className="relative h-9 w-9 rounded-xl overflow-hidden shrink-0 border border-emerald-400/40 bg-[#080E15]">
                  <Image
                    src="/mascot/lily_head_circle.png"
                    alt="Lumi Avatar"
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-black text-emerald-400">Hey, I&apos;m Lumi!</div>
                  <div className="text-[10px] text-slate-300 leading-tight">Ready for today&apos;s lesson?</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAHAP 2 SIKLUS HARIAN: BELAJAR • LATIHAN • BERKEMBANG (From Reference Image 1) */}
        <div className="space-y-6 pt-10 border-t border-[#1A2E40]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                TAHAP 2
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Siklus Harian: Belajar • Latihan • Berkembang
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                4 langkah sederhana untuk hasil belajar maksimal setiap hari
              </p>
            </div>
            <Link
              href="/roadmap"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Jelajahi Roadmap</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1: Check-in Harian */}
            <div className="card-cyber p-5 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40">
                  1
                </span>
                <Flame className="h-5 w-5 text-amber-400 fill-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                  Check-in Harian
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Streak Tracker, Lily menyapa & target 50 XP harian.
                </p>
              </div>
              <div className="pt-2 border-t border-[#1A2E40]/80 flex items-center justify-between text-[11px] text-amber-400 font-bold">
                <span>14 Hari Streak</span>
                <span>Target 50 XP</span>
              </div>
            </div>

            {/* Step 2: Melangkah di Roadmap */}
            <div className="card-cyber p-5 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-black text-xs border border-cyan-500/40">
                  2
                </span>
                <Compass className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                  Melangkah di Roadmap
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  1-2 Stage Modul, materi baru / review adaptif bertahap.
                </p>
              </div>
              <div className="pt-2 border-t border-[#1A2E40]/80 flex items-center justify-between text-[11px] text-cyan-400 font-bold">
                <span>Stage 12 → 13</span>
                <span>+50 XP • +15 Gems</span>
              </div>
            </div>

            {/* Step 3: Drill Khusus di Arena */}
            <div className="card-cyber p-5 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40">
                  3
                </span>
                <Swords className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                  Drill Khusus di Arena
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Perbaiki Titik Lemah, Zero-Risk Practice & Speaking Drill.
                </p>
              </div>
              <div className="pt-2 border-t border-[#1A2E40]/80 flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                <span>5 Mode Drill</span>
                <span>Latihan 10 Menit</span>
              </div>
            </div>

            {/* Step 4: Evaluasi & Reward */}
            <div className="card-cyber p-5 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs border border-amber-500/40">
                  4
                </span>
                <Shield className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                  Evaluasi & Reward
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  XP, Gems & Naik Liga, Arthur berikan feedback diagnosa.
                </p>
              </div>
              <div className="pt-2 border-t border-[#1A2E40]/80 flex items-center justify-between text-[11px] text-amber-400 font-bold">
                <span>Silver League</span>
                <span>Radar Kemampuan</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 KARAKTER 3D DI TAHAP 2 (Lily & Arthur) */}
        <div className="card-cyber-glow p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                AI Companion & Diagnostic Mentors
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                2 Karakter 3D di Tahap 2
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Personalisasikan mentor sesuai gaya belajarmu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lily Card */}
            <div className="bg-[#0B1520] border border-emerald-500/30 rounded-2xl p-5 flex items-start gap-4">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 border border-emerald-400/40 bg-[#080E15]">
                <Image
                  src="/mascot/lily_head_circle.png"
                  alt="Lily"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white">Lily (Lumi)</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    AI Peer
                  </span>
                </div>
                <div className="text-xs font-bold text-emerald-400">
                  AI Peer & Speaking Coach
                </div>
                <ul className="text-xs text-slate-300 space-y-1 pt-1">
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Home Roadmap Guidance
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Speaking Drill & Intonasi
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live Peer Audio Call
                  </li>
                </ul>
                <p className="text-[11px] text-slate-400 italic pt-1">
                  &ldquo;Kamu pasti bisa! Sedikit demi sedikit, pasti bisa!&rdquo;
                </p>
              </div>
            </div>

            {/* Arthur Card */}
            <div className="bg-[#0B1520] border border-cyan-500/30 rounded-2xl p-5 flex items-start gap-4">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 border border-cyan-400/40 bg-[#080E15]">
                <Image
                  src="/mascot/arthur_head_circle.png"
                  alt="Arthur"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white">Arthur</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Tech Lead
                  </span>
                </div>
                <div className="text-xs font-bold text-cyan-400">
                  Tech Lead & Diagnostic Mentor
                </div>
                <ul className="text-xs text-slate-300 space-y-1 pt-1">
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Weekly Boss Battle (Code Review)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Diagnostic Placement Tests
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Grammar Surgery & Error Analysis
                  </li>
                </ul>
                <p className="text-[11px] text-slate-400 italic pt-1">
                  &ldquo;Teknik yang tepat, membuatmu selangkah lebih maju.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#1A2E40] bg-[#070D13] py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Fluency</span>
            <span>•</span>
            <span>Learn. Practice. Grow.</span>
          </div>
          <div>Your Personal AI Language Companion</div>
          <div className="text-slate-600 text-[11px]">
            &copy; 2026 Fluency Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
