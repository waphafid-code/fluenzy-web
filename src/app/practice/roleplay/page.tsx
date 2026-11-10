'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import {
  ROLEPLAY_SCENARIOS,
  RoleplayScenario,
  RoleplayTurn,
  RoleplayHint,
  getRoleplayScenariosByFilter,
  generateCustomRoleplayScenario,
} from '@/lib/data/roleplayScenarios';
import { safeGetStorage, safeSetStorage } from '@/lib/core/storage';
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
  playBubblePop,
  playCelebrationSound,
} from '@/lib/audio/speech';
import {
  evaluatePronunciation,
  getPhoneticRepresentation,
  PronunciationResult,
} from '@/lib/audio/pronunciation';
import { AcousticSpectrogram } from '@/components/AcousticSpectrogram';
import { NeuralVoiceOrb } from '@/components/NeuralVoiceOrb';
import { LottiePlayer } from '@/components/ui/LottiePlayer';
import { generateEmpatheticFeedback } from '@/lib/audio/empatheticFeedback';
import { EmpatheticFeedbackCard } from '@/components/EmpatheticFeedbackCard';
import { ingestSpokenMistake, recordPracticeSession } from '@/lib/core/habitLoop';
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Volume2,
  Volume1,
  Mic,
  MicOff,
  CheckCircle2,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  Award,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flame,
  Zap,
  Plus,
  X,
  Briefcase,
  GraduationCap,
  Compass,
  Lightbulb,
  PhoneCall,
  Radio,
} from 'lucide-react';

function getScenarioIcon(goal: string, className: string = 'h-3.5 w-3.5') {
  switch (goal) {
    case 'career':
      return <Briefcase className={`${className} text-emerald-400`} />;
    case 'academic':
      return <GraduationCap className={`${className} text-indigo-400`} />;
    case 'travel':
      return <Compass className={`${className} text-cyan-400`} />;
    case 'social':
    default:
      return <MessageSquare className={`${className} text-purple-400`} />;
  }
}

