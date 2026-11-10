'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  detectPitchAutocorrelation,
  generateReferencePitchContour,
  analyzePitchIntonation,
  PitchAnalysisResult,
} from '@/lib/audio/pitchDetection';
import { Activity, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface AcousticPitchContourProps {
  isRecording: boolean;
  analyserNode: AnalyserNode | null;
  targetSentence: string;
  onAnalysisComplete?: (result: PitchAnalysisResult) => void;
  className?: string;
  height?: number;
}

export function AcousticPitchContour({
  isRecording,
  analyserNode,
  targetSentence,
  onAnalysisComplete,
  className = '',
  height = 96,
}: AcousticPitchContourProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recordedPitchesRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [currentHz, setCurrentHz] = useState<number | null>(null);
  const [pitchAnalysis, setPitchAnalysis] = useState<PitchAnalysisResult | null>(null);

  // Generate reference native contour
  const nativeContour = generateReferencePitchContour(targetSentence, 50);

  useEffect(() => {
    if (isRecording) {
      recordedPitchesRef.current = [];
      setPitchAnalysis(null);
      setCurrentHz(null);
    } else if (recordedPitchesRef.current.length > 5) {
      const result = analyzePitchIntonation(recordedPitchesRef.current);
      setPitchAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    }
  }, [isRecording, onAnalysisComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    const buffer = new Float32Array(1024);

    const draw = () => {
      if (!isMounted) return;

      const width = canvas.width;
      const h = canvas.height;

      // Clear Canvas
      ctx.fillStyle = '#070D14';
      ctx.fillRect(0, 0, width, h);

      // Draw subtle grid lines
      ctx.strokeStyle = '#101C27';
      ctx.lineWidth = 1;
      for (let y = 20; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 1. Draw Native Reference Envelope (Amber dashed line)
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const stepX = width / (nativeContour.length - 1);
      nativeContour.forEach((val, idx) => {
        // Map 0.0 - 1.0 to canvas coordinates (inverted Y)
        const x = idx * stepX;
        const y = h - val * (h - 20) - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();

      // 2. Sample live pitch if recording
      if (isRecording && analyserNode) {
        try {
          analyserNode.getFloatTimeDomainData(buffer);
          const sampleRate = analyserNode.context.sampleRate || 44100;
          const detected = detectPitchAutocorrelation(buffer, sampleRate);

          if (detected) {
            recordedPitchesRef.current.push(detected);
            setCurrentHz(detected);
          }
        } catch {
          // Ignore audio buffer read errors
        }
      }

      // 3. Draw User Pitch Contour (Cyan/Emerald curve)
      const userSamples = recordedPitchesRef.current;
      if (userSamples.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#00E575';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(0, 229, 117, 0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const userStepX = width / Math.max(userSamples.length - 1, 1);
        userSamples.forEach((pitch, idx) => {
          const x = idx * userStepX;
          // Normalize pitch between 80Hz and 350Hz
          const norm = Math.max(0, Math.min(1, (pitch - 80) / (350 - 80)));
          const y = h - norm * (h - 24) - 12;

          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, analyserNode, nativeContour]);

  return (
    <div className={`p-4 rounded-2xl bg-[#08121C] border border-[#1E374D] space-y-3 ${className}`}>
      {/* Header and Legend */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            Kontur Nada &amp; Intonasi (F0 Pitch Curve)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-amber-400/90">
            <span className="h-1 w-3 border-t-2 border-dashed border-amber-400 inline-block" />
            <span>Target Native</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1 w-3 bg-emerald-400 inline-block rounded-full" />
            <span>Suara Anda {currentHz ? `(${currentHz} Hz)` : ''}</span>
          </span>
        </div>
      </div>

      {/* Pitch Canvas Visualizer */}
      <div className="relative rounded-xl overflow-hidden border border-[#1E374D]/70 bg-[#070D14]">
        <canvas
          ref={canvasRef}
          width={480}
          height={height}
          className="w-full block"
        />

        {/* Dynamic Frequency Overlay Badge */}
        {isRecording && currentHz && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
            Live: {currentHz} Hz
          </div>
        )}

        {!isRecording && recordedPitchesRef.current.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] text-slate-500 font-medium">
              Bicara untuk melihat perbandingan kurva nada intonasi real-time
            </span>
          </div>
        )}
      </div>

      {/* Post-Recording Intonation Diagnosis */}
      {pitchAnalysis && (
        <div
          className={`p-3 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
            pitchAnalysis.isMonotone
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              {pitchAnalysis.isMonotone ? (
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>
                {pitchAnalysis.isMonotone
                  ? 'Peringatan: Pola Intonasi Terlalu Datar (Monotone)'
                  : 'Variasi Intonasi Dinamis & Alami'}
              </span>
            </span>
            <span className="font-mono text-[11px] text-slate-300">
              Rentang: {pitchAnalysis.pitchRangeHz} Hz • Skor: {pitchAnalysis.dynamicScore}%
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            {pitchAnalysis.diagnosticHint}
          </p>
        </div>
      )}
    </div>
  );
}

