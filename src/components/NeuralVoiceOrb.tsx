'use client';

import React from 'react';
import { Mic, Volume2, Cpu, Activity } from 'lucide-react';

export type VoiceOrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface NeuralVoiceOrbProps {
  state?: VoiceOrbState;
  size?: number;
  onTap?: () => void;
  accentColor?: string;
  showStatusBadge?: boolean;
  customLabel?: string;
  className?: string;
  voiceName?: string;
}

export function NeuralVoiceOrb({
  state = 'idle',
  size = 150,
  onTap,
  accentColor,
  showStatusBadge = true,
  customLabel,
  className = '',
  voiceName,
}: NeuralVoiceOrbProps) {
  // Determine effective color & labels
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';

  const defaultColor = isListening
    ? '#EF4444' // Red / Recording
    : isThinking
    ? '#F59E0B' // Amber / Processing
    : isSpeaking
    ? '#10B981' // Emerald / Speaking
    : '#06B6D4'; // Cyan / Idle Standby

  const activeColor = accentColor || defaultColor;

  const statusLabel =
    customLabel ||
    (isListening
      ? 'Mendengarkan ucapanmu...'
      : isThinking
      ? 'Menganalisis fonem AI...'
      : isSpeaking
      ? 'AI sedang berbicara...'
      : 'Ketuk untuk bicara');

  const StatusIcon = isListening
    ? Mic
    : isThinking
    ? Cpu
    : isSpeaking
    ? Volume2
    : Activity;

  return (
    <div
      onClick={onTap}
      className={`relative flex flex-col items-center select-none ${
        onTap ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* 1. ACOUSTIC ORB CONTAINER */}
      <div
        className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105 active:scale-95"
        style={{ width: size + 40, height: size + 40 }}
      >
        {/* A. Sonic Expanding Ripples (Speaking or Listening) */}
        {(isListening || isSpeaking) && (
          <>
            <div
              className="absolute rounded-full border animate-ping pointer-events-none"
              style={{
                width: size + 36,
                height: size + 36,
                borderColor: activeColor,
                opacity: 0.35,
                animationDuration: '1.8s',
              }}
            />
            <div
              className="absolute rounded-full border animate-pulse pointer-events-none"
              style={{
                width: size + 20,
                height: size + 20,
                borderColor: activeColor,
                opacity: 0.45,
                animationDuration: '1.2s',
              }}
            />
          </>
        )}

        {/* B. Rotating Neural Orbit Halo (Thinking or Idle) */}
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-700 ${
            isThinking ? 'animate-spin' : ''
          }`}
          style={{
            width: size + 16,
            height: size + 16,
            background: `conic-gradient(from 0deg, transparent 0%, ${activeColor}55 50%, transparent 100%)`,
            animationDuration: isThinking ? '2s' : '8s',
          }}
        />

        {/* C. Ambient Glow Behind Sphere */}
        <div
          className="absolute rounded-full transition-all duration-500 blur-xl pointer-events-none"
          style={{
            width: size,
            height: size,
            backgroundColor: activeColor,
            opacity: isListening ? 0.45 : isSpeaking ? 0.35 : 0.2,
          }}
        />

        {/* D. Core Metallic Obsidian Sphere */}
        <div
          className="relative rounded-full flex flex-col items-center justify-center overflow-hidden border-2 shadow-2xl transition-all duration-500"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle at 35% 30%, #1E2A4A, #0F172A 60%, #060913 100%)`,
            borderColor: `${activeColor}88`,
            boxShadow: `0 0 35px ${activeColor}33`,
          }}
        >
          {/* Dynamic Equalizer Bars */}
          <div className="flex items-center gap-1.5 h-12">
            {[0.4, 0.8, 1.0, 0.6, 0.3].map((heightScale, idx) => (
              <span
                key={idx}
                className="w-1 rounded-full transition-all duration-200"
                style={{
                  height: isListening
                    ? `${Math.max(14, heightScale * 38)}px`
                    : isSpeaking
                    ? `${Math.max(12, heightScale * 30)}px`
                    : `${Math.max(8, heightScale * 16)}px`,
                  backgroundColor: activeColor,
                  opacity: 0.85,
                  animation:
                    isListening || isSpeaking
                      ? `pulse ${0.6 + idx * 0.15}s ease-in-out infinite alternate`
                      : undefined,
                }}
              />
            ))}
          </div>

          {/* Core Mini Icon Badge */}
          <div
            className="absolute bottom-3 p-1.5 rounded-full border bg-black/60 shadow-inner flex items-center justify-center"
            style={{ borderColor: `${activeColor}66` }}
          >
            <StatusIcon className="w-3.5 h-3.5" style={{ color: activeColor }} />
          </div>
        </div>
      </div>

      {/* 2. STATUS CAPSULE BADGE */}
      {showStatusBadge && (
        <div
          className="mt-2.5 max-w-[220px] px-3.5 py-1.5 rounded-full bg-[#141E3C]/90 backdrop-blur-md border shadow-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
          style={{ borderColor: `${activeColor}55` }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0 shadow-sm"
            style={{
              backgroundColor: activeColor,
              boxShadow: `0 0 6px ${activeColor}`,
            }}
          />
          <span className="text-[11px] font-bold text-slate-200 truncate tracking-wide">
            {statusLabel}
          </span>
        </div>
      )}
    </div>
  );
}