export default function RoleplayPracticePage() {
  const [customScenarios, setCustomScenarios] = useState<RoleplayScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    ROLEPLAY_SCENARIOS[0].id
  );
  const [currentTurnIdx, setCurrentTurnIdx] = useState<number>(0);
  const [userTranscripts, setUserTranscripts] = useState<Record<number, string>>({});
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState<boolean>(false);
  const [showAiTranslation, setShowAiTranslation] = useState<boolean>(true);
  const [aiSpeechState, setAiSpeechState] = useState<'idle' | 'speaking'>('idle');
  const [turnEvaluation, setTurnEvaluation] = useState<PronunciationResult | null>(null);
  const [isScenarioFinished, setIsScenarioFinished] = useState<boolean>(false);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);
  const [isHandsFreeLiveCall, setIsHandsFreeLiveCall] = useState<boolean>(false);

  // Custom Scenario Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [customPartnerRole, setCustomPartnerRole] = useState<string>('');
  const [customTier, setCustomTier] = useState<UserProficiencyTier>('B1');

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<any>(null);

  // Load custom scenarios from SafeStorage
  useEffect(() => {
    const saved = safeGetStorage<RoleplayScenario[]>('fluenzy_custom_scenarios', []);
    setCustomScenarios(saved);

    const prefs = getUserPreferences();
    const matching = getRoleplayScenariosByFilter(prefs.goal, prefs.proficiencyTier);
    if (matching.length > 0) {
      setSelectedScenarioId(matching[0].id);
    }

    return () => {
      stopRecordingCleanup();
      stopSpeech();
    };
  }, []);

  const allScenarios = [...customScenarios, ...ROLEPLAY_SCENARIOS];
  const scenario =
    allScenarios.find((s) => s.id === selectedScenarioId) || allScenarios[0];
  const activeTurn: RoleplayTurn = scenario.turns[currentTurnIdx] || scenario.turns[0];

  function handleCreateCustomScenario() {
    if (!customTopic.trim()) return;
    playBubblePop();

    const newScenario = generateCustomRoleplayScenario({
      topic: customTopic,
      interlocutorRole: customPartnerRole || undefined,
      tier: customTier,
    });

    const updated = [newScenario, ...customScenarios];
    setCustomScenarios(updated);
    safeSetStorage('fluenzy_custom_scenarios', updated);

    setSelectedScenarioId(newScenario.id);
    setCurrentTurnIdx(0);
    setUserTranscripts({});
    setIsScenarioFinished(false);
    setIsCustomModalOpen(false);
    setCustomTopic('');
    setCustomPartnerRole('');
  }

  // Auto-play AI prompt on turn change
  useEffect(() => {
    setLiveTranscript('');
    setTurnEvaluation(null);
    setShowHelpDrawer(false);

    // AI greets user with scenario turn prompt
    const timer = setTimeout(() => {
      setAiSpeechState('speaking');
      speakText(activeTurn.aiPrompt, {
        rate: 0.95,
        emotion: 'encouraging',
        onEnd: () => setAiSpeechState('idle'),
      });
    }, 400);

    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [selectedScenarioId, currentTurnIdx]);

  function stopRecordingCleanup() {
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
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  async function handleToggleRecording() {
    playBubblePop();
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

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const SpeechRec =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setLiveTranscript(text);

          // Auto-VAD: jika mode Hands-Free aktif dan pengguna sudah berbicara
          if (isHandsFreeLiveCall && text.trim().length > 3) {
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            silenceTimerRef.current = setTimeout(() => {
              handleEvaluateSpoken(text.trim());
            }, 1400);
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

        recognitionRef.current = recognition;
        recognition.start();
      }

      setIsRecording(true);
    } catch {
      stopRecordingCleanup();
      setIsRecording(false);
    }
  }

  function handlePlayAiVoice(turtle: boolean = false) {
    playBubblePop();
    setAiSpeechState('speaking');
    const onFinished = () => {
      setAiSpeechState('idle');
      if (isHandsFreeLiveCall && !isScenarioFinished) {
        setTimeout(() => {
          handleToggleRecording();
        }, 350);
      }
    };

    if (turtle) {
      speakTurtleMode(activeTurn.aiPrompt, {
        emotion: 'pedagogical',
        onEnd: onFinished,
      });
    } else {
      speakText(activeTurn.aiPrompt, {
        rate: 0.95,
        emotion: 'encouraging',
        onEnd: onFinished,
      });
    }
  }

  function handleUseHint(hint: RoleplayHint) {
    playBubblePop();
    setLiveTranscript(hint.englishText);
    setShowHelpDrawer(false);
  }

  function handleEvaluateSpoken(overrideText?: string) {
    playBubblePop();
    stopRecordingCleanup();
    setIsRecording(false);

    const userText = overrideText || liveTranscript.trim() || activeTurn.hints[0].englishText;
    const targetReference = activeTurn.hints[0].englishText;

    const result = evaluatePronunciation(targetReference, userText);
    setTurnEvaluation(result);

    setUserTranscripts((prev) => ({
      ...prev,
      [currentTurnIdx]: userText,
    }));

    // Ingest red/yellow mistakes into Leitner Warmup queue
    if (result.wordScores && result.wordScores.length > 0) {
      result.wordScores.forEach((ws) => {
        if (ws.status === 'red' || ws.status === 'yellow') {
          const phonetic = getPhoneticRepresentation(ws.word);
          ingestSpokenMistake({
            word: ws.word,
            targetSentence: targetReference,
            ipa: phonetic,
            articulatoryHint:
              ws.feedback || `Latih kembali artikulasi kata "${ws.word}" dalam konteks obrolan ini.`,
          });
        }
      });
    }

    // Record habit progress
    const xp = result.overallScore >= 80 ? 30 : 15;
    recordPracticeSession(2, xp);

    if (result.overallScore >= 80 && !hasCelebrated) {
      playCelebrationSound();
      setHasCelebrated(true);
    }

    // Auto-advance ke giliran berikutnya pada Hands-Free mode jika skor memadai
    if (isHandsFreeLiveCall && result.overallScore >= 60) {
      setTimeout(() => {
        handleProceedToNextTurn();
      }, 1600);
    }
  }

  function handleProceedToNextTurn() {
    playBubblePop();
    stopSpeech();
    if (currentTurnIdx < scenario.turns.length - 1) {
      setCurrentTurnIdx((prev) => prev + 1);
    } else {
      // Scenario Completed!
      setIsScenarioFinished(true);
      playCelebrationSound();
      // Play closing message from AI
      speakText(scenario.closingMessage, { rate: 0.95, emotion: 'encouraging' });
    }
  }

  function handleRestartScenario() {
    playBubblePop();
    stopSpeech();
    setCurrentTurnIdx(0);
    setUserTranscripts({});
    setLiveTranscript('');
    setTurnEvaluation(null);
    setIsScenarioFinished(false);
    setHasCelebrated(false);
  }

  function handleSelectScenario(scId: string) {
    playBubblePop();
    stopSpeech();
    setSelectedScenarioId(scId);
    setCurrentTurnIdx(0);
    setUserTranscripts({});
    setLiveTranscript('');
    setTurnEvaluation(null);
    setIsScenarioFinished(false);
    setHasCelebrated(false);
  }

  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-between pb-12">
      <Navigation />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* HEADER BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E374D] pb-4">
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
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                Tahap 6: Micro-Roleplay Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-emerald-400 shrink-0" />
              <span>Simulasi Obrolan Nyata (Bebas Grogi)</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span className="truncate max-w-[200px]">{scenario.location}</span>
          </div>
        </div>

        {/* SCENARIO SELECTOR CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setIsCustomModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-[0_0_12px_rgba(0,210,255,0.2)]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Buat Skenario Kustom</span>
          </button>

          {allScenarios.map((sc) => {
            const isSelected = sc.id === scenario.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(sc.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(0,229,117,0.25)]'
                    : 'bg-[#0E1722] border-[#1E374D] text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                <span className="p-1 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  {getScenarioIcon(sc.goal, 'h-3.5 w-3.5')}
                </span>
                <span>{sc.title.split(' ')[0]} {sc.title.split(' ')[1]}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-cyan-300">
                  {sc.tier}
                </span>
              </button>
            );
          })}
        </div>

        {!isScenarioFinished ? (
          /* ACTIVE ROLEPLAY DIALOGUE THEATRE */
          <div className="space-y-6">
            {/* Scenario Header Info Card */}
            <div className="card-cyber p-5 rounded-2xl border border-[#1E374D] bg-[#0E1722] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {getScenarioIcon(scenario.goal, 'h-4 w-4')}
                  </span>
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                    Lawan Bicara: {scenario.partnerRole}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">
                    Giliran {currentTurnIdx + 1} dari {scenario.turns.length}
                  </span>
                </div>
                <h2 className="text-base font-black text-white">{scenario.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Misi Percakapan:</strong> {scenario.mission}
                </p>
              </div>

              {/* Progress Pill */}
              <div className="flex items-center gap-1.5 self-start sm:self-center">
                {scenario.turns.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentTurnIdx
                        ? 'w-8 bg-emerald-400'
                        : idx < currentTurnIdx
                        ? 'w-4 bg-emerald-600'
                        : 'w-4 bg-[#1E374D]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* HANDS-FREE LIVE CALL / AUTO-VAD CONTROLLER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#09121B] border border-[#1E374D]">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl border transition ${
                    isHandsFreeLiveCall
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Hands-Free Live Call (Auto-VAD)</span>
                    {isHandsFreeLiveCall ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                        PANGGILAN AKTIF
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        MODE MANUAL
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isHandsFreeLiveCall
                      ? 'Bicara bebas tanpa menyentuh layar. AI otomatis mendeteksi hening dan merespon.'
                      : 'Ketuk ikon mic manual setiap giliran percakapan.'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setIsHandsFreeLiveCall((prev) => !prev);
                }}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  isHandsFreeLiveCall
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(0,229,117,0.3)]'
                    : 'bg-[#142433] hover:bg-[#1E374D] text-slate-300 border-[#1E374D]'
                }`}
              >
                {isHandsFreeLiveCall ? 'Matikan Auto-Call' : 'Aktifkan Hands-Free'}
              </button>
            </div>

            {/* AI SPEAKER THEATRE BOX */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0F1E2C] to-[#0A131C] border border-[#1E374D] space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <NeuralVoiceOrb
                    size={48}
                    state={aiSpeechState === 'speaking' ? 'speaking' : isRecording ? 'listening' : 'idle'}
                    accentColor="#00E575"
                    customLabel={scenario.partnerRole}
                  />
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{scenario.partnerRole}</span>
                      {aiSpeechState === 'speaking' ? (
                        <div className="flex items-center gap-1.5">
                          <LottiePlayer
                            animationPath="/animations/audio_speaker_wave.json"
                            loop={true}
                            className="h-5 w-16"
                          />
                          <span className="text-xs text-emerald-400 font-mono">
                            (Sedang Berbicara...)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">
                          (Menunggu Responmu)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {activeTurn.contextObjective}
                    </div>
                  </div>
                </div>

                {/* AI Audio Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayAiVoice(false)}
                    className="p-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                    title="Dengarkan Ulang Suara AI (0.95x)"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayAiVoice(true)}
                    className="p-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-amber-400 border border-amber-500/30 transition cursor-pointer"
                    title="Dengarkan Mode Pelan (0.65x)"
                  >
                    <Volume1 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* AI Dialogue Bubble */}
              <div className="p-4 rounded-2xl bg-[#070D14]/90 border border-emerald-500/30 space-y-2">
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  &ldquo;{activeTurn.aiPrompt}&rdquo;
                </p>

                {showAiTranslation && (
                  <p className="text-xs text-emerald-300/90 pt-1 border-t border-[#1E374D]/60 flex items-center gap-1.5">
                    <span>Arti: &ldquo;{activeTurn.aiPromptMeaningId}&rdquo;</span>
                  </p>
                )}
              </div>
            </div>

            {/* "HELP ME SAY THIS" SCAFFOLD DRAWER */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setShowHelpDrawer((prev) => !prev);
                }}
                className="w-full p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Bingung mau ngomong apa? Buka Bisikan Bantuan (Help Me Say This)</span>
                </div>
                {showHelpDrawer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showHelpDrawer && (
                <div className="p-4 rounded-2xl bg-[#09121B] border border-amber-500/40 space-y-3 animate-in fade-in duration-200">
                  <div className="text-[11px] font-bold text-slate-300">
                    Pilih salah satu ide respon natural berikut untuk kamu ucapkan:
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {activeTurn.hints.map((hint) => (
                      <div
                        key={hint.id}
                        className="p-3 rounded-xl bg-[#0D1824] border border-[#1E374D] hover:border-amber-400/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-white text-sm">
                            &ldquo;{hint.englishText}&rdquo;
                          </div>
                          <div className="text-slate-400 text-xs">
                            Artinya: {hint.indonesianMeaning}
                          </div>
                          <div className="text-[11px] text-amber-300 font-mono flex items-center gap-1">
                            <Lightbulb className="h-3 w-3 text-amber-400 shrink-0" />
                            <span>{hint.phoneticFocus}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              playBubblePop();
                              speakText(hint.englishText);
                            }}
                            className="p-2 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                            title="Dengarkan Contoh Pengucapan"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUseHint(hint)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
                          >
                            Gunakan Kalimat Ini
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* USER SPEECH RECORDING CONSOLE */}
            <div className="p-5 rounded-3xl bg-[#070D14] border border-[#1E374D] flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-md">
                <AcousticSpectrogram
                  isRecording={isRecording}
                  analyserNode={analyserRef.current}
                  height={44}
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
                <div className="flex items-center gap-2">
                  {isRecording && (
                    <LottiePlayer
                      animationPath="/animations/live_signal_pulse.json"
                      loop={true}
                      className="h-4 w-4"
                    />
                  )}
                  <span className="text-xs font-bold text-slate-300">
                    {isRecording ? 'Mendengarkan ucapanmu...' : 'Ketuk Mic untuk Menjawab Obrolan'}
                  </span>
                </div>
              </div>

              {liveTranscript && (
                <div className="w-full p-4 rounded-2xl bg-[#0A131C] border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold uppercase">Transkrip Ucapanmu:</span>
                    <span className="font-mono text-cyan-400">Live Audio</span>
                  </div>
                  <p className="text-base font-bold text-cyan-300">
                    &ldquo;{liveTranscript}&rdquo;
                  </p>
                </div>
              )}

              {/* Evaluation Result per Turn */}
              {turnEvaluation && (
                <div className="w-full space-y-3 pt-2 border-t border-[#1E374D]/60 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase">
                      Akurasi Pelafalan Giliran Ini:
                    </span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {turnEvaluation.overallScore} / 100
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {turnEvaluation.wordScores.map((item, idx) => (
                      <span
                        key={idx}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          item.status === 'green'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : item.status === 'yellow'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {item.word}
                      </span>
                    ))}
                  </div>

                  {/* Empathetic Coach Feedback for any issues */}
                  <EmpatheticFeedbackCard
                    feedback={generateEmpatheticFeedback({
                      result: turnEvaluation,
                      tier: scenario.tier,
                      goal: scenario.goal,
                      targetSentence: activeTurn.hints[0].englishText,
                      spokenText: liveTranscript,
                    })}
                    onRetry={handleToggleRecording}
                  />
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-between w-full pt-2">
                <button
                  type="button"
                  onClick={handleRestartScenario}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ulang Skenario</span>
                </button>

                {!turnEvaluation ? (
                  <button
                    type="button"
                    onClick={() => handleEvaluateSpoken()}
                    disabled={!liveTranscript.trim()}
                    className="btn-emerald-pill px-6 py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <span>Evaluasi &amp; Balas Obrolan</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleProceedToNextTurn}
                    className="btn-emerald-pill px-6 py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {currentTurnIdx < scenario.turns.length - 1
                        ? 'Lanjut ke Giliran Obrolan Ke-2'
                        : 'Lihat Hasil Akhir Percakapan'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* COMPLETION VIEW: SCENARIO FINISHED */
          <div className="card-cyber p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#0F1E2C] to-[#0A131C] space-y-6 text-center animate-in fade-in duration-300">
            <div className="mx-auto flex flex-col items-center justify-center">
              <LottiePlayer
                animationPath="/animations/achievement_certify.json"
                loop={false}
                className="h-28 w-28 mx-auto -my-2"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-mono">
                Micro-Roleplay Selesai!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Kamu Berhasil Menyelesaikan Percakapan!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                {scenario.closingMessage}
              </p>
            </div>

            {/* Conversation Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {scenario.turns.map((t, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#070D14] border border-[#1E374D] space-y-2"
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Giliran {idx + 1} • {scenario.partnerRole}
                  </div>
                  <div className="text-xs text-emerald-300 italic">
                    &ldquo;{t.aiPrompt}&rdquo;
                  </div>
                  <div className="text-xs font-bold text-white pt-1 border-t border-[#1E374D]/60">
                    Responmu: &ldquo;{userTranscripts[idx] || t.hints[0].englishText}&rdquo;
                  </div>
                </div>
              ))}
            </div>

            {/* Habit XP earned */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>+30 XP Habit Harian &amp; Otomatis Tersimpan ke Leitner Spaced Review</span>
            </div>

            {/* Navigation Actions */}
            <div className="pt-4 border-t border-[#1E374D] flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRestartScenario}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-xs font-bold text-white border border-[#1E374D] transition cursor-pointer"
              >
                Latih Ulang Skenario Ini
              </button>
              <Link
                href="/practice"
                className="w-full sm:w-auto btn-emerald-pill px-6 py-2.5 text-xs font-extrabold transition shadow-lg"
              >
                Kembali ke Studio Latihan
              </Link>
            </div>
          </div>
        )}

        {/* CUSTOM SCENARIO GENERATOR MODAL */}
        {isCustomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg bg-[#09121B] border border-[#1E374D] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-[#1E374D] pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Buat Skenario Latihan Kustom</h3>
                    <p className="text-[11px] text-slate-400">AI akan menyusun simulasi obrolan mikro 2 putaran</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Topik / Situasi yang Ingin Dilatih:
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Contoh: Wawancara kerja di Shopee, Sidang skripsi, Nego sewa kos..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060D15] border border-[#1E374D] focus:border-cyan-400 focus:outline-none text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Peran Lawan Bicara AI (Opsional):
                  </label>
                  <input
                    type="text"
                    value={customPartnerRole}
                    onChange={(e) => setCustomPartnerRole(e.target.value)}
                    placeholder="Contoh: Lead Technical Interviewer, Dosen Penguji, Resepsionis..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060D15] border border-[#1E374D] focus:border-cyan-400 focus:outline-none text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Tingkat Kemampuan (CEFR Tier):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['A1', 'A2', 'B1'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setCustomTier(tier)}
                        className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          customTier === tier
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,210,255,0.2)]'
                            : 'bg-[#060D15] border-[#1E374D] text-slate-400 hover:text-white'
                        }`}
                      >
                        Tier {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E374D]">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!customTopic.trim()}
                  onClick={handleCreateCustomScenario}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                >
                  Buat Skenario Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
