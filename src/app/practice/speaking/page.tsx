'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { getUserPreferences, getCompanionInfo } from '@/lib/core/preferences';
import {
  speakText,
  speakTurtleMode,
  speakWord,
  playBubblePop,
  playCelebrationSound,
} from '@/lib/audio/speech';
import {
  evaluatePronunciation,
  getPhoneticRepresentation,
  WordScore,
  PronunciationResult,
  PHONETIC_DICTIONARY,
} from '@/lib/audio/pronunciation';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Headphones,
  Sliders,
  Send,
  Zap,
  Award,
  BookOpen,
  X,
  Volume1,
} from 'lucide-react';

// Preset Engineering & Workplace Scenarios
interface SpeakingScenario {
  id: string;
  category: string;
  title: string;
  sentence: string;
  context: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

const PRESET_SCENARIOS: SpeakingScenario[] = [
  {
    id: 'interview-1',
    category: 'Technical Interview',
    title: 'Architecture & Next Steps',
    sentence: 'I would like to discuss the architecture and next steps.',
    context: 'Gunakan frasa ini saat memaparkan roadmap teknis di depan interviewer.',
    difficulty: 'Medium',
  },
  {
    id: 'code-review-1',
    category: 'Code Review',
    title: 'PR Design Trade-offs',
    sentence: 'Could you please explain the trade offs of this approach?',
    context: 'Pertanyaan diplomatis dan profesional untuk meninjau keputusan arsitektur pada Pull Request.',
    difficulty: 'Medium',
  },
  {
    id: 'standup-1',
    category: 'Daily Standup',
    title: 'Sprint Progress Update',
    sentence: 'Yesterday I completed the API integration and today I will write unit tests.',
    context: 'Update harian yang padat dan berbobot dalam sesi Agile standup meeting.',
    difficulty: 'Advanced',
  },
  {
    id: 'incident-1',
    category: 'Incident & Cloud',
    title: 'Performance Bottleneck',
    sentence: 'We detected a performance bottleneck in the production deployment.',
    context: 'Laporan insiden sistem cloud saat latency melonjak di server produksi.',
    difficulty: 'Advanced',
  },
  {
    id: 'networking-1',
    category: 'Collaboration',
    title: 'Expressing Appreciation',
    sentence: 'I really appreciate your assistance with this project.',
    context: 'Membangun relasi profesional dan apresiasi antar anggota tim engineer.',
    difficulty: 'Easy',
  },
];

export default function SpeakingPracticePage() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [activeSentence, setActiveSentence] = useState<string>(PRESET_SCENARIOS[0].sentence);

  // Audio Playback States
  const [isPlayingNative, setIsPlayingNative] = useState<boolean>(false);
  const [isTurtleMode, setIsTurtleMode] = useState<boolean>(false);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState<boolean>(false);

  // Recording & Web Speech States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [waveBars, setWaveBars] = useState<number[]>(Array(16).fill(15));
  const [micError, setMicError] = useState<string | null>(null);

  // Pronunciation Evaluation Result
  const [evaluation, setEvaluation] = useState<PronunciationResult | null>(null);
  const [selectedWordDetail, setSelectedWordDetail] = useState<WordScore | null>(null);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  // References
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const userAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Companion Info
  const [companion, setCompanion] = useState({
    name: 'Arthur',
    role: 'Tech Lead & Diagnostic Mentor',
    avatar: '/mascot/arthur_head_circle.png',
  });

  useEffect(() => {
    const prefs = getUserPreferences();
    const info = getCompanionInfo(prefs.mascot);
    setCompanion(info);

    // Check Speech Recognition support in browser
    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRec) {
        setSpeechSupported(false);
      }
    }

    return () => {
      stopRecordingCleanup();
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, []);

  // Update active sentence when scenario changes
  function handleSelectScenario(index: number) {
    playBubblePop();
    setIsCustomMode(false);
    setSelectedScenarioIndex(index);
    const sent = PRESET_SCENARIOS[index].sentence;
    setActiveSentence(sent);
    resetEvaluation();
  }

  function handleApplyCustomSentence() {
    if (!customInput.trim()) return;
    playBubblePop();
    setIsCustomMode(true);
    setActiveSentence(customInput.trim());
    resetEvaluation();
  }

  function resetEvaluation() {
    setEvaluation(null);
    setLiveTranscript('');
    setSelectedWordDetail(null);
    setHasCelebrated(false);
    setMicError(null);
  }

