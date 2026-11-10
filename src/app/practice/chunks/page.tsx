'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { LottiePlayer } from '@/components/ui/LottiePlayer';
import {
  getUserPreferences,
  UserLearningGoal,
  UserProficiencyTier,
  LEARNING_GOALS,
  PROFICIENCY_TIERS,
} from '@/lib/core/preferences';
import {
  speakText,
  speakTurtleMode,
  stopSpeech,
  speakLetter,
  playBubblePop,
  playCelebrationSound,
} from '@/lib/audio/speech';
import {
  evaluatePronunciation,
  getPhoneticRepresentation,
  WordScore,
  PronunciationResult,
} from '@/lib/audio/pronunciation';
import { AcousticSpectrogram } from '@/components/AcousticSpectrogram';
import { generateEmpatheticFeedback } from '@/lib/audio/empatheticFeedback';
import { EmpatheticFeedbackCard } from '@/components/EmpatheticFeedbackCard';
import { ingestSpokenMistake, recordPracticeSession } from '@/lib/core/habitLoop';
import {
  SENTENCE_CHUNKS,
  SentenceChunk,
  assembleChunkSentence,
} from '@/lib/data/sentenceChunks';
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  Volume1,
  Mic,
  MicOff,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Layers,
  ArrowRight,
  Puzzle,
} from 'lucide-react';

