'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import {
  DIAGNOSTIC_PROMPTS,
  DiagnosticPrompt,
  evaluateDiagnosticSession,
  DiagnosticEvaluationResult,
  calculateHakeGain,
  HakeGainResult,
  saveDiagnosticSession,
  getStoredDiagnosticSession,
} from '@/lib/core/diagnostic';
import {
  getUserPreferences,
  saveUserPreferences,
  UserProficiencyTier,
  PROFICIENCY_TIERS,
} from '@/lib/core/preferences';
import {
  speakText,
  speakTurtleMode,
  stopSpeech,
  playBubblePop,
  playCelebrationSound,
} from '@/lib/audio/speech';
import { AcousticSpectrogram } from '@/components/AcousticSpectrogram';
import { EmpatheticFeedbackCard } from '@/components/EmpatheticFeedbackCard';
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
  Award,
  TrendingUp,
  Brain,
  ShieldCheck,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

export default function DiagnosticPlacementPage() {
  const [currentPromptIdx, setCurrentPromptIdx] = useState<number>(0);
  const [submissions, setSubmissions] = useState<
    { promptId: string; userTranscript: string }[]
  >([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] =
    useState<DiagnosticEvaluationResult | null>(null);
  const [existingPretest, setExistingPretest] =
    useState<DiagnosticEvaluationResult | null>(null);
  const [hakeGain, setHakeGain] = useState<HakeGainResult | null>(null);
  const [appliedTierSuccess, setAppliedTierSuccess] = useState<boolean>(false);
  const [saveAsType, setSaveAsType] = useState<'pre' | 'post'>('pre');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Cek apakah user sudah memiliki skor Pre-Test sebelumnya
    const savedPre = getStoredDiagnosticSession('pre');
    if (savedPre) {
      setExistingPretest(savedPre);
      // Jika sudah punya pre-test, tawarkan mode post-test secara default
      setSaveAsType('post');
    }

    return () => {
      stopRecordingCleanup();
      stopSpeech();
    };
  }, []);

  const currentPrompt: DiagnosticPrompt = DIAGNOSTIC_PROMPTS[currentPromptIdx];

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
          setCurrentTranscript(text);
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

  function handlePlayNative(turtle: boolean = false) {
    playBubblePop();
    if (turtle) {
      speakTurtleMode(currentPrompt.targetSentence, { emotion: 'pedagogical' });
    } else {
      speakText(currentPrompt.targetSentence, { rate: 0.95, emotion: 'pedagogical' });
    }
  }

  function handleSimulateSpeech() {
    playBubblePop();
    // Buat respons demo realistis sesuai target kalimat
    const simulated = currentPrompt.targetSentence;
    setCurrentTranscript(simulated);
  }

  function handleNextOrFinish() {
    playBubblePop();
    const effectiveTranscript = currentTranscript.trim() || currentPrompt.targetSentence;

    const nextSubs = [
      ...submissions.filter((s) => s.promptId !== currentPrompt.id),
      {
        promptId: currentPrompt.id,
        userTranscript: effectiveTranscript,
      },
    ];
    setSubmissions(nextSubs);
    setCurrentTranscript('');
    stopRecordingCleanup();
    setIsRecording(false);

    if (currentPromptIdx < DIAGNOSTIC_PROMPTS.length - 1) {
      setCurrentPromptIdx((prev) => prev + 1);
    } else {
      // Evaluasi Akhir Sesi
      const finalResult = evaluateDiagnosticSession(nextSubs);
      setEvaluationResult(finalResult);

      if (saveAsType === 'post' && existingPretest) {
        const gain = calculateHakeGain(existingPretest.overallScore, finalResult.overallScore);
        setHakeGain(gain);
      }

      saveDiagnosticSession(saveAsType, finalResult);
      playCelebrationSound();
    }
  }

  function handleApplyTierToProfile(tier: UserProficiencyTier) {
    playCelebrationSound();
    saveUserPreferences({ proficiencyTier: tier });
    setAppliedTierSuccess(true);
  }

  function handleSaveAs(type: 'pre' | 'post') {
    if (!evaluationResult) return;
    playBubblePop();
    setSaveAsType(type);
    saveDiagnosticSession(type, evaluationResult);

    if (type === 'post' && existingPretest) {
      const gain = calculateHakeGain(existingPretest.overallScore, evaluationResult.overallScore);
      setHakeGain(gain);
    }

    setSavedNotification(
      `Hasil diagnostik berhasil disimpan sebagai ${type === 'pre' ? 'Pre-Test Baseline' : 'Post-Test Efektivitas'}!`
    );
    setTimeout(() => setSavedNotification(null), 4000);
  }

  function handleRestart() {
    playBubblePop();
    setCurrentPromptIdx(0);
    setSubmissions([]);
    setCurrentTranscript('');
    setEvaluationResult(null);
    setHakeGain(null);
    setAppliedTierSuccess(false);
  }

  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-between">
      <Navigation />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
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
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Uji Diagnostik &amp; Penempatan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Brain className="h-7 w-7 text-emerald-400 shrink-0" />
              <span>Tes Diagnostik Fonetik (Pre-Test / Post-Test)</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/research"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Portal Skripsi &amp; SUS</span>
            </Link>
          </div>
        </div>

        {/* NOTIFICATION */}
        {savedNotification && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{savedNotification}</span>
          </div>
        )}

        {/* VIEW 1: PROGRESS WIZARD */}
        {!evaluationResult ? (
          <div className="space-y-6">
            {/* Step Indicators */}
            <div className="flex items-center justify-between gap-2">
              {DIAGNOSTIC_PROMPTS.map((p, idx) => {
                const isCurrent = idx === currentPromptIdx;
                const isCompleted = idx < currentPromptIdx;
                return (
                  <div
                    key={p.id}
                    className={`flex-1 p-2.5 rounded-xl border text-center transition ${
                      isCurrent
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(0,229,117,0.2)]'
                        : isCompleted
                        ? 'bg-[#0E1722] border-emerald-500/50 text-emerald-300'
                        : 'bg-[#09111A] border-[#1E374D] text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase">
                      Butir {idx + 1} ({p.tierTarget})
                    </div>
                    <div className="text-xs font-bold truncate hidden sm:block">{p.title.split(':')[0]}</div>
                  </div>
                );
              })}
            </div>

            {/* Active Card */}
            <div className="card-cyber p-6 rounded-3xl border border-[#1E374D] bg-[#0E1722] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E374D]/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                    Target {currentPrompt.tierTarget}
                  </span>
                  <span className="text-sm font-bold text-white">{currentPrompt.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayNative(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-cyan-400 text-xs font-bold border border-cyan-500/30 transition cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Contoh Native</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayNative(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-amber-400 text-xs font-bold border border-amber-500/30 transition cursor-pointer"
                  >
                    <Volume1 className="h-3.5 w-3.5" />
                    <span>0.65x Slow</span>
                  </button>
                </div>
              </div>

              {/* Target Sentence Box */}
              <div className="p-5 rounded-2xl bg-[#070D14] border border-[#1E374D] text-center space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ucapkan Kalimat Uji Berikut:
                </div>
                <div className="text-lg sm:text-xl font-black text-white leading-relaxed">
                  &ldquo;{currentPrompt.targetSentence}&rdquo;
                </div>
                <div className="text-xs text-amber-300 font-medium pt-1">
                  💡 <strong>Fokus Akustik:</strong> {currentPrompt.phoneticFocus}
                </div>
              </div>

              {/* Context & L1 Interference Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#09111A] border border-[#1E374D] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tujuan Pengujian</span>
                  <p className="text-slate-300 leading-relaxed">{currentPrompt.context}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#09111A] border border-[#1E374D] space-y-1">
                  <span className="text-[10px] font-bold text-rose-400 uppercase">Tantangan Penutur L1 Indonesia</span>
                  <p className="text-slate-300 leading-relaxed">{currentPrompt.l1Challenge}</p>
                </div>
              </div>

              {/* Recording & Spectrogram Console */}
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
                    {isRecording ? 'Mendengarkan ucapanmu...' : 'Ketuk Mic & Mulai Ucapkan'}
                  </span>
                </div>

                {currentTranscript && (
                  <div className="w-full p-3 rounded-xl bg-[#0D1723] border border-cyan-500/30 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Transkrip Ucapan Terdeteksi:
                    </span>
                    <p className="text-sm font-bold text-cyan-300">&ldquo;{currentTranscript}&rdquo;</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSimulateSpeech}
                    className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                  >
                    Simulasi Respons (Demo Mode)
                  </button>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Mulai Ulang</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextOrFinish}
                  className="btn-emerald-pill px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>
                    {currentPromptIdx < DIAGNOSTIC_PROMPTS.length - 1
                      ? 'Lanjut ke Butir Berikutnya'
                      : 'Selesaikan & Hitung Skor Diagnostik'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: FINAL DIAGNOSTIC & HAKE GAIN VERDICT */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="card-cyber p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#0E1D2A] to-[#0A131C] space-y-6">
              {/* Score Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider font-mono">
                  Hasil Evaluasi Diagnostik CEFR
                </div>
                <div className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  {evaluationResult.overallScore}
                  <span className="text-2xl text-slate-400 font-normal"> / 100</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-emerald-300">
                  Rekomendasi Level: CEFR {evaluationResult.calibratedTier} ({PROFICIENCY_TIERS[evaluationResult.calibratedTier].titleId})
                </h2>
                <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                  {evaluationResult.summaryId}
                </p>
              </div>

              {/* Hake Normalized Gain Card if compared with Pre-Test */}
              {hakeGain && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      <span>Uji Efektivitas: Normalized Gain &lt;g&gt; (Hake, 1998)</span>
                    </span>
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
                      g = {hakeGain.gain} ({hakeGain.category} Gain)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-[#070D14]/80 border border-[#1E374D]">
                      <span className="text-[10px] text-slate-400 block">Skor Pre-Test</span>
                      <strong className="text-white text-sm">{hakeGain.preScore}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#070D14]/80 border border-[#1E374D]">
                      <span className="text-[10px] text-slate-400 block">Skor Post-Test</span>
                      <strong className="text-emerald-400 text-sm">{hakeGain.postScore}</strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-[#070D14]/80 border border-[#1E374D]">
                      <span className="text-[10px] text-slate-400 block">Kategori Peningkatan</span>
                      <strong className="text-amber-300 text-sm">{hakeGain.category}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    {hakeGain.explanationId}
                  </p>
                </div>
              )}

              {/* Breakdown per Item */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Rincian Performa Fonetik per Butir Uji:
                </span>
                <div className="space-y-2.5">
                  {evaluationResult.itemResults.map((item, idx) => (
                    <div
                      key={item.promptId}
                      className="p-4 rounded-xl bg-[#09111A] border border-[#1E374D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">Butir {idx + 1} ({item.tierTarget})</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300 italic">&ldquo;{item.targetSentence}&rdquo;</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Ucapan: &ldquo;{item.userTranscript}&rdquo;
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black font-mono text-emerald-400">
                          {item.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions & Next Steps */}
              <div className="pt-4 border-t border-[#1E374D]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSaveAs('pre')}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-xs font-bold text-white border border-[#1E374D] transition cursor-pointer"
                  >
                    Simpan sbg Pre-Test
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAs('post')}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#142433] hover:bg-[#1E374D] text-xs font-bold text-white border border-[#1E374D] transition cursor-pointer"
                  >
                    Simpan sbg Post-Test
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleApplyTierToProfile(evaluationResult.calibratedTier)}
                    disabled={appliedTierSuccess}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-70"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {appliedTierSuccess
                        ? `Level ${evaluationResult.calibratedTier} Telah Diterapkan!`
                        : `Terapkan Level ${evaluationResult.calibratedTier} ke Profil`}
                    </span>
                  </button>
                  <Link
                    href="/practice"
                    className="px-4 py-2.5 rounded-xl bg-[#09111A] hover:bg-[#142433] text-xs font-bold text-slate-300 border border-[#1E374D] transition"
                  >
                    Selesai
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

