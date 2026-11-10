'use client';

import React, { useState, useEffect } from 'react';
import {
  WarmupItem,
  getDueWarmupItems,
  recordWarmupReviewOutcome,
  getWarmupStats,
} from '@/lib/core/habitLoop';
import {
  speakText,
  speakTurtleMode,
  stopSpeech,
  playBubblePop,
  playCelebrationSound,
} from '@/lib/audio/speech';
import { evaluatePronunciation } from '@/lib/audio/pronunciation';
import {
  Sparkles,
  Volume2,
  Volume1,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  Flame,
  X,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';

interface DailyWarmupBannerProps {
  onWarmupCompleted?: () => void;
}

export function DailyWarmupBanner({ onWarmupCompleted }: DailyWarmupBannerProps) {
  const [dueItems, setDueItems] = useState<WarmupItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [successCelebration, setSuccessCelebration] = useState<boolean>(false);

  useEffect(() => {
    const items = getDueWarmupItems(3);
    setDueItems(items);

    return () => {
      stopSpeech();
    };
  }, []);

  if (isDismissed || dueItems.length === 0) {
    return null;
  }

  const currentItem = dueItems[currentIndex];
  if (!currentItem) return null;

  function handlePlayAudio(turtle: boolean = false) {
    playBubblePop();
    if (turtle) {
      speakTurtleMode(currentItem.word, { emotion: 'pedagogical' });
    } else {
      speakText(currentItem.targetSentence, { rate: 0.95, emotion: 'pedagogical' });
    }
  }

  function handleSimulateOrRecord() {
    playBubblePop();
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setLastScore(null);

    // Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.lang = 'en-US';
        recognition.continuous = false;

        recognition.onresult = (e: any) => {
          const spoken = e.results[0][0].transcript;
          processEvaluation(spoken);
        };
        recognition.onerror = () => {
          setIsRecording(false);
          // Fallback grace simulation if mic fails or denied
          processEvaluation(currentItem.word);
        };
        recognition.onend = () => setIsRecording(false);
        recognition.start();
        return;
      }
    }

    // Fallback if browser speech rec not available
    setTimeout(() => {
      setIsRecording(false);
      processEvaluation(currentItem.word);
    }, 1500);
  }

  function processEvaluation(spoken: string) {
    const result = evaluatePronunciation(currentItem.word, spoken);
    const score = result.overallScore;
    setLastScore(score);

    const isSuccess = score >= 75;
    recordWarmupReviewOutcome(currentItem.id, isSuccess);

    if (isSuccess) {
      playCelebrationSound();
      setSuccessCelebration(true);

      setTimeout(() => {
        setSuccessCelebration(false);
        setLastScore(null);
        if (currentIndex + 1 < dueItems.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setIsDismissed(true);
          onWarmupCompleted?.();
        }
      }, 1800);
    }
  }

  return (
    <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-r from-[#0C1A29] via-[#0E2033] to-[#0A1624] border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.12)] space-y-4 animate-in fade-in slide-in-from-top-3">
      {/* Top Banner Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs">
            <Flame className="h-4 w-4 fill-amber-400 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span>Pemanasan Harian 60 Detik</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Item {currentIndex + 1} dari {dueItems.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pengulangan terjadwal (Leitner Box {currentItem.box}) agar lidahmu rileks sebelum belajar.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setIsDismissed(true);
          }}
          className="text-slate-500 hover:text-slate-300 p-1"
          title="Lewati pemanasan"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Target Word Practice Board */}
      <div className="p-4 rounded-2xl bg-[#070E17] border border-[#1A2E42] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white tracking-wide">
              &quot;{currentItem.word}&quot;
            </span>
            <span className="text-xs font-mono text-cyan-400">{currentItem.ipa}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Box {currentItem.box}
            </span>
          </div>
          <p className="text-xs text-slate-300 italic font-mono">
            &ldquo;{currentItem.targetSentence}&rdquo;
          </p>
          <div className="flex items-start gap-1.5 text-xs text-amber-300/90 pt-1">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>{currentItem.articulatoryHint}</span>
          </div>
        </div>

        {/* Audio Listen & Mic Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handlePlayAudio(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] border border-cyan-500/30 text-cyan-300 text-xs font-bold transition cursor-pointer"
            title="Dengarkan kalimat native"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Contoh</span>
          </button>

          <button
            type="button"
            onClick={() => handlePlayAudio(true)}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] border border-amber-500/30 text-amber-300 text-xs font-bold transition cursor-pointer"
            title="Dengarkan pelan kata ini"
          >
            <Volume1 className="h-3.5 w-3.5" />
            <span>0.65x</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateOrRecord}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition cursor-pointer shadow-md ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : successCelebration
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(0,229,117,0.4)]'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 shadow-[0_0_12px_rgba(0,229,117,0.25)]'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                <span>Mendengarkan...</span>
              </>
            ) : successCelebration ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Naik ke Box {currentItem.box + 1}! 🎉</span>
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" />
                <span>Latih Ucapkan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time score feedback if attempted */}
      {lastScore !== null && !successCelebration && (
        <div className="text-xs text-amber-300 flex items-center justify-between px-2">
          <span>
            Skor: <strong>{lastScore}%</strong> — Hampir tepat! Ulangi sekali lagi dengan posisi lidah sesuai tips di atas.
          </span>
          <button
            type="button"
            onClick={handleSimulateOrRecord}
            className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}
    </div>
  );
}

