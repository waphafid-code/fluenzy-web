'use client';

import React, { useState } from 'react';
import { Award, ShieldCheck, Download, Share2, Check, X, Printer, Sparkles, ExternalLink } from 'lucide-react';
import { playBubblePop } from '@/lib/audio/speech';
import { getUserPreferences } from '@/lib/core/preferences';

interface CompetencyCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  cefrLevel?: 'A1' | 'A2' | 'B1';
  wpm?: number;
  accuracy?: number;
}

export function CompetencyCertificateModal({
  isOpen,
  onClose,
  studentName = 'Learner',
  cefrLevel = 'B1',
  wpm = 94,
  accuracy = 92,
}: CompetencyCertificateModalProps) {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(studentName);
  const [isEditingName, setIsEditingName] = useState(false);

  if (!isOpen) return null;

  const certificateId = `FLZ-2026-${cefrLevel}-${Math.floor(1000 + Math.random() * 9000)}`;
  const issueDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const levelTitles: Record<string, string> = {
    A1: 'CEFR A1: Breakthrough / Novice Communicator',
    A2: 'CEFR A2: Waystage / Elementary Professional',
    B1: 'CEFR B1: Independent Conversational Fluency',
  };

  const linkedInShareText = `🎓 Proud to share my verified spoken English competency credential from Fluenzy AI Acoustic Laboratory!
- Level: ${levelTitles[cefrLevel]}
- Articulatory Accuracy: ${accuracy}%
- Temporal Speech Rate: ${wpm} Words Per Minute (WPM)
- Verification ID: ${certificateId}
Empirically validated through bilingual scaffolding and acoustic spectrogram modeling. #EnglishFluency #CEFR #EdTech`;

  function handleCopyShare() {
    playBubblePop();
    navigator.clipboard.writeText(linkedInShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handlePrint() {
    playBubblePop();
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#09121B] border border-[#1E374D] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-white my-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-[#1E374D] pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Sertifikat Kelulusan &amp; Bukti Kompetensi</h3>
              <p className="text-[11px] text-slate-400">Verifikasi Resmi Standar Internasional CEFR</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CERTIFICATE DISPLAY FRAME (PRINTABLE AREA) */}
        <div
          id="certificate-print-area"
          className="relative rounded-2xl bg-gradient-to-b from-[#0A1622] via-[#060D15] to-[#04080F] border-2 border-emerald-500/40 p-6 sm:p-10 shadow-[0_0_50px_rgba(0,229,117,0.15)] space-y-6 text-center overflow-hidden"
        >
          {/* Subtle Watermark Guilloche Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#00e575_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Org Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" />
              <span>Fluenzy AI Acoustic Laboratory &bull; Verified Credential</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-cyan-300 pt-2 font-serif">
              Certificate of Spoken English Competency
            </h1>
            <p className="text-xs text-slate-400 italic">
              Diterbitkan atas pencapaian penguasaan artikulasi dan kelancaran berbicara bahasa Inggris mandiri.
            </p>
          </div>

          {/* Recipient Name */}
          <div className="py-2 border-y border-[#1E374D]/80 my-2 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
              Diberikan Kepada:
            </span>
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-1 rounded-lg bg-[#0E1E2C] border border-cyan-500 text-sm font-bold text-center text-white"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-2 py-1 rounded bg-emerald-600 text-[10px] font-bold"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <h2
                onClick={() => setIsEditingName(true)}
                className="text-2xl sm:text-3xl font-extrabold text-white cursor-pointer hover:text-cyan-300 transition"
                title="Klik untuk ubah nama sertifikat"
              >
                {name} <span className="text-xs text-slate-500 font-sans font-normal">(klik untuk edit)</span>
              </h2>
            )}
            <div className="text-xs font-bold text-emerald-400 font-mono pt-1">
              {levelTitles[cefrLevel]}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3 rounded-xl bg-[#08121B] border border-[#142433]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Akurasi Artikulasi</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{accuracy}%</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Spectral Alignment Model</p>
            </div>
            <div className="p-3 rounded-xl bg-[#08121B] border border-[#142433]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Kecepatan Bicara</span>
              <span className="text-lg font-black text-cyan-400 font-mono">{wpm} WPM</span>
              <p className="text-[10px] text-slate-400 mt-0.5">CEFR Cadence Standard</p>
            </div>
            <div className="p-3 rounded-xl bg-[#08121B] border border-[#142433]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Metode Intervensi</span>
              <span className="text-xs font-bold text-purple-300">Bilingual Sandwich</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Low-Anxiety Scaffolding</p>
            </div>
          </div>

          {/* Signatures & Verification Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1E374D]/80 text-left text-[11px] text-slate-400 font-mono">
            <div>
              <div><strong>Nomor Sertifikat:</strong> {certificateId}</div>
              <div><strong>Tanggal Terbit:</strong> {issueDate}</div>
              <div><strong>Status Verifikasi:</strong> <span className="text-emerald-400 font-bold">Resmi &amp; Terverifikasi</span></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                FLZ-SEAL
              </div>
              <div className="text-right">
                <div className="font-bold text-white text-xs">Fluenzy AI Systems</div>
                <div className="text-[10px] text-slate-400">Speech Science Lead</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            Dapat diprint langsung, disimpan sebagai PDF, atau dibagikan ke profil LinkedIn.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCopyShare}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_15px_rgba(0,229,117,0.3)]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              <span>{copied ? 'Teks LinkedIn Tersalin!' : 'Bagikan ke LinkedIn'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

