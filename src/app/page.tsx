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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xl shadow-sm">
              F
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">
                Fluenzy
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                AI Adaptive English Coach
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition"
            >
              <Compass className="h-3.5 w-3.5 text-sky-500" />
              <span>Roadmap 50 Stage</span>
            </Link>
            <Link
              href="/teacher"
              className="text-xs font-bold px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition hidden sm:inline-block"
            >
              Portal Guru
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              Buka Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section dengan Maskot Berdiri */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-10 text-center">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto text-center md:text-left">
          {/* Kolom Teks Hero */}
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Sistem Diagnosis Kognitif & Penguasaan Adaptif
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Kuasai Bahasa Inggris dengan{' '}
              <span className="text-emerald-600 dark:text-emerald-400">Pemahaman Titik Lemahmu</span>
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Fluenzy membedakan apakah kesalahanmu sekadar salah ketik (*typo*) atau kekeliruan struktur kalimat (*word order / lexical*), lalu secara dinamis menyesuaikan latihan melalui algoritma *Exponential Moving Average* dan *Kotak Leitner*.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Link
                href="/roadmap"
                className="rounded-2xl bg-sky-500 hover:bg-sky-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <Compass className="h-4 w-4" />
                Mulai Roadmap 50 Stage
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard Kemampuan
              </Link>
              <Link
                href="/learn/lesson-1"
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 px-6 py-3.5 text-sm font-extrabold text-slate-800 dark:text-slate-200 shadow-sm transition active:scale-95 flex items-center gap-2"
              >
                <Brain className="h-4 w-4 text-emerald-600" />
                Sesi Adaptif
              </Link>
            </div>
          </div>

          {/* Kolom Maskot Berdiri Interaktif */}
          <div className="shrink-0 flex justify-center">
            <StandingMascot
              size="lg"
              mood="idle"
              message="Hai! Aku siap menemanimu belajar bahasa Inggris!"
              showSpeechBubble={true}
              canSwitchCharacter={true}
            />
          </div>
        </div>

        {/* 5 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-left pt-6">
          <Link
            href="/roadmap"
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-sky-500 transition group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 mb-3 group-hover:scale-110 transition">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-sky-600">
              Roadmap 50 Stage
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              4 jalur kompetensi: Membaca, Menulis, Mendengar, dan Berbicara dengan milestone piala.
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-emerald-500 transition group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mb-3 group-hover:scale-110 transition">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600">
              Peta Radar Kemampuan
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi radar dan bar chart 5 dimensi skill serta persentase pola kesalahan 30 hari.
            </p>
          </Link>

          <Link
            href="/practice/weakness"
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-amber-500 transition group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 mb-3 group-hover:scale-110 transition">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-600">
              Latihan Titik Lemah
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Latihan terfokus pada 3 skill terlemah tanpa risiko pengurangan hati (*Practice Mode*).
            </p>
          </Link>

          <Link
            href="/mistakes"
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-rose-500 transition group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 mb-3 group-hover:scale-110 transition">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-rose-600">
              Review Kesalahan
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Daftar seluruh soal yang pernah keliru dikelompokkan per skill dan taksonomi kesalahan.
            </p>
          </Link>

          <Link
            href="/research"
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500 transition group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 mb-3 group-hover:scale-110 transition">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
              Data Uji & SUS
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Unduh CSV dataset teranonimkan untuk uji statistik dan formulir System Usability Scale.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <p>© 2026 Fluenzy Platform - Tugas Akhir / Skripsi Sistem Pembelajaran Adaptif</p>
        <p className="mt-1">
          Demo Siswa: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">budi@fluenzy.id</code> | Guru: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">guru@fluenzy.id</code>
        </p>
      </footer>
    </div>
  );
}