  // Dual Native Reference Audio
  function handlePlayNativeAudio(turtle: boolean = false) {
    playBubblePop();
    setIsPlayingNative(true);
    setIsTurtleMode(turtle);

    const onEnd = () => setIsPlayingNative(false);

    if (turtle) {
      speakTurtleMode(activeSentence, { onEnd });
    } else {
      speakText(activeSentence, { rate: 0.95, onEnd });
    }
  }

  // Play User's Own Recorded Audio
  function handlePlayUserAudio() {
    if (!recordedAudioUrl) return;
    playBubblePop();

    if (!userAudioElementRef.current) {
      userAudioElementRef.current = new Audio(recordedAudioUrl);
      userAudioElementRef.current.onended = () => setIsPlayingUserAudio(false);
    } else {
      userAudioElementRef.current.src = recordedAudioUrl;
    }

    if (isPlayingUserAudio) {
      userAudioElementRef.current.pause();
      setIsPlayingUserAudio(false);
    } else {
      setIsPlayingUserAudio(true);
      userAudioElementRef.current.play().catch(() => setIsPlayingUserAudio(false));
    }
  }

  // Clean up mic and visualizer resources
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
    analyserRef.current = null;
    setWaveBars(Array(16).fill(15));
  }

  // Start Mic Recording & Real-Time Waveform + Web Speech Recognition
  async function handleToggleRecording() {
    if (isRecording) {
      // STOP RECORDING
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopRecordingCleanup();
      return;
    }

    // START RECORDING
    playBubblePop();
    setMicError(null);
    setLiveTranscript('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      mediaStreamRef.current = stream;

      // 1. MediaRecorder for user audio playback
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
        setRecordedAudioUrl(url);
      };

      recorder.start(100);

      // 2. Real-time AudioContext Analyser for live waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const sourceNode = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        sourceNode.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateWaveform = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Sample 16 bars
          const sampled = Array.from({ length: 16 }, (_, i) => {
            const val = dataArray[i * 2] || 0;
            return Math.max(15, Math.min(100, Math.round((val / 255) * 100)));
          });
          setWaveBars(sampled);
          animationFrameRef.current = requestAnimationFrame(updateWaveform);
        };
        updateWaveform();
      }

      // 3. Web Speech Recognition for Real-time Transcription
      const SpeechRec =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        let accumulatedTranscript = '';

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              accumulatedTranscript += ' ' + event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const full = (accumulatedTranscript + ' ' + interim).trim();
          setLiveTranscript(full);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
        };

        recognition.onend = () => {
          if (accumulatedTranscript.trim()) {
            runEvaluation(accumulatedTranscript.trim());
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setMicError('Izin mikrofon diperlukan untuk merekam suara. Pastikan mikrofon aktif.');
      stopRecordingCleanup();
      setIsRecording(false);
    }
  }

  // Jalankan Evaluasi Pengucapan ELSA
  function runEvaluation(transcript: string) {
    const result = evaluatePronunciation(activeSentence, transcript);
    setEvaluation(result);

    if (result.overallScore >= 80 && !hasCelebrated) {
      playCelebrationSound();
      setHasCelebrated(true);
    } else {
      playBubblePop();
    }
  }

  // Trigger Evaluasi Manual atau Demo Mode
  function handleManualEvaluation() {
    if (liveTranscript.trim()) {
      runEvaluation(liveTranscript.trim());
      return;
    }

    // Demo Mode Simulasi: Mensimulasikan pengucapan dengan 1-2 variasi aksen realistis
    playBubblePop();
    const words = activeSentence.split(' ');
    // Buat variasi aksen realistis pada kata ke-3 atau ke-4
    const simulatedSpoken = words
      .map((w, idx) => {
        const clean = w.replace(/[^a-zA-Z]/g, '');
        if (idx === 2 && clean.length > 4) return clean.slice(0, -1); // Sedikit typo aksen
        if (clean.toLowerCase() === 'discuss') return 'discos';
        if (clean.toLowerCase() === 'next') return 'nex';
        if (clean.toLowerCase() === 'bottleneck') return 'botelnek';
        return clean;
      })
      .join(' ');

    setLiveTranscript(simulatedSpoken);
    runEvaluation(simulatedSpoken);
  }

  // Single Word Audio
  function handlePronounceWord(word: string) {
    speakWord(word);
  }

  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-between pb-24 md:pb-12">
      <Navigation activeTab="arena" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40">
                🎙️
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                100% Free Client-Side AI Coach
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/30">
                ELSA Speak Alternative
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              AI Pronunciation Lab
            </h1>
            <p className="text-sm font-medium text-slate-400 max-w-2xl">
              Dengarkan penutur asli, rekam suara Anda, dapatkan analisis fonem kata demi kata &
              intonasi secara instan tanpa langganan berbayar.
            </p>
          </div>

          {/* Quick Back to Arena Link */}
          <Link
            href="/arena"
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101C27] hover:bg-[#152535] border border-[#1E374D] text-xs font-bold text-slate-300 transition"
          >
            <span>Kembali ke Arena</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* SCENARIO SELECTOR (Engineering Scenarios & Custom Input) */}
        <div className="card-cyber p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Pilih Skenario Percakapan
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {isCustomMode ? 'Mode Kustom' : `${selectedScenarioIndex + 1} / ${PRESET_SCENARIOS.length}`}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {PRESET_SCENARIOS.map((scenario, idx) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleSelectScenario(idx)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  !isCustomMode && selectedScenarioIndex === idx
                    ? 'border-emerald-400 bg-emerald-500/15 text-white shadow-[0_0_15px_rgba(0,229,117,0.2)]'
                    : 'border-[#1E374D] bg-[#0A131C] text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    {scenario.category}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                      scenario.difficulty === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : scenario.difficulty === 'Medium'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {scenario.difficulty}
                  </span>
                </div>
                <div className="text-xs font-bold line-clamp-1">{scenario.title}</div>
              </button>
            ))}
          </div>

          {/* Custom Input Toggle Bar */}
          <div className="pt-2 border-t border-[#1E374D]/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Atau ketik/paste kalimat bahasa Inggris apa pun yang ingin Anda latih..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyCustomSentence();
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-[#0A131C] border border-[#1E374D] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              type="button"
              onClick={handleApplyCustomSentence}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(0,210,255,0.3)]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Gunakan Kalimat Ini</span>
            </button>
          </div>
        </div>

        {/* MAIN INTERACTIVE PRACTICE BENCH */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: PROMPT & WORD-BY-WORD HIGHLIGHTING */}
          <div className="lg:col-span-2 space-y-6">
            {/* Target Card with Word Color-Coding (ELSA Core Feature) */}
            <div className="card-cyber p-6 space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#1E374D] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Target Kalimat
                  </span>
                  {!isCustomMode && (
                    <span className="text-[11px] text-cyan-400 font-mono">
                      ({PRESET_SCENARIOS[selectedScenarioIndex].title})
                    </span>
                  )}
                </div>

                {/* Audio Reference Buttons */}
                <div className="flex items-center gap-2">
                  {/* Native 0.95x */}
                  <button
                    type="button"
                    onClick={() => handlePlayNativeAudio(false)}
                    disabled={isPlayingNative}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-cyan-400 text-xs font-bold border border-cyan-500/30 transition cursor-pointer"
                    title="Dengarkan pengucapan penutur asli kecepatan natural (0.95x)"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Native Audio</span>
                  </button>

                  {/* Turtle Mode 0.65x */}
                  <button
                    type="button"
                    onClick={() => handlePlayNativeAudio(true)}
                    disabled={isPlayingNative}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-amber-400 text-xs font-bold border border-amber-500/30 transition cursor-pointer"
                    title="Turtle mode lambat 0.65x untuk mendengar artikulasi fonem kata demi kata"
                  >
                    <span>🐢</span>
                    <span>0.65x Slow</span>
                  </button>
                </div>
              </div>

              {/* Context Hint */}
              {!isCustomMode && (
                <p className="text-xs text-slate-400 italic">
                  💡 {PRESET_SCENARIOS[selectedScenarioIndex].context}
                </p>
              )}

              {/* WORD DISPLAY (Before & After Evaluation) */}
              <div className="p-6 rounded-2xl bg-[#0A131C] border border-[#1E374D] space-y-4">
                <div className="flex flex-wrap gap-2.5 items-center justify-center sm:justify-start">
                  {evaluation ? (
                    // POST-EVALUATION: Color Coded (Green, Yellow, Red)
                    evaluation.wordScores.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          playBubblePop();
                          setSelectedWordDetail(item);
                        }}
                        className={`group relative flex flex-col items-center px-3 py-2 rounded-xl border text-sm font-bold transition cursor-pointer ${
                          item.status === 'green'
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/25 shadow-[0_0_10px_rgba(0,229,117,0.15)]'
                            : item.status === 'yellow'
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 hover:bg-amber-500/25 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                            : 'bg-rose-500/15 border-rose-500/50 text-rose-300 hover:bg-rose-500/25 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                        }`}
                      >
                        <span className="tracking-wide">{item.word}</span>
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-300">
                          {item.ipa}
                        </span>
                        {/* Score Tag */}
                        <span
                          className={`absolute -top-2 -right-2 text-[9px] px-1 py-0.2 rounded-full font-mono font-bold ${
                            item.status === 'green'
                              ? 'bg-emerald-500 text-slate-950'
                              : item.status === 'yellow'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {item.score}%
                        </span>
                      </button>
                    ))
                  ) : (
                    // PRE-EVALUATION: Neutral Clean Words with IPA
                    activeSentence.split(/\s+/).map((word, idx) => {
                      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
                      const ipa = getPhoneticRepresentation(clean);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePronounceWord(word)}
                          className="flex flex-col items-center px-3 py-2 rounded-xl bg-[#101C27] hover:bg-[#142433] border border-[#1E374D] text-white text-sm font-bold transition cursor-pointer hover:border-cyan-400 group"
                        >
                          <span className="tracking-wide group-hover:text-cyan-300">{word}</span>
                          <span className="text-[10px] font-mono text-slate-400">{ipa}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-[#1E374D]/60 text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span>🟢 80%+ (Native)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span>🟡 60-79% (Hampir Tepat)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span>🔴 &lt;60% (Perlu Latihan)</span>
                  </span>
                  <span className="text-[11px] text-slate-500 ml-auto">
                    *Klik kata untuk dengarkan & lihat tips fonem
                  </span>
                </div>
              </div>

              {/* POP-UP WORD DETAIL (When user clicks any word pill) */}
              {selectedWordDetail && (
                <div className="p-4 rounded-xl bg-[#101C27] border border-cyan-500/40 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePronounceWord(selectedWordDetail.word)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer"
                        title="Dengarkan kata ini"
                      >
                        <Volume1 className="h-4 w-4 fill-slate-950" />
                      </button>
                      <div>
                        <div className="text-base font-black text-white flex items-center gap-2">
                          <span>{selectedWordDetail.word}</span>
                          <span className="font-mono text-xs text-cyan-400">
                            {selectedWordDetail.ipa}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Akurasi fonem: <span className="font-bold text-white">{selectedWordDetail.score}%</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedWordDetail(null)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {selectedWordDetail.feedback ? (
                    <div className="text-xs text-emerald-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      💡 <strong>Tips Artikulasi:</strong> {selectedWordDetail.feedback}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-300 bg-[#0A131C] p-2.5 rounded-lg border border-[#1E374D]">
                      Ucapkan fonem <strong className="font-mono text-cyan-300">{selectedWordDetail.ipa}</strong> dengan artikulasi bibir dan lidah yang rileks.
                    </div>
                  )}
                </div>
              )}

              {/* RECORDING / LIVE VISUALIZER CONSOLE */}
              <div className="p-5 rounded-2xl bg-[#070D14] border border-[#1E374D] flex flex-col items-center justify-center space-y-4">
                {/* Waveform Frequency Bars (Powered by Web Audio AnalyserNode) */}
                <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-sm">
                  {waveBars.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: isRecording ? `${h}%` : '20%' }}
                      className={`w-2 rounded-full transition-all duration-75 ${
                        isRecording
                          ? 'bg-emerald-400 shadow-[0_0_12px_rgba(0,229,117,0.7)]'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Big Mic Button */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.7)] scale-105'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-[0_0_25px_rgba(0,229,117,0.5)] hover:scale-105'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                  </button>
                  <span className="text-xs font-bold text-slate-300">
                    {isRecording ? 'Tekan untuk Berhenti Bicara' : 'Ketuk Mikrofon & Ucapkan Kalimat'}
                  </span>
                </div>

                {/* Real-time Spoken Transcript Display */}
                {liveTranscript && (
                  <div className="w-full p-3 rounded-xl bg-[#0E1722] border border-[#1E374D] text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Terdengar Oleh AI:
                    </span>
                    <p className="text-sm font-mono text-cyan-300">&ldquo;{liveTranscript}&rdquo;</p>
                  </div>
                )}

                {/* Mic Error Prompt */}
                {micError && (
                  <div className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/30">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{micError}</span>
                  </div>
                )}

                {/* Action Row: Evaluate / Demo Fallback */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleManualEvaluation}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(0,229,117,0.3)]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{liveTranscript ? 'Analisis Pengucapan Saya' : '⚡ Coba Simulasi Penilaian (Demo Mode)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetEvaluation}
                    className="px-3.5 py-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* A/B AUDIO COMPARISON BAR (Listen to Your Voice) */}
              {recordedAudioUrl && (
                <div className="p-4 rounded-xl bg-[#101C27] border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                      <Headphones className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        Dengarkan & Bandingkan Suara Anda
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Bandingkan intonasi rekaman Anda dengan penutur asli
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePlayUserAudio}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                    >
                      {isPlayingUserAudio ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-slate-950" />}
                      <span>{isPlayingUserAudio ? 'Jeda Suara Saya' : 'Putar Rekaman Saya'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayNativeAudio(false)}
                      className="px-3 py-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Penutur Asli</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 1 COLUMN: DIAGNOSTIC SCORECARD & COMPANION FEEDBACK */}
          <div className="space-y-6">
            {/* OVERALL SCORECARD */}
            <div className="card-cyber p-6 space-y-5 border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Diagnostic Scorecard
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Award className="h-3 w-3" />
                  <span>ELSA Metric</span>
                </span>
              </div>

              {evaluation ? (
                <div className="space-y-5 animate-in fade-in">
                  {/* Big Circular Score */}
                  <div className="flex items-center justify-center py-2">
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#0A131C] border-4 border-emerald-400 shadow-[0_0_25px_rgba(0,229,117,0.3)]">
                      <div className="text-center">
                        <span className="text-3xl font-black text-white metric-value">
                          {evaluation.overallScore}%
                        </span>
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
                          {evaluation.nativeCadenceTier}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Sub-Metrics (Pronunciation, Fluency, Intonation) */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">🗣️ Pronunciation (Akurasi)</span>
                        <span className="text-emerald-400 font-mono">{evaluation.pronunciationScore}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#101C27] overflow-hidden">
                        <div
                          style={{ width: `${evaluation.pronunciationScore}%` }}
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">🌊 Fluency (Kelancaran)</span>
                        <span className="text-cyan-400 font-mono">{evaluation.fluencyScore}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#101C27] overflow-hidden">
                        <div
                          style={{ width: `${evaluation.fluencyScore}%` }}
                          className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">🎵 Intonation (Ritme)</span>
                        <span className="text-amber-400 font-mono">{evaluation.intonationScore}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#101C27] overflow-hidden">
                        <div
                          style={{ width: `${evaluation.intonationScore}%` }}
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Tips */}
                  <div className="space-y-2 pt-2 border-t border-[#1E374D]">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Rekomendasi Coach:</span>
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {evaluation.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 bg-[#0A131C] p-2.5 rounded-lg border border-[#1E374D]">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-[#0A131C] border border-[#1E374D] text-slate-500">
                    <Mic className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-300">Belum Ada Rekaman</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Rekam suara Anda atau gunakan tombol Simulasi Demo untuk melihat kartu skor
                      lengkap.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* COMPANION MENTOR FEEDBACK CARD */}
            <div className="card-cyber p-5 space-y-4 border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_12px_rgba(0,210,255,0.4)]">
                  <Image
                    src={companion.avatar}
                    alt={companion.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{companion.name}</h3>
                  <p className="text-[11px] text-cyan-400 font-mono">{companion.role}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A131C] border border-[#1E374D] text-xs text-slate-300 leading-relaxed">
                {evaluation ? (
                  evaluation.overallScore >= 80 ? (
                    <span>
                      &ldquo;Luar biasa! Pelafalanmu sudah sangat natural dan siap digunakan dalam
                      meeting teknis nyata. Pertahankan ritmenya!&rdquo;
                    </span>
                  ) : (
                    <span>
                      &ldquo;Bagus sekali usahanya! Coba perhatikan kata-kata berlabel kuning & merah.
                      Dengarkan versi Turtle Mode (0.65x) untuk mendengarkan tiap suku kata.&rdquo;
                    </span>
                  )
                ) : (
                  <span>
                    &ldquo;Halo! Saya {companion.name}. Di lab ini, kita akan melatih otot mulut untuk
                    melafalkan kata teknis bahasa Inggris dengan percaya diri. Ayo coba rekam!&rdquo;
                  </span>
                )}
              </div>

              {evaluation && evaluation.overallScore >= 80 && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">Bonus Latihan Selesai</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">+60 XP</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
