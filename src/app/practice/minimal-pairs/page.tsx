'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import {
  MINIMAL_PAIRS_CATALOG,
  MinimalPair,
  MinimalPairWord,
  getMinimalPairsByCategory,
} from '@/lib/data/minimalPairs';
import {
  speakText,
  speakTurtleMode,
  stopSpeech,
  playBubblePop,
  playCelebrationSound,
} from '@/lib/audio/speech';
import {
  evaluatePronunciation,
  PronunciationResult,
  getPhoneticRepresentation,
} from '@/lib/audio/pronunciation';
import { AcousticSpectrogram } from '@/components/AcousticSpectrogram';
import { EmpatheticFeedbackCard } from '@/components/EmpatheticFeedbackCard';
import { generateEmpatheticFeedback } from '@/lib/audio/empatheticFeedback';
import { ingestSpokenMistake, recordPracticeSession } from '@/lib/core/habitLoop';
import { recordPhonemeObservation } from '@/lib/core/phoneticFingerprint';
import {
  ArrowLeft,
  Volume2,
  Volume1,
  Mic,
  MicOff,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Layers,
  HelpCircle,
  Lightbulb,
  Play,
  Pause,
  Headphones,
} from 'lucide-react';

export default function MinimalPairsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePairId, setActivePairId] = useState<string>(MINIMAL_PAIRS_CATALOG[0].id);
  const [activeTargetWord, setActiveTargetWord] = useState<'A' | 'B'>('A');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [evaluations, setEvaluations] = useState<{
    wordA: PronunciationResult | null;
    wordB: PronunciationResult | null;
  }>({ wordA: null, wordB: null });
  const [isPlayingNative, setIsPlayingNative] = useState<boolean>(false);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  // A/B Self-Playback Recording State
  const [recordedAudioUrls, setRecordedAudioUrls] = useState<{
    wordA: string | null;
    wordB: string | null;
  }>({ wordA: null, wordB: null });
  const [playingUserAudio, setPlayingUserAudio] = useState<'A' | 'B' | null>(null);

  // References
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  const filteredPairs = getMinimalPairsByCategory(selectedCategory);
  const activePair: MinimalPair =
    MINIMAL_PAIRS_CATALOG.find((p) => p.id === activePairId) || MINIMAL_PAIRS_CATALOG[0];

  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      stopSpeech();
      if (userAudioRef.current) {
        userAudioRef.current.pause();
        userAudioRef.current = null;
      }
      if (recordedAudioUrls.wordA) URL.revokeObjectURL(recordedAudioUrls.wordA);
      if (recordedAudioUrls.wordB) URL.revokeObjectURL(recordedAudioUrls.wordB);
    };
  }, [recordedAudioUrls]);

  function stopRecordingCleanup() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
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

  function handleSelectPair(pair: MinimalPair) {
    playBubblePop();
    stopSpeech();
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current = null;
    }
    setPlayingUserAudio(null);
    setRecordedAudioUrls({ wordA: null, wordB: null });
    setActivePairId(pair.id);
    setActiveTargetWord('A');
    setEvaluations({ wordA: null, wordB: null });
    setLiveTranscript('');
    setHasCelebrated(false);
  }

  function handlePlayAudio(wordObj: MinimalPairWord, turtle: boolean = false) {
    playBubblePop();
    stopSpeech();
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      setPlayingUserAudio(null);
    }
    setIsPlayingNative(true);
    const onEnd = () => setIsPlayingNative(false);

    if (turtle) {
      speakTurtleMode(wordObj.word, { emotion: 'pedagogical', onEnd });
    } else {
      speakText(wordObj.sampleSentence, { rate: 0.95, emotion: 'pedagogical', onEnd });
    }
  }

  function handlePlayUserAudio(target: 'A' | 'B') {
    const url = target === 'A' ? recordedAudioUrls.wordA : recordedAudioUrls.wordB;
    if (!url) return;

    stopSpeech();
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      if (playingUserAudio === target) {
        setPlayingUserAudio(null);
        return;
      }
    }

    const audio = new Audio(url);
    userAudioRef.current = audio;
    setPlayingUserAudio(target);

    audio.onended = () => {
      setPlayingUserAudio(null);
    };
    audio.onerror = () => {
      setPlayingUserAudio(null);
    };

    audio.play().catch(() => {
      setPlayingUserAudio(null);
    });
  }

  async function handleToggleRecording(target: 'A' | 'B') {
    playBubblePop();
    setActiveTargetWord(target);

    if (isRecording) {
      stopRecordingCleanup();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      mediaStreamRef.current = stream;

      // 1. MediaRecorder for A/B user playback
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrls((prev) => ({
          ...prev,
          [target === 'A' ? 'wordA' : 'wordB']: url,
        }));
      };

      recorder.start(100);

      // 2. Real-time AudioContext Analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const targetWordObj = target === 'A' ? activePair.wordA : activePair.wordB;
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      setLiveTranscript('');

      const SpeechRec =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (e: any) => {
          let text = '';
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          setLiveTranscript(text);
          if (e.results[0].isFinal) {
            processWordEvaluation(target, targetWordObj, text);
          }
        };

        recognition.onerror = () => {
          stopRecordingCleanup();
          setIsRecording(false);
          // Grace fallback for testing
          processWordEvaluation(target, targetWordObj, targetWordObj.word);
        };

        recognition.onend = () => {
          stopRecordingCleanup();
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        setTimeout(() => {
          stopRecordingCleanup();
          setIsRecording(false);
          processWordEvaluation(target, targetWordObj, targetWordObj.word);
        }, 1500);
      }
    } catch {
      stopRecordingCleanup();
      setIsRecording(false);
    }
  }

  function processWordEvaluation(target: 'A' | 'B', targetWordObj: MinimalPairWord, userTranscript: string) {
    const duration =
      recordingStartTimeRef.current > 0 ? (Date.now() - recordingStartTimeRef.current) / 1000 : undefined;
    const result = evaluatePronunciation(targetWordObj.word, userTranscript, duration);

    setEvaluations((prev) => ({
      ...prev,
      [target === 'A' ? 'wordA' : 'wordB']: result,
    }));

    // Ingest if score < 80%
    if (result.overallScore < 80) {
      ingestSpokenMistake({
        word: targetWordObj.word,
        targetSentence: targetWordObj.sampleSentence,
        ipa: targetWordObj.ipa,
        articulatoryHint: targetWordObj.articulatoryTipId,
      });
      recordPhonemeObservation(activePair.categoryCode, false);
    } else {
      recordPhonemeObservation(activePair.categoryCode, true);
    }

    recordPracticeSession(1, result.overallScore >= 80 ? 25 : 10);

    // If both words are evaluated successfully
    const otherResult = target === 'A' ? evaluations.wordB : evaluations.wordA;
    if (result.overallScore >= 80 && otherResult && otherResult.overallScore >= 80 && !hasCelebrated) {
      playCelebrationSound();
      setHasCelebrated(true);
    }
  }

  const bothCompleted = evaluations.wordA !== null && evaluations.wordB !== null;
  const contrastSuccess =
    bothCompleted &&
    (evaluations.wordA?.overallScore ?? 0) >= 75 &&
    (evaluations.wordB?.overallScore ?? 0) >= 75;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E374D]/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/practice"
                className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition font-bold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Practice Studio</span>
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-400 font-mono font-bold">Minimal Pair Contrast</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Layers className="h-7 w-7 text-cyan-400" />
              <span>Studio Pasangan Minimal (Minimal Pairs)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Teknik fonologi terapan standar emas (Gimson 1980) untuk memutus kebiasaan substitusi bunyi L1 Indonesia
              seperti menukar /θ/ dengan /t/ atau /v/ dengan /f/.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              6 Kontras L1 Kritis
            </span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Semua Kontras' },
            { id: 'theta', label: '/θ/ vs /t/ (Think/Tree)' },
            { id: 'v_f', label: '/v/ vs /f/ (Very/Ferry)' },
            { id: 'vowel_length', label: '/iː/ vs /ɪ/ (Sheep/Ship)' },
            { id: 'eth', label: '/ð/ vs /d/ (They/Day)' },
            { id: 'cluster', label: 'Gugus Konsonan (Ask/As)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playBubblePop();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                  : 'bg-[#0A131C] text-slate-400 border-[#1E374D] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active Contrast Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0C1A27] to-[#08121C] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              Fokus Interferensi Fonetik:
            </span>
            <h2 className="text-lg font-black text-white">{activePair.phonemicContrast}</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{activePair.explanationId}</p>
          </div>

          {/* Skenario Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {filteredPairs.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPair(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  activePairId === p.id
                    ? 'bg-cyan-500 text-black border-cyan-400 font-black shadow-md'
                    : 'bg-[#101C27] text-slate-400 border-[#1E374D] hover:text-white'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Word Cards (Side-by-Side Articulatory Comparison) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD A: WORD A */}
          <div
            className={`p-6 rounded-3xl border transition-all ${
              activeTargetWord === 'A' && isRecording
                ? 'bg-[#0E1E2C] border-cyan-400 ring-2 ring-cyan-400/20 shadow-[0_0_25px_rgba(0,210,255,0.2)]'
                : evaluations.wordA && evaluations.wordA.overallScore >= 80
                ? 'bg-[#0B1A24] border-emerald-500/50'
                : 'bg-[#09121B] border-[#1E374D]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#1E374D] pb-3 mb-4">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10">
                Bunyi Sasaran A (Target 1)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePlayAudio(activePair.wordA, false)}
                  className="px-2.5 py-1 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  title="Dengarkan pengucapan alami 0.95x"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>Native</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePlayAudio(activePair.wordA, true)}
                  className="px-2.5 py-1 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  title="Mode lambat 0.65x"
                >
                  <Volume1 className="h-3 w-3" />
                  <span>0.65x</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">{activePair.wordA.word}</h3>
                  <p className="text-sm text-cyan-400 font-mono font-bold">{activePair.wordA.ipa}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">{activePair.wordA.meaningId}</span>
              </div>

              {/* Tactile Tip Card */}
              <div className="p-3.5 rounded-2xl bg-[#060D15] border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Panduan Lidah &amp; Bibir:</span>
                </span>
                <p className="leading-relaxed">{activePair.wordA.articulatoryTipId}</p>
              </div>

              {/* Sample Sentence */}
              <div className="text-xs text-slate-400 font-serif italic border-l-2 border-cyan-500/40 pl-3 py-1">
                &ldquo;{activePair.wordA.sampleSentence}&rdquo;
              </div>

              {/* Mic & Evaluation Action */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleRecording('A')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    activeTargetWord === 'A' && isRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                  }`}
                >
                  {activeTargetWord === 'A' && isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>{activeTargetWord === 'A' && isRecording ? 'Hentikan Rekam' : `Ucapkan "${activePair.wordA.word}"`}</span>
                </button>

                {evaluations.wordA && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-mono font-black ${
                        evaluations.wordA.overallScore >= 80
                          ? 'text-emerald-400'
                          : evaluations.wordA.overallScore >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {evaluations.wordA.overallScore}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {evaluations.wordA.overallScore >= 80 ? 'Tepat' : 'Perlu Latihan'}
                    </span>
                  </div>
                )}
              </div>

              {/* A/B Audio Comparison for Word A */}
              {recordedAudioUrls.wordA && (
                <div className="p-3 rounded-2xl bg-[#060D15] border border-cyan-500/40 flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-cyan-400" />
                    <span className="text-[11px] font-bold text-slate-200">Bandingkan Suara:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePlayUserAudio('A')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      {playingUserAudio === 'A' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-cyan-300" />}
                      <span>{playingUserAudio === 'A' ? 'Jeda' : 'Suara Saya'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(activePair.wordA, false)}
                      className="px-2 py-1 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-slate-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Native</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CARD B: WORD B */}
          <div
            className={`p-6 rounded-3xl border transition-all ${
              activeTargetWord === 'B' && isRecording
                ? 'bg-[#0E1E2C] border-purple-400 ring-2 ring-purple-400/20 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
                : evaluations.wordB && evaluations.wordB.overallScore >= 80
                ? 'bg-[#0B1A24] border-emerald-500/50'
                : 'bg-[#09121B] border-[#1E374D]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#1E374D] pb-3 mb-4">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-500/10">
                Bunyi Sasaran B (Target 2)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePlayAudio(activePair.wordB, false)}
                  className="px-2.5 py-1 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  title="Dengarkan pengucapan alami 0.95x"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>Native</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePlayAudio(activePair.wordB, true)}
                  className="px-2.5 py-1 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  title="Mode lambat 0.65x"
                >
                  <Volume1 className="h-3 w-3" />
                  <span>0.65x</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">{activePair.wordB.word}</h3>
                  <p className="text-sm text-purple-400 font-mono font-bold">{activePair.wordB.ipa}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">{activePair.wordB.meaningId}</span>
              </div>

              {/* Tactile Tip Card */}
              <div className="p-3.5 rounded-2xl bg-[#060D15] border border-purple-500/20 text-xs text-slate-300 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Panduan Lidah &amp; Bibir:</span>
                </span>
                <p className="leading-relaxed">{activePair.wordB.articulatoryTipId}</p>
              </div>

              {/* Sample Sentence */}
              <div className="text-xs text-slate-400 font-serif italic border-l-2 border-purple-500/40 pl-3 py-1">
                &ldquo;{activePair.wordB.sampleSentence}&rdquo;
              </div>

              {/* Mic & Evaluation Action */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleRecording('B')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    activeTargetWord === 'B' && isRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  }`}
                >
                  {activeTargetWord === 'B' && isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>{activeTargetWord === 'B' && isRecording ? 'Hentikan Rekam' : `Ucapkan "${activePair.wordB.word}"`}</span>
                </button>

                {evaluations.wordB && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-mono font-black ${
                        evaluations.wordB.overallScore >= 80
                          ? 'text-emerald-400'
                          : evaluations.wordB.overallScore >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {evaluations.wordB.overallScore}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {evaluations.wordB.overallScore >= 80 ? 'Tepat' : 'Perlu Latihan'}
                    </span>
                  </div>
                )}
              </div>

              {/* A/B Audio Comparison for Word B */}
              {recordedAudioUrls.wordB && (
                <div className="p-3 rounded-2xl bg-[#060D15] border border-purple-500/40 flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-purple-400" />
                    <span className="text-[11px] font-bold text-slate-200">Bandingkan Suara:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePlayUserAudio('B')}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      {playingUserAudio === 'B' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-purple-300" />}
                      <span>{playingUserAudio === 'B' ? 'Jeda' : 'Suara Saya'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(activePair.wordB, false)}
                      className="px-2 py-1 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-slate-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Native</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acoustic Spectrogram & Live Transcript */}
        <div className="p-4 rounded-2xl bg-[#09121B] border border-[#1E374D] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
              <span>Acoustic Waveform &amp; Spectral Alignment</span>
            </span>
            {liveTranscript && (
              <span className="text-cyan-400 font-mono text-[11px]">
                Terdeteksi: &quot;{liveTranscript}&quot;
              </span>
            )}
          </div>
          <div className="h-20 rounded-xl overflow-hidden bg-[#04080F] border border-[#142433]">
            <AcousticSpectrogram analyserNode={analyserRef.current} isRecording={isRecording} />
          </div>
        </div>

        {/* Overall Contrast Result Card */}
        {bothCompleted && (
          <div
            className={`p-6 rounded-3xl border transition-all ${
              contrastSuccess
                ? 'bg-gradient-to-r from-[#08221B] to-[#0A1A24] border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                : 'bg-[#101924] border-amber-500/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400">
                  Hasil Evaluasi Diskriminasi Kontras Fonetik:
                </span>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  {contrastSuccess ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      <span>Kontras Berhasil! Anda Mampu Membedakan Kedua Fonem dengan Nyata</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6 text-amber-400" />
                      <span>Kontras Masih Mirip — Cermati Letak Ujung Lidah</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {contrastSuccess
                    ? `Luar biasa! Skor "${activePair.wordA.word}" (${evaluations.wordA?.overallScore}%) dan "${activePair.wordB.word}" (${evaluations.wordB?.overallScore}%) membuktikan artikulasi motorik Anda telah terbebas dari kebiasaan substitusi bahasa ibu.`
                    : `Sistem mendeteksi artikulasi salah satu kata masih menyerupai kata pasangannya. Ulangi dengarkan versi 0.65x dan ikuti panduan posisi lidah.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setEvaluations({ wordA: null, wordB: null });
                  setLiveTranscript('');
                }}
                className="px-4 py-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-white text-xs font-bold transition flex items-center gap-2 self-start sm:self-center cursor-pointer border border-[#1E374D]"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                <span>Ulangi Kontras Ini</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
