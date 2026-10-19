'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Volume2, Sparkles, MessageCircle, Heart } from 'lucide-react';
import { speakText, playBubblePop } from '@/lib/audio/speech';

export type MascotMood = 'idle' | 'talking' | 'celebrate' | 'thinking' | 'encouraging';
export type MascotType = 'boy' | 'girl';

interface StandingMascotProps {
  mood?: MascotMood;
  isTalking?: boolean;
  message?: string | null;
  onMascotClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSpeechBubble?: boolean;
  canSwitchCharacter?: boolean;
}

const CHEER_PHRASES = [
  'Awesome job! You got this!',
  "Practice makes perfect! Let's go!",
  'Keep it up! Your streak is on fire!',
  'Belajar setiap hari membuatmu makin lancar!',
  'Great effort! Focus on the next one!',
];

export function StandingMascot({
  mood = 'idle',
  isTalking = false,
  message,
  onMascotClick,
  size = 'md',
  className = '',
  showSpeechBubble = true,
  canSwitchCharacter = true,
}: StandingMascotProps) {
  const [mascotType, setMascotType] = useState<MascotType>('boy');
  const [activeMood, setActiveMood] = useState<MascotMood>(mood);
  const [bubbleText, setBubbleText] = useState<string | null>(message || null);
  const [internalTalking, setInternalTalking] = useState(false);

  // Sinkronisasi mood dari props
  useEffect(() => {
    setActiveMood(mood);
  }, [mood]);

  useEffect(() => {
    if (message !== undefined) {
      setBubbleText(message);
    }
  }, [message]);

  const talkingNow = isTalking || internalTalking;

  // Klik interaksi maskot
  function handleCharacterClick() {
    playBubblePop();
    const randomPhrase = CHEER_PHRASES[Math.floor(Math.random() * CHEER_PHRASES.length)];
    setBubbleText(randomPhrase);
    setInternalTalking(true);
    setActiveMood('celebrate');

    speakText(randomPhrase, {
      rate: 1.0,
      onStart: () => setInternalTalking(true),
      onEnd: () => {
        setInternalTalking(false);
        setActiveMood('idle');
      },
    });

    if (onMascotClick) {
      onMascotClick();
    }
  }

  // Dimensi berdasarkan ukuran
  const sizeClasses = {
    sm: 'w-28 h-40',
    md: 'w-40 h-56 sm:w-48 sm:h-64',
    lg: 'w-52 h-72 sm:w-60 sm:h-80',
  }[size];

  const imageSrc =
    mascotType === 'boy'
      ? '/mascot/mascot_boy_standing_transparent.png'
      : '/mascot/mascot_girl_standing_transparent.png';

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 1. SPEECH BUBBLE INTERAKTIF */}
      {showSpeechBubble && bubbleText && (
        <div
          onClick={() => {
            playBubblePop();
            speakText(bubbleText, {
              rate: 0.95,
              onStart: () => setInternalTalking(true),
              onEnd: () => setInternalTalking(false),
            });
          }}
          className="relative mb-3 max-w-[220px] cursor-pointer rounded-2xl bg-white dark:bg-slate-800 p-3 shadow-lg border-2 border-emerald-400 dark:border-emerald-600 animate-in fade-in zoom-in-95 duration-200 group"
          title="Klik untuk mendengarkan maskot berbicara"
        >
          <div className="flex items-start gap-2">
            <Volume2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
              {bubbleText}
            </p>
          </div>
          {/* Ekor Balon Percakapan */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-emerald-400 dark:border-t-emerald-600" />
          <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[7px] border-x-transparent border-t-[7px] border-t-white dark:border-t-slate-800" />
        </div>
      )}

      {/* 2. AREA STANDING CHARACTER BERDIRI */}
      <div
        onClick={handleCharacterClick}
        className={`relative ${sizeClasses} cursor-pointer group transition-transform duration-300 ${
          activeMood === 'celebrate'
            ? 'animate-bounce'
            : activeMood === 'talking' || talkingNow
            ? 'animate-pulse'
            : 'hover:scale-105 active:scale-95'
        }`}
      >
        {/* Gambar Karakter Berdiri Transparan */}
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt="Fluenzy Standing Character"
            fill
            sizes="(max-width: 768px) 160px, 240px"
            className="object-contain drop-shadow-md transition-all duration-200"
            priority
          />

          {/* EFEK PERAYAAN (SPARKLES & HEARTS) */}
          {activeMood === 'celebrate' && (
            <>
              <div className="absolute -top-3 left-2 animate-ping text-amber-400">
                <Sparkles className="h-6 w-6 fill-amber-400" />
              </div>
              <div className="absolute -top-4 right-4 animate-bounce text-rose-500 delay-100">
                <Heart className="h-5 w-5 fill-rose-500" />
              </div>
            </>
          )}
        </div>

        {/* 3. BAYANGAN PIJAKAN TANAH (GROUND SHADOW) */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3.5 bg-slate-900/15 dark:bg-black/30 rounded-full blur-[2px] -z-10 group-hover:scale-110 transition-transform" />
      </div>

      {/* 4. TOMBOL GANTI KARAKTER (BOY / GIRL) */}
      {canSwitchCharacter && (
        <div className="mt-3 flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-1 shadow-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playBubblePop();
              setMascotType('boy');
              setBubbleText("Hi! I'm Leo! Let's learn!");
            }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition ${
              mascotType === 'boy'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            👦 Leo
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playBubblePop();
              setMascotType('girl');
              setBubbleText("Hello! I'm Maya! Ready?");
            }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition ${
              mascotType === 'girl'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            👧 Maya
          </button>
        </div>
      )}
    </div>
  );
}
