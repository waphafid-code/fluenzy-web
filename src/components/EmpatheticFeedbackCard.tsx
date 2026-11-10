'use client';

import React from 'react';
import {
  Sparkles,
  Volume2,
  RotateCcw,
  Lightbulb,
  Heart,
  Award,
  ArrowRight,
  Smile,
} from 'lucide-react';
import { EmpatheticCoachingFeedback } from '@/lib/audio/empatheticFeedback';
import { playBubblePop, speakText } from '@/lib/audio/speech';

interface EmpatheticFeedbackCardProps {
  feedback: EmpatheticCoachingFeedback;
  onRetry: () => void;
}

export function EmpatheticFeedbackCard({
  feedback,
  onRetry,
}: EmpatheticFeedbackCardProps) {
  function handlePlayFeedbackAudio() {
    playBubblePop();
    const speechScript = `${feedback.appreciation} ${feedback.mouthPositionTips.join('. ')}. ${feedback.nextTryChallenge}`;
    speakText(speechScript, {
      lang: 'id-ID',
      rate: 0.95,
      emotion: 'cheerful',
    });
  }

  const isHigh = feedback.score >= 80;
  const isMid = feedback.score >= 60 && feedback.score < 80;

  return (
    <div className="p-5 rounded-2xl bg-[#09131D] border border-cyan-500/40 space-y-4 shadow-[0_0_25px_rgba(0,210,255,0.15)] animate-in fade-in slide-in-from-top-2">
      {/* Top Badge & Score Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E374D] pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
              isHigh
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isMid
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {feedback.score}%
          </div>
          <div>
            <div className="text-xs font-black text-white">{feedback.statusBadge}</div>
            <div className="text-[10px] text-cyan-300 font-mono">{feedback.sandwichSummary}</div>
          </div>
        </div>

        {/* Audio Coach Voice Trigger */}
        <button
          type="button"
          onClick={handlePlayFeedbackAudio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-cyan-400 text-xs font-bold border border-cyan-500/30 transition cursor-pointer"
          title="Dengarkan bimbingan suara Coach dalam bahasa Indonesia"
        >
          <Volume2 className="h-3.5 w-3.5" />
          <span>Dengarkan Evaluasi AI</span>
        </button>
      </div>

      {/* Part 1: Warm Praise & Appreciation */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0F1D2B] border border-[#1E374D]">
        <Heart className="h-4 w-4 text-rose-400 mt-0.5 shrink-0 animate-pulse" />
        <p className="text-xs text-slate-200 leading-relaxed">
          <strong className="text-white">Apresiasi Coach:</strong> {feedback.appreciation}
        </p>
      </div>

      {/* Part 2: Tactile Mouth & Tongue Tips (Zero Jargon) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
          <span>Bimbingan Posisi Bibir &amp; Lidah (Tanpa Rumus Kaku):</span>
        </div>
        <div className="space-y-1.5">
          {feedback.mouthPositionTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed flex items-start gap-2"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Part 3: Low-Friction Re-try Challenge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#1E374D]/70">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{feedback.nextTryChallenge}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onRetry();
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-[0_0_15px_rgba(0,229,117,0.3)] shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Coba Ucapkan Lagi</span>
        </button>
      </div>
    </div>
  );
}

