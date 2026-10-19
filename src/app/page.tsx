'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Brain,
  BarChart3,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  ArrowRight,
  Flame,
  Heart,
  CheckCircle2,
  Shield,
  Map,
  Compass,
} from 'lucide-react';
import { StandingMascot } from '@/components/StandingMascot';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-sky-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* AMBIENT COLOR BLOBS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="border-b-2 border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xl shadow-md border-b-2 border-emerald-700">
              F
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">
                Fluenzy
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                AI Adaptive English Coach
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/70 px-3.5 py-2 text-xs font-black text-sky-800 dark:text-sky-200 hover:bg-sky-100 transition shadow-xs"
            >
              <Compass className="h-4 w-4 text-sky-500" />
              <span>Roadmap 50 Stage</span>
            </Link>
            <Link
              href="/teacher"
              className="text-xs font-black px-3.5 py-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden sm:inline-block"
            >
              Portal Guru
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 px-4 py-2 text-xs font-black text-white shadow-md transition"
            >
              Buka Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section dengan Maskot Berdiri */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-10 text-center">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto text-center md:text-left">
          {/* Kolom Teks Hero */}
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-100/90 dark:bg-emerald-950/90 px-4 py-1.5 text-xs font-black text-emerald-950 dark:text-emerald-200 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              Sistem Diagnosis Kognitif & Penguasaan Adaptif
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Kuasai Bahasa Inggris dengan{' '}
              <span className="text-emerald-600 dark:text-emerald-400">Pemahaman Titik Lemahmu</span>
            </h1>
            <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              Fluenzy membedakan apakah kesalahanmu sekadar salah ketik (*typo*) atau kekeliruan struktur kalimat (*word order / lexical*), lalu secara dinamis menyesuaikan latihan melalui algoritma *Exponential Moving Average* dan *Kotak Leitner*.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              <Link
                href="/roadmap"
                className="rounded-2xl bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 active:translate-y-1 active:border-b-0 px-6 py-3.5 text-sm font-black text-white shadow-lg transition flex items-center gap-2"
              >
                <Compass className="h-4 w-4" />
                Mulai Roadmap 50 Stage
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 px-6 py-3.5 text-sm font-black text-white shadow-lg transition flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard Kemampuan
              </Link>
              <Link
                href="/learn/lesson-1"
                className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 border-b-4 border-b-slate-400 dark:border-b-slate-800 hover:border-emerald-500 px-6 py-3.5 text-sm font-black text-slate-800 dark:text-slate-200 shadow-xs transition active:translate-y-1 active:border-b-2 flex items-center gap-2"
              >
                <Brain className="h-4 w-4 text-emerald-600" />
                Sesi Adaptif
              </Link>
            </div>
          </div>

          {/* Kolom Maskot Berdiri Interaktif dengan Stage Pod */}
          <div className="shrink-0 flex justify-center">
            <div className="relative rounded-3xl bg-gradient-to-b from-white via-emerald-50/60 to-white/95 dark:from-slate-800 dark:via-emerald-950/30 dark:to-slate-900 p-6 sm:p-7 border-2 border-emerald-300 dark:border-emerald-800 shadow-xl backdrop-blur-md">
              <StandingMascot
                size="lg"
                mood="idle"
                message="Hai! Aku siap menemanimu belajar bahasa Inggris!"
                showSpeechBubble={true}
                canSwitchCharacter={true}
              />
            </div>
          </div>
        </div>

        {/* 5 Feature Cards Tactile Claymorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-left pt-6">
          <Link
            href="/roadmap"
            className="rounded-3xl border-2 border-b-4 border-slate-200 dark:border-slate-800 hover:border-sky-500 hover:border-b-sky-600 bg-white/95 dark:bg-slate-900/90 p-5 shadow-md transition group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 mb-3 group-hover:scale-110 transition shadow-xs border border-sky-200 dark:border-sky-800">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100 group-hover:text-sky-600">
              Roadmap 50 Stage
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              4 jalur kompetensi: Membaca, Menulis, Mendengar, dan Berbicara dengan milestone piala.
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-3xl border-2 border-b-4 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:border-b-emerald-600 bg-white/95 dark:bg-slate-900/90 p-5 shadow-md transition group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mb-3 group-hover:scale-110 transition shadow-xs border border-emerald-200 dark:border-emerald-800">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600">
              Peta Radar Kemampuan
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Visualisasi radar dan bar chart 5 dimensi skill serta persentase pola kesalahan 30 hari.
            </p>
          </Link>

          <Link
            href="/practice/weakness"
            className="rounded-3xl border-2 border-b-4 border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:border-b-amber-600 bg-white/95 dark:bg-slate-900/90 p-5 shadow-md transition group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 mb-3 group-hover:scale-110 transition shadow-xs border border-amber-200 dark:border-amber-800">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-600">
              Latihan Titik Lemah
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Latihan terfokus pada 3 skill terlemah tanpa risiko pengurangan hati (*Practice Mode*).
            </p>
          </Link>

          <Link
            href="/mistakes"
            className="rounded-3xl border-2 border-b-4 border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:border-b-rose-600 bg-white/95 dark:bg-slate-900/90 p-5 shadow-md transition group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 mb-3 group-hover:scale-110 transition shadow-xs border border-rose-200 dark:border-rose-800">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100 group-hover:text-rose-600">
              Review Kesalahan
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Daftar seluruh soal yang pernah keliru dikelompokkan per skill dan taksonomi kesalahan.
            </p>
          </Link>

          <Link
            href="/research"
            className="rounded-3xl border-2 border-b-4 border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:border-b-indigo-600 bg-white/95 dark:bg-slate-900/90 p-5 shadow-md transition group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 mb-3 group-hover:scale-110 transition shadow-xs border border-indigo-200 dark:border-indigo-800">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
              Data Uji & SUS
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Unduh CSV dataset teranonimkan untuk uji statistik dan formulir System Usability Scale.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 font-semibold bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <p>© 2026 Fluenzy Platform - Tugas Akhir / Skripsi Sistem Pembelajaran Adaptif</p>
        <p className="mt-1">
          Demo Siswa: <code className="bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-300 font-bold">budi@fluenzy.id</code> | Guru: <code className="bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-lg border border-indigo-300 font-bold">guru@fluenzy.id</code>
        </p>
      </footer>
    </div>
  );
}