export default function SentenceChunksPracticePage() {
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | UserProficiencyTier>('all');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<'all' | UserLearningGoal>('all');
  const [activeChunkId, setActiveChunkId] = useState<string>(SENTENCE_CHUNKS[0].id);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(SENTENCE_CHUNKS[0].defaultSlotId);

  // Audio Playback
  const [isPlayingNative, setIsPlayingNative] = useState<boolean>(false);
  const [isTurtleMode, setIsTurtleMode] = useState<boolean>(false);

  // Recording & Evaluation
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [evaluation, setEvaluation] = useState<PronunciationResult | null>(null);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  // Mic & Visualizer References
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Read saved user preferences on mount
  useEffect(() => {
    const prefs = getUserPreferences();
    if (prefs.proficiencyTier) {
      setSelectedTierFilter(prefs.proficiencyTier);
    }
    if (prefs.goal) {
      setSelectedGoalFilter(prefs.goal);
    }

    const matched =
      SENTENCE_CHUNKS.find((c) => c.tier === prefs.proficiencyTier && c.goal === prefs.goal) ||
      SENTENCE_CHUNKS.find((c) => c.tier === prefs.proficiencyTier) ||
      SENTENCE_CHUNKS[0];

    setActiveChunkId(matched.id);
    setSelectedSlotId(matched.defaultSlotId);

    return () => {
      stopRecordingCleanup();
      stopSpeech();
    };
  }, []);

  const activeChunk =
    SENTENCE_CHUNKS.find((c) => c.id === activeChunkId) || SENTENCE_CHUNKS[0];

  const filteredChunks = SENTENCE_CHUNKS.filter((chunk) => {
    const matchesTier = selectedTierFilter === 'all' || chunk.tier === selectedTierFilter;
    const matchesGoal = selectedGoalFilter === 'all' || chunk.goal === selectedGoalFilter;
    return matchesTier && matchesGoal;
  });

  const { sentence: activeSentence, variation: activeVariation } = assembleChunkSentence(
    activeChunk,
    selectedSlotId
  );

  function handleSelectChunk(chunk: SentenceChunk) {
    playBubblePop();
    setActiveChunkId(chunk.id);
    setSelectedSlotId(chunk.defaultSlotId);
    resetEvaluation();
  }

  function handleSelectVariation(variationId: string) {
    playBubblePop();
    setSelectedSlotId(variationId);
    resetEvaluation();
  }

  function resetEvaluation() {
    setEvaluation(null);
    setLiveTranscript('');
    setHasCelebrated(false);
  }

  function handlePlayNativeAudio(turtle: boolean = false) {
    playBubblePop();
    setIsPlayingNative(true);
    setIsTurtleMode(turtle);

    const onEnd = () => setIsPlayingNative(false);
    if (turtle) {
      speakTurtleMode(activeSentence, { emotion: 'pedagogical', onEnd });
    } else {
      speakText(activeSentence, { rate: 0.95, emotion: 'pedagogical', onEnd });
    }
  }

  function stopRecordingCleanup() {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    analyserRef.current = null;
  }

  async function handleToggleRecording() {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopRecordingCleanup();
      setIsRecording(false);
      return;
    }

    try {
      playBubblePop();
      resetEvaluation();
      setIsRecording(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const SpeechRec =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognitionRef.current = recognition;
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let transcriptText = '';
          for (let i = 0; i < event.results.length; i++) {
            transcriptText += event.results[i][0].transcript;
          }
          setLiveTranscript(transcriptText);

          if (event.results[0].isFinal) {
            processRecordedEvaluation(transcriptText);
          }
        };

        recognition.onerror = () => {
          stopRecordingCleanup();
          setIsRecording(false);
        };

        recognition.onend = () => {
          stopRecordingCleanup();
          setIsRecording(false);
        };

        recognition.start();
      }
    } catch {
      stopRecordingCleanup();
      setIsRecording(false);
    }
  }

  function processRecordedEvaluation(userSpoken: string) {
    if (!userSpoken.trim()) return;
    const result = evaluatePronunciation(activeSentence, userSpoken);
    setEvaluation(result);

    // Otomatis masukkan kata-kata dengan pengucapan yang perlu dilatih ke antrean Leitner
    if (result.wordScores && result.wordScores.length > 0) {
      result.wordScores.forEach((ws) => {
        if (ws.status === 'red' || ws.status === 'yellow') {
          const phonetic = getPhoneticRepresentation(ws.word);
          ingestSpokenMistake({
            word: ws.word,
            targetSentence: activeSentence,
            ipa: phonetic,
            articulatoryHint: ws.feedback || `Latih kembali ritme dan artikulasi kata "${ws.word}" dalam chunk kalimat ini.`,
          });
        }
      });
    }

    // Catat kebiasaan harian (Habit Loop)
    const earnedXp = result.overallScore >= 80 ? 30 : 15;
    recordPracticeSession(2, earnedXp);

    if (result.overallScore >= 80 && !hasCelebrated) {
      setHasCelebrated(true);
      playCelebrationSound();
    }
  }

  return (
    <div className="min-h-screen bg-[#080E15] text-white flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* HEADER BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E374D] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/practice"
                className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Studio Latihan</span>
              </Link>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Tahap 2: Chunking Method
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Puzzle className="h-7 w-7 text-emerald-400 shrink-0" />
              <span>Bank Pola Kalimat (Sentence Chunks)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Kuasai bahasa Inggris lewat <strong>pola kalimat siap pakai</strong>. Ganti kata kunci
              (<em>slot substitution</em>) sesuka hati dan latih bicaramu tanpa pusing rumus grammar!
            </p>
          </div>

          <Link
            href="/practice/speaking"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101C27] hover:bg-[#142433] border border-[#1E374D] text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <span>Ke Skenario Lengkap</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* FILTER BAR: TIER CEFR & LEARNING GOAL */}
        <div className="card-cyber p-5 space-y-4">
          {/* Filter 1: Tier CEFR */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Tingkat Kemahiran (CEFR &amp; Rasio Bimbingan):</span>
              <span className="text-[10px] text-cyan-400 font-mono">Bilingual Sandwich Method</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setSelectedTierFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedTierFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                    : 'bg-[#0A131C] text-slate-400 border-[#1E374D] hover:text-white'
                }`}
              >
                Semua Tingkat ({SENTENCE_CHUNKS.length})
              </button>
              {(['A1', 'A2', 'B1'] as UserProficiencyTier[]).map((tierKey) => {
                const tierMeta = PROFICIENCY_TIERS[tierKey];
                const count = SENTENCE_CHUNKS.filter((c) => c.tier === tierKey).length;
                const isSelected = selectedTierFilter === tierKey;
                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setSelectedTierFilter(tierKey);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? tierKey === 'A1'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(0,229,117,0.25)]'
                          : tierKey === 'A2'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                          : 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                        : 'bg-[#0A131C] text-slate-400 border-[#1E374D] hover:text-white'
                    }`}
                  >
                    <span>{tierMeta.titleId}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      ({tierKey === 'A1' ? '70% ID' : tierKey === 'A2' ? '45% ID' : '20% ID'} • {count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter 2: Learning Goal */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tujuan Pembelajaran:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setSelectedGoalFilter('all');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedGoalFilter === 'all'
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'bg-[#0A131C] text-slate-400 border-[#1E374D] hover:text-white'
                }`}
              >
                Semua Topik
              </button>
              {(Object.keys(LEARNING_GOALS) as UserLearningGoal[]).map((goalKey) => {
                const goalMeta = LEARNING_GOALS[goalKey];
                const isSelected = selectedGoalFilter === goalKey;
                return (
                  <button
                    key={goalKey}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setSelectedGoalFilter(goalKey);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(0,229,117,0.2)]'
                        : 'bg-[#0A131C] text-slate-400 border-[#1E374D] hover:text-white'
                    }`}
                  >
                    <span>{goalMeta.emoji}</span>
                    <span>{goalMeta.titleId}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN PRACTICE BENCH: ASSEMBLE & DRILL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: INTERACTIVE CHUNK ASSEMBLER */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-cyber p-6 space-y-6">
              {/* Pattern Info Badge Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E374D] pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      activeChunk.tier === 'A1'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : activeChunk.tier === 'A2'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    }`}
                  >
                    Tier {activeChunk.tier} • {PROFICIENCY_TIERS[activeChunk.tier]?.titleId}
                  </span>
                  <span className="text-xs font-bold text-white">{activeChunk.patternTitle}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Native Audio 0.95x */}
                  <button
                    type="button"
                    onClick={() => handlePlayNativeAudio(false)}
                    disabled={isPlayingNative}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-cyan-400 text-xs font-bold border border-cyan-500/30 transition cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Native Audio</span>
                  </button>
                  {/* Turtle Audio 0.65x */}
                  <button
                    type="button"
                    onClick={() => handlePlayNativeAudio(true)}
                    disabled={isPlayingNative}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-amber-400 text-xs font-bold border border-amber-500/30 transition cursor-pointer"
                  >
                    <Volume1 className="h-3.5 w-3.5" />
                    <span>0.65x Slow</span>
                  </button>
                </div>
              </div>

              {/* SLOT SUBSTITUTION CHIP SELECTOR (The Core Chunking UX) */}
              <div className="p-4 rounded-2xl bg-[#070D14] border border-[#1E374D] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Pilih Variasi Slot (Bongkar Pasang Kalimat):</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Slot Substitution</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {activeChunk.variations.map((v) => {
                    const isSelected = selectedSlotId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariation(v.id)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(0,229,117,0.25)]'
                            : 'bg-[#0E1722] border-[#1E374D] text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>&quot;{v.slotText}&quot;</span>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">
                          {v.meaningId}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ASSEMBLED SENTENCE DISPLAY */}
              <div className="p-5 rounded-2xl bg-[#0A131C] border border-[#1E374D] space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Hasil Rakitan Kalimat Siap Pakai:
                </div>
                <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                  {evaluation ? (
                    evaluation.wordScores.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center px-3 py-2 rounded-xl border text-sm font-bold ${
                          item.status === 'green'
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                            : item.status === 'yellow'
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                            : 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                        }`}
                      >
                        <span>{item.word}</span>
                        <span className="text-[10px] font-mono text-slate-400">{item.ipa}</span>
                      </div>
                    ))
                  ) : (
                    activeSentence.split(/\s+/).map((word, idx) => {
                      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
                      const ipa = getPhoneticRepresentation(clean);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            playBubblePop();
                            speakText(word);
                          }}
                          className="flex flex-col items-center px-3 py-2 rounded-xl bg-[#101C27] hover:bg-[#142433] border border-[#1E374D] hover:border-cyan-400 text-white text-sm font-bold transition cursor-pointer"
                        >
                          <span>{word}</span>
                          <span className="text-[10px] font-mono text-slate-400">{ipa}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="text-xs text-slate-300 pt-2 border-t border-[#1E374D]/60 flex items-center justify-between">
                  <span>
                    <strong>Artinya:</strong> &quot;{activeChunk.patternMeaningId.replace('{SLOT}', activeVariation.meaningId)}&quot;
                  </span>
                  {activeVariation.phoneticFocus && (
                    <span className="text-[11px] text-amber-400 font-mono italic">
                      💡 {activeVariation.phoneticFocus}
                    </span>
                  )}
                </div>
              </div>

              {/* BILINGUAL PEDAGOGICAL COACH BOX */}
              <div className="p-4 rounded-xl bg-[#08121C] border border-[#1E374D] space-y-2.5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Konteks Situasi &amp; Tips Pedagogis
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Kapan Dipakai:</strong> {activeChunk.contextSituationId}
                </p>
                <p className="text-xs text-emerald-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 leading-relaxed">
                  <strong className="text-white">Tips Native:</strong> {activeChunk.pedagogicalTipId}
                </p>
              </div>

              {/* RECORDING CONSOLE */}
              <div className="p-5 rounded-2xl bg-[#070D14] border border-[#1E374D] flex flex-col items-center justify-center space-y-4">
                <div className="w-full max-w-md">
                  <AcousticSpectrogram
                    isRecording={isRecording}
                    analyserNode={analyserRef.current}
                    height={48}
                    accentColor="#00E575"
                  />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`h-16 w-16 rounded-full flex items-center justify-center transition cursor-pointer shadow-lg active:scale-95 ${
                      isRecording
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-[0_0_25px_rgba(244,63,94,0.5)]'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(0,229,117,0.4)]'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7 stroke-[2.5]" />}
                  </button>
                  <span className="text-xs font-bold text-slate-300">
                    {isRecording ? 'Mendengarkan ucapanmu...' : 'Ketuk Mic untuk Latih Ucapkan'}
                  </span>
                </div>

                {liveTranscript && (
                  <div className="text-xs text-cyan-300 font-mono bg-[#0A131C] px-3 py-1.5 rounded-lg border border-cyan-500/30">
                    Terdeteksi: &quot;{liveTranscript}&quot;
                  </div>
                )}

                {evaluation && (
                  <div className="w-full pt-2">
                    <EmpatheticFeedbackCard
                      feedback={generateEmpatheticFeedback({
                        result: evaluation,
                        tier: activeChunk.tier,
                        goal: activeChunk.goal,
                        targetSentence: activeSentence,
                        spokenText: liveTranscript,
                      })}
                      onRetry={handleToggleRecording}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: CHUNK PATTERN SELECTOR LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>Koleksi Pola Kalimat ({filteredChunks.length})</span>
              </span>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredChunks.map((chunk) => {
                const isSelected = activeChunkId === chunk.id;
                return (
                  <button
                    key={chunk.id}
                    type="button"
                    onClick={() => handleSelectChunk(chunk)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-[0_0_15px_rgba(0,229,117,0.2)]'
                        : 'bg-[#0C1622] border-[#1E374D] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            chunk.tier === 'A1'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : chunk.tier === 'A2'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          {chunk.tier}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-[120px]">
                          {chunk.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {chunk.variations.length} Variasi
                      </span>
                    </div>

                    <div className="text-xs font-black text-white line-clamp-1">{chunk.patternTitle}</div>
                    <div className="text-[11px] text-slate-300 font-mono italic line-clamp-1">
                      &quot;{chunk.patternTemplate}&quot;
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

