'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Swords,
  Heart,
  Gem,
  Mic,
  Headphones,
  FileText,
  PenTool,
  Grid,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Flame,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  Clock,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { LottiePlayer } from '@/components/ui/LottiePlayer';
import {
  playBubblePop,
  playCelebrationSound,
  speakText,
  speakTurtleMode,
  speakLetter,
  speakWord,
} from '@/lib/audio/speech';

export default function ArenaPage() {
  // Mode Active states & simulated interaction
  const [activeDrill, setActiveDrill] = useState<number | null>(null);

  // Speaking Drill State
  const [isRecording, setIsRecording] = useState(false);
  const [speakingFeedback, setSpeakingFeedback] = useState<string | null>(null);

  // Listening Lab State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTurtleMode, setIsTurtleMode] = useState(false);
  const [listeningAnswer, setListeningAnswer] = useState<number | null>(null);

  // Syntax & Writing State
  const [chips, setChips] = useState<string[]>(['We', 'should', 'consider', 'the', 'impact', 'of']);
  const [constructedSentence, setConstructedSentence] = useState<string[]>([]);
  const [syntaxChecked, setSyntaxChecked] = useState(false);

  // Spelling Tiles State
  const spellingTarget = 'DEPLOY';
  const [spellingTiles, setSpellingTiles] = useState<string[]>(['P', 'O', 'Y', 'L', 'D', 'E']);
  const [spelledWord, setSpelledWord] = useState<string[]>([]);

  // Speaking Drill Trigger
  function handleToggleSpeaking() {
    playBubblePop();
    if (!isRecording) {
      setIsRecording(true);
      setSpeakingFeedback(null);
      setTimeout(() => {
        setIsRecording(false);
        setSpeakingFeedback('Pronunciation accuracy: 96% • Intonasi sangat natural!');
        playCelebrationSound();
      }, 2500);
    } else {
      setIsRecording(false);
    }
  }

  // Listening Lab Audio Trigger
  function handlePlayListeningAudio() {
    playBubblePop();
    setIsPlayingAudio(true);
    const textToSpeak =
      'Good morning team. During our pull request review, we must carefully check for code quality and maintainability.';
    if (isTurtleMode) {
      speakTurtleMode(textToSpeak);
    } else {
      speakText(textToSpeak);
    }
    setTimeout(() => setIsPlayingAudio(false), 3500);
  }

  // Syntax Chip Click
  function handleAddChip(word: string, index: number) {
    speakWord(word);
    setConstructedSentence([...constructedSentence, word]);
    const remaining = [...chips];
    remaining.splice(index, 1);
    setChips(remaining);
  }

  function handleResetSyntax() {
    playBubblePop();
    setChips(['We', 'should', 'consider', 'the', 'impact', 'of']);
    setConstructedSentence([]);
    setSyntaxChecked(false);
  }

  // Spelling Tile Click ("Setiap Memilih Huruf Ada Suara AI-nya")
  function handleAddTile(letter: string, index: number) {
    speakLetter(letter);
    const next = [...spelledWord, letter];
    setSpelledWord(next);
    const remaining = [...spellingTiles];
    remaining.splice(index, 1);
    setSpellingTiles(remaining);

    if (next.join('') === spellingTarget) {
      setTimeout(() => {
        speakWord(spellingTarget);
        playCelebrationSound();
      }, 300);
    }
  }

  function handleResetSpelling() {
    playBubblePop();
    setSpellingTiles(['P', 'O', 'Y', 'L', 'D', 'E']);
    setSpelledWord([]);
  }

  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-between pb-24 md:pb-12">
      <Navigation activeTab="arena" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full space-y-8">
        {/* ARENA HEADER (Matching Reference Image 1 Screen 2) */}
        <div className="animate-fade-in-down space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40">
              <Swords className="h-3.5 w-3.5 text-emerald-400" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Pusat Latihan Gamifikasi
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Practice Arena
          </h1>
          <p className="text-sm font-medium text-slate-400">
            Latihan tanpa rasa takut, fokus pada peningkatan!
          </p>
        </div>

        {/* 2 HIGHLIGHT CARDS (Latihan Titik Lemah & Tantangan Harian) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Latihan Titik Lemah */}
          <div className="animate-fade-in-up card-cyber-glow card-hover-lift p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <Heart className="h-6 w-6 fill-rose-500 text-rose-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">Latihan Titik Lemah</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Zero Risk
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fokus perbaiki kelemahanmu hari ini tanpa takut kehilangan nyawa.
                </p>
              </div>
            </div>
            <Link
              href="/practice/weakness"
              onClick={() => playBubblePop()}
              className="btn-neon-pill px-5 py-2.5 text-xs shrink-0"
            >
              Mulai
            </Link>
          </div>

          {/* Tantangan Harian */}
          <div className="animate-fade-in-up card-cyber-cyan card-hover-lift p-5 flex items-center justify-between gap-4" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.3)]">
                <Gem className="h-6 w-6 fill-cyan-400 text-cyan-400 animate-bounce-subtle" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">Tantangan Harian</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    +30 Gems
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selesaikan 3 sesi drill hari ini untuk klaim bonus Gems.
                </p>
              </div>
            </div>
            <Link
              href="/practice/review"
              onClick={() => playBubblePop()}
              className="btn-neon-pill px-5 py-2.5 text-xs shrink-0"
            >
              Mulai
            </Link>
          </div>
        </div>

        {/* 5 MODE DRILL SECTION (Faithfully matching Reference Image 1) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-sm">✦</span>
              <h2 className="text-xl font-black text-white">5 Mode Drill Khusus di Arena</h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Setiap mode punya mekanika unik dan interaktif
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. SPEAKING DRILL */}
            <div className="card-cyber p-5 space-y-4 border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Speaking Drill</h3>
                    <p className="text-xs text-slate-400">Latihan pengucapan & intonasi</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Phonetic AI
                </span>
              </div>

              {/* Target Prompt Box */}
              <div className="p-4 rounded-xl bg-[#0A131C] border border-[#1A2E40] text-center space-y-2">
                <p className="text-xs text-slate-400">Ucapkan kalimat ini dengan intonasi yang tepat:</p>
                <div className="text-lg font-black text-emerald-300 tracking-wide">
                  &ldquo;I&apos;d like to discuss the next steps.&rdquo;
                </div>
                <div className="text-xs text-cyan-400 font-mono">
                  /aɪd laɪk tə dɪˈskʌs ðə nekst steps/
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>Tips: Tekanan pada kata <span className="text-emerald-400 font-bold">&apos;next&apos;</span></span>
                </div>
              </div>

              {/* Animated Waveform & Mic Button */}
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs">
                  {isRecording ? (
                    <LottiePlayer
                      animationPath="/animations/mic_pulse.json"
                      className="w-16 h-16"
                    />
                  ) : (
                    [40, 75, 90, 60, 30, 85, 95, 70, 50, 80, 65, 45, 90, 60].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: '20%' }}
                        className="w-1.5 rounded-full bg-slate-700 transition-all duration-150"
                      />
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleToggleSpeaking}
                  className={`px-6 py-2.5 rounded-full text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                      : 'btn-neon-pill'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                  <span>{isRecording ? 'Mendengarkan...' : 'Hold to Talk'}</span>
                </button>

                {speakingFeedback && (
                  <div className="text-xs font-bold text-emerald-400 animate-in fade-in">
                    {speakingFeedback}
                  </div>
                )}

                {/* Direct Link to Full ELSA Speaking Lab */}
                <Link
                  href="/practice/speaking"
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Buka Full ELSA-Style Speaking Lab (Gratis)</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            </div>

            {/* 2. LISTENING LAB */}
            <div className="card-cyber p-5 space-y-4 border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Listening Lab</h3>
                    <p className="text-xs text-slate-400">Audio + Turtle Mode (0.65x)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    setIsTurtleMode(!isTurtleMode);
                  }}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition cursor-pointer ${
                    isTurtleMode
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-[#142433] text-slate-300 border-[#1A2E40]'
                  }`}
                >
                  Mode Lambat 0.65x {isTurtleMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Waveform Player */}
              <div className="p-4 rounded-xl bg-[#0A131C] border border-[#1A2E40] space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Audio Sample #12</span>
                  <span className="font-mono">1:24 / 2:48</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePlayListeningAudio}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,210,255,0.4)] transition cursor-pointer"
                  >
                    {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-slate-950 ml-0.5" />}
                  </button>
                  <div className="flex-1 flex items-center gap-1 h-8">
                    {isPlayingAudio ? (
                      <div className="w-full flex items-center justify-center">
                        <LottiePlayer
                          animationPath="/animations/audio_speaker_wave.json"
                          className="h-10 w-28"
                        />
                      </div>
                    ) : (
                      [35, 60, 80, 45, 90, 70, 50, 85, 65, 40, 75, 95, 55, 30, 80, 60].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`flex-1 rounded-full ${
                            i < 7 ? 'bg-cyan-400' : 'bg-slate-700'
                          }`}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Comprehension Question */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-white">
                  What is the main topic of the conversation?
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['A job interview', 'A vacation plan', 'A pull request review', 'A school project'].map(
                    (opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          playBubblePop();
                          setListeningAnswer(idx);
                          if (idx === 2) playCelebrationSound();
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          listeningAnswer === idx
                            ? idx === 2
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                              : 'border-rose-400 bg-rose-500/20 text-rose-300'
                            : 'border-[#1A2E40] bg-[#101C27] text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}. {opt}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* 3. READING RFC (Technical Context) */}
            <div className="card-cyber p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Reading RFC</h3>
                    <p className="text-xs text-slate-400">Dokumen & tech article</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Engineering English
                </span>
              </div>

              {/* Pull Request Review Mockup (Matching Reference Image 1) */}
              <div className="p-4 rounded-xl bg-[#0A131C] border border-[#1A2E40] space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-[#1A2E40] pb-2">
                  <span className="font-mono text-emerald-400 font-bold">Pull Request Review</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                    #482 merged
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  A pull request (PR) is a proposal to <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">merge</span> changes from one branch into another. Reviewers check for code quality, security, and performance bottlenecks before approving.
                </p>
                <div className="p-2.5 rounded-lg bg-[#142433] border border-[#1E374D] flex items-center justify-between">
                  <span className="text-slate-400">Vocabulary focus:</span>
                  <span className="text-emerald-400 font-mono font-bold">merge /mɜːdʒ/ : to combine changes</span>
                </div>
              </div>
            </div>

            {/* 4. SYNTAX & WRITING (Grammar Surgery) */}
            <div className="card-cyber p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                    <PenTool className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Syntax & Writing</h3>
                    <p className="text-xs text-slate-400">Susun kalimat & grammar</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Grammar Surgery
                </span>
              </div>

              {/* Interactive Token Construction */}
              <div className="p-4 rounded-xl bg-[#0A131C] border border-[#1A2E40] space-y-3">
                <div className="text-xs text-slate-400">Susun kalimat formal di bawah:</div>

                {/* Dropzone */}
                <div className="min-h-[46px] p-2 rounded-lg bg-[#101C27] border border-dashed border-[#1E374D] flex flex-wrap gap-2 items-center">
                  {constructedSentence.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Ketuk kata di bawah untuk menyusun kalimat...</span>
                  ) : (
                    constructedSentence.map((word, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold animate-in fade-in"
                      >
                        {word}
                      </span>
                    ))
                  )}
                </div>

                {/* Available Chips */}
                <div className="flex flex-wrap gap-2">
                  {chips.map((word, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddChip(word, idx)}
                      className="px-3 py-1.5 rounded-lg bg-[#142433] hover:bg-[#1A2F42] border border-[#1E374D] text-xs font-bold text-white transition cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1A2E40]">
                  <button
                    type="button"
                    onClick={handleResetSyntax}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playCelebrationSound();
                      setSyntaxChecked(true);
                    }}
                    disabled={constructedSentence.length === 0}
                    className="btn-neon-pill px-4 py-1.5 text-xs disabled:opacity-50"
                  >
                    Check
                  </button>
                </div>

                {syntaxChecked && (
                  <div className="text-xs font-bold text-emerald-400 animate-in fade-in">
                    ✓ Benar! &ldquo;{constructedSentence.join(' ')}&rdquo; adalah susunan kalimat formal yang tepat.
                  </div>
                )}
              </div>
            </div>

            {/* 5. SPELLING TILES (Full Width on Bottom) */}
            <div className="card-cyber p-5 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Grid className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Spelling Tiles</h3>
                    <p className="text-xs text-slate-400">Ejaan kata & morfem (Blitz Mode)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Clock className="h-4 w-4" />
                  <span>Blitz Mode (60s)</span>
                </div>
              </div>

              {/* Target Slots */}
              <div className="p-5 rounded-xl bg-[#0A131C] border border-[#1A2E40] flex flex-col items-center justify-center space-y-4 relative">
                {spelledWord.join('') === spellingTarget && (
                  <div className="absolute inset-0 bg-[#0A131C]/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10 animate-fade-in-scale">
                    <LottiePlayer
                      animationPath="/animations/success_check.json"
                      loop={false}
                      className="w-20 h-20"
                    />
                    <span className="text-emerald-400 font-black text-sm tracking-wide">
                      SEMPURNA! &ldquo;DEPLOY&rdquo; BERHASIL DIBUAT
                    </span>
                    <button
                      type="button"
                      onClick={handleResetSpelling}
                      className="mt-2 text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  {spellingTarget.split('').map((_, idx) => (
                    <div
                      key={idx}
                      className="h-12 w-12 rounded-xl bg-[#142433] border-2 border-[#1E374D] flex items-center justify-center text-lg font-black text-white"
                    >
                      {spelledWord[idx] || ''}
                    </div>
                  ))}
                </div>

                {/* Letter Tiles to Click */}
                <div className="flex gap-2.5">
                  {spellingTiles.map((tile, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddTile(tile, idx)}
                      className="h-12 w-12 rounded-xl bg-gradient-to-b from-[#1C3348] to-[#122332] hover:from-cyan-600 hover:to-cyan-700 border-2 border-cyan-400/40 text-cyan-200 text-lg font-black shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                    >
                      {tile}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleResetSpelling}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer pt-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Acak Ulang Huruf
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WEEKLY BOSS BATTLE CARD (Matching Reference Image 1 Screen 2 Bottom) */}
        <div className="card-cyber-glow p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden shrink-0 border-2 border-cyan-400/50 bg-[#080E15]">
              <Image
                src="/mascot/arthur_head_circle.png"
                alt="Arthur Mentor"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                  Weekly Challenge
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Boss Stage
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-0.5">
                Weekly Boss Battle: Surviving The Code Review
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Uji kemampuan berbahasa Inggrismu dalam simulasi perdebatan teknis code review bersama Arthur. Raih +150 XP & Emblem Eksklusif.
              </p>
            </div>
          </div>

          <Link
            href="/roadmap"
            onClick={() => {
              playCelebrationSound();
            }}
            className="btn-neon-pill px-7 py-3 text-xs shrink-0"
          >
            Mulai Boss Battle
          </Link>
        </div>
      </main>
    </div>
  );
}
