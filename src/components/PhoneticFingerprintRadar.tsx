'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  calculatePhoneticFingerprint,
  getStoredPhonemicMastery,
  PhonemicCompetency,
} from '@/lib/core/phoneticFingerprint';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';
import { Fingerprint, Sparkles, ArrowRight, ShieldCheck, AlertCircle, Volume2 } from 'lucide-react';
import { speakText, playBubblePop } from '@/lib/audio/speech';

export function PhoneticFingerprintRadar() {
  const [competencies, setCompetencies] = useState<PhonemicCompetency[]>([]);
  const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemicCompetency | null>(null);

  useEffect(() => {
    const stored = getStoredPhonemicMastery();
    const result = calculatePhoneticFingerprint(stored);
    setCompetencies(result);
    if (result.length > 0) {
      setSelectedPhoneme(result[0]);
    }
  }, []);

  if (competencies.length === 0) return null;

  const radarData = competencies.map((c) => ({
    subject: c.symbol,
    fullName: c.nameId,
    mastery: c.masteryPercent,
    status: c.status,
  }));

  function handlePronounceSample(word: string) {
    playBubblePop();
    speakText(word, { rate: 0.9, emotion: 'pedagogical' });
  }

  return (
    <div className="card-cyber p-6 rounded-3xl border border-[#1E374D] bg-[#0E1722] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E374D]/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
              Tahap 7: L1 Phonology
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono text-emerald-400">Interferensi Bahasa Indonesia</span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 mt-1">
            <Fingerprint className="h-5 w-5 text-emerald-400" />
            <span>Sidik Jari Fonetik (Personal Phonetic Fingerprint)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pemetaan penguasaan 6 kelas bunyi bahasa Inggris yang paling kritis bagi penutur Indonesia.
          </p>
        </div>

        <Link
          href="/practice/weakness"
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 self-start sm:self-center"
        >
          <span>Latih Titik Lemah</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* RADAR SPIDER CHART (Cols 1-5) */}
        <div className="lg:col-span-5 h-64 w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="#1E374D" />
              <PolarAngleAxis
                dataKey="subject"
                stroke="#94A3B8"
                tick={{ fill: '#38BDF8', fontSize: 11, fontWeight: 800 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#1E374D"
                tick={{ fill: '#64748B', fontSize: 9 }}
              />
              <Radar
                name="Akurasi Fonem (%)"
                dataKey="mastery"
                stroke="#00E575"
                fill="#00E575"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 6 PHONEME MATRIX TILES (Cols 6-12) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {competencies.map((comp) => {
            const isSelected = selectedPhoneme?.code === comp.code;
            return (
              <button
                key={comp.code}
                type="button"
                onClick={() => {
                  playBubblePop();
                  setSelectedPhoneme(comp);
                }}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                    : 'bg-[#09111A] border-[#1E374D] text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-cyan-300 font-mono">
                    {comp.symbol}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      comp.status === 'Mastered'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : comp.status === 'Developing'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {comp.masteryPercent}%
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-200 line-clamp-1">
                  {comp.nameId}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED PHONEME ARTICULATORY DETAIL CARD */}
      {selectedPhoneme && (
        <div className="p-4 rounded-2xl bg-[#09111A] border border-[#1E374D] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E374D]/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-cyan-300 font-mono">
                {selectedPhoneme.symbol}
              </span>
              <span className="text-xs font-bold text-white">
                {selectedPhoneme.nameId} ({selectedPhoneme.category})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Status:</span>
              <strong
                className={
                  selectedPhoneme.status === 'Mastered'
                    ? 'text-emerald-400'
                    : selectedPhoneme.status === 'Developing'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }
              >
                {selectedPhoneme.status === 'Mastered'
                  ? 'Telah Dikuasai (Stabil)'
                  : selectedPhoneme.status === 'Developing'
                  ? 'Sedang Berkembang'
                  : 'Perlu Penguatan Khusus'}
              </strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            💡 <strong className="text-white">Panduan Artikulasi Lidah &amp; Bibir:</strong> {selectedPhoneme.articulatoryTip}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400">Contoh Kata:</span>
            {selectedPhoneme.sampleWords.map((w, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePronounceSample(w.split(' ')[0])}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-xs font-bold text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
              >
                <Volume2 className="h-3 w-3 text-cyan-400" />
                <span>{w}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1E374D]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              Ingin menembus kebiasaan substitusi fonem <strong className="text-cyan-300">{selectedPhoneme.symbol}</strong>?
            </span>
            <Link
              href="/practice/minimal-pairs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition self-start sm:self-auto"
            >
              <span>Latih di Studio Pasangan Minimal</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

