'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  speakWord,
  speakLetter,
  stopSpeech,
  playBubblePop,
  playCelebrationSound,
} from '@/lib/audio/speech';
import {
  evaluatePronunciation,
  getPhoneticRepresentation,
  detectCriticalPhonemeIssues,
  getWordStressGuidance,
  WordScore,
  PronunciationResult,
  PhonemeIssue,
  PHONETIC_DICTIONARY,
} from '@/lib/audio/pronunciation';
import { AcousticSpectrogram } from '@/components/AcousticSpectrogram';
import { AcousticPitchContour } from '@/components/AcousticPitchContour';
import { generateEmpatheticFeedback } from '@/lib/audio/empatheticFeedback';
import { EmpatheticFeedbackCard } from '@/components/EmpatheticFeedbackCard';
import { ingestSpokenMistake, recordPracticeSession } from '@/lib/core/habitLoop';
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
  Lightbulb,
  Activity,
  Music,
  Target,
} from 'lucide-react';

// Skenario Pembelajaran Berjenjang A1, A2, B1 dengan Kolaborasi Bilingual
interface SpeakingScenario {
  id: string;
  tier: UserProficiencyTier;
  goal: UserLearningGoal;
  category: string;
  title: string;
  sentence: string;
  context: string;
  phoneticFocus: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

const PRESET_SCENARIOS: SpeakingScenario[] = [
  // --- TIER A1: PEMULA DASAR (Bimbingan Santai 70% ID / 30% EN) ---
  {
    id: 'a1-social-1',
    tier: 'A1',
    goal: 'social',
    category: 'Percakapan Santai',
    title: 'Salam & Perkenalan Diri',
    sentence: 'Hi, my name is Alex and I am learning English.',
    context: 'Gunakan saat memperkenalkan diri santai ke teman baru atau komunitas internasional.',
    phoneticFocus: 'Vokal /ɜː/ pada "learning" dibaca rileks, dan desis lembut /ʃ/ pada "English".',
    difficulty: 'Easy',
  },
  {
    id: 'a1-travel-1',
    tier: 'A1',
    goal: 'travel',
    category: 'Wisata & Kafe',
    title: 'Pesan Kopi di Kafe',
    sentence: 'Can I have an iced latte, please?',
    context: 'Frasa survival paling sering dipakai saat mampir ke coffee shop di luar negeri.',
    phoneticFocus: 'Kata "have" berakhiran bunyi /v/ lembut (gigi atas menyentuh bibir bawah).',
    difficulty: 'Easy',
  },
  {
    id: 'a1-travel-2',
    tier: 'A1',
    goal: 'travel',
    category: 'Arah & Navigasi',
    title: 'Tanya Arah Stasiun',
    sentence: 'Excuse me, where is the nearest station?',
    context: 'Kalimat penting saat mencari stasiun kereta atau halte terdekat.',
    phoneticFocus: 'Awali dengan "Excuse me" /ɪkˈskjuːz miː/ dengan intonasi sopan meninggi.',
    difficulty: 'Easy',
  },
  {
    id: 'a1-career-1',
    tier: 'A1',
    goal: 'career',
    category: 'Karir & Profesi',
    title: 'Status Pekerjaan Saya',
    sentence: 'I work as a software developer in Jakarta.',
    context: 'Jawaban singkat dan padat saat ditanya "What do you do?" pada perkenalan awal.',
    phoneticFocus: 'Kata "work" /wɜːrk/ jangan tertukar dengan "walk". Tekanan di "de-VEL-o-per".',
    difficulty: 'Easy',
  },
  {
    id: 'a1-academic-1',
    tier: 'A1',
    goal: 'academic',
    category: 'Kuliah & Dosen',
    title: 'Salam Sopan ke Dosen',
    sentence: 'Good morning professor, thank you for your time.',
    context: 'Membuka percakapan santun saat menemui dosen pembimbing atau pengajar.',
    phoneticFocus: 'Kata "thank" diawali fonem /θ/, gigit ujung lidah sedikit, jangan dibaca "tenk".',
    difficulty: 'Easy',
  },

  // --- TIER A2: MENENGAH AWAL (Bimbingan Praktis 45% ID / 55% EN) ---
  {
    id: 'a2-career-1',
    tier: 'A2',
    goal: 'career',
    category: 'Daily Standup',
    title: 'Sprint Daily Standup',
    sentence: 'Yesterday I completed the API integration and today I will write unit tests.',
    context: 'Update harian yang padat dan berbobot dalam sesi Agile standup meeting tim engineer.',
    phoneticFocus: 'Akhiran "-ed" pada "completed" dibaca /ɪd/, dan akhiran "-sts" pada "tests" jangan hilang.',
    difficulty: 'Medium',
  },
  {
    id: 'a2-career-2',
    tier: 'A2',
    goal: 'career',
    category: 'Kolaborasi Tim',
    title: 'Permintaan Review Code PR',
    sentence: 'Could you please review my pull request when you have time?',
    context: 'Mengajak rekan kerja meninjau hasil kode di GitHub/GitLab tanpa terkesan menuntut.',
    phoneticFocus: 'Huruf "l" pada "could" /kʊd/ adalah silent letter (tidak dibaca).',
    difficulty: 'Medium',
  },
  {
    id: 'a2-travel-1',
    tier: 'A2',
    goal: 'travel',
    category: 'Hotel & Menginap',
    title: 'Check-in Hotel',
    sentence: 'I have a reservation under the name Budi for two nights.',
    context: 'Konfirmasi reservasi kamar saat tiba di meja resepsionis hotel.',
    phoneticFocus: 'Tekanan kata "reservation" ada di suku kata ketiga: rez-er-VEI-shun.',
    difficulty: 'Medium',
  },
  {
    id: 'a2-academic-1',
    tier: 'A2',
    goal: 'academic',
    category: 'Tugas Kuliah',
    title: 'Konfirmasi Batas Pengumpulan',
    sentence: 'Could you please clarify the deadline for this assignment?',
    context: 'Menanyakan kejelasan batas waktu pengumpulan tugas atau revisi draft skripsi.',
    phoneticFocus: 'Kata "clarify" dibaca /ˈklærəfaɪ/, dan huruf "g" pada "assignment" tidak dibaca.',
    difficulty: 'Medium',
  },
  {
    id: 'a2-social-1',
    tier: 'A2',
    goal: 'social',
    category: 'Hobi & Santai',
    title: 'Menceritakan Hobi Akhir Pekan',
    sentence: 'On weekends I usually enjoy playing music and watching movies.',
    context: 'Membangun relasi personal saat ngobrol santai bersama kenalan baru.',
    phoneticFocus: 'Kata "usually" dibaca /ˈjuːʒuəli/ dengan getaran lembut /ʒ/.',
    difficulty: 'Medium',
  },

  // --- TIER B1: MANDIRI KERJA & DISKUSI (Bilingual Halus 20% ID / 80% EN) ---
  {
    id: 'b1-career-1',
    tier: 'B1',
    goal: 'career',
    category: 'Code Review & Arsitektur',
    title: 'Tinjauan Trade-offs Arsitektur',
    sentence: 'Could you please explain the trade offs of this approach?',
    context: 'Pertanyaan diplomatis dan profesional untuk meninjau keputusan arsitektur pada Pull Request.',
    phoneticFocus: 'Akhiran "approach" berbunyi /tʃ/ yang tajam dan tegas.',
    difficulty: 'Advanced',
  },
  {
    id: 'b1-career-2',
    tier: 'B1',
    goal: 'career',
    category: 'Incident & Cloud',
    title: 'Laporan Bottleneck Sistem Produksi',
    sentence: 'We detected a performance bottleneck in the production deployment.',
    context: 'Melaporkan lonjakan latency server produksi di depan Tech Lead atau tim DevOps.',
    phoneticFocus: 'Tekanan pada "performance" (per-FOR-mens) dan "production" (pro-DAK-shun).',
    difficulty: 'Advanced',
  },
  {
    id: 'b1-academic-1',
    tier: 'B1',
    goal: 'academic',
    category: 'Presentasi Skripsi',
    title: 'Pemaparan Hasil Riset Empiris',
    sentence: 'Based on our empirical results, the speech recognition accuracy improved significantly.',
    context: 'Menyampaikan temuan riset empiris di depan dosen penguji saat sidang tugas akhir.',
    phoneticFocus: 'Kata "empirical" /ɪmˈpɪrɪkəl/ dan "significantly" /sɪɡˈnɪfɪkəntli/ beritme stabil.',
    difficulty: 'Advanced',
  },
  {
    id: 'b1-travel-1',
    tier: 'B1',
    goal: 'travel',
    category: 'Layanan Bandara',
    title: 'Menangani Kendala Bagasi',
    sentence: 'Excuse me, my baggage seems to be delayed and I need assistance with filing a report.',
    context: 'Menghubungi petugas lost and found saat koper tertinggal atau belum keluar di bandara.',
    phoneticFocus: 'Frasa "seems to be" dibaca menyatu (connected speech) /siːmz tə biː/.',
    difficulty: 'Advanced',
  },
  {
    id: 'b1-social-1',
    tier: 'B1',
    goal: 'social',
    category: 'Diskusi Opini',
    title: 'Menyampaikan Sudut Pandang Alternatif',
    sentence: 'I see your point, but we might want to consider alternative options before deciding.',
    context: 'Menyampaikan perbedaan pendapat secara santun dan diplomatis dalam diskusi.',
    phoneticFocus: 'Gunakan intonasi turun-naik (fall-rise) pada "I see your point" agar ramah.',
    difficulty: 'Advanced',
  },
];

export default function SpeakingPracticePage() {
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | UserProficiencyTier>('all');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<'all' | UserLearningGoal>('all');
  const [activeScenarioId, setActiveScenarioId] = useState<string>(PRESET_SCENARIOS[0].id);
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
  const recordingStartTimeRef = useRef<number>(0);

  useEffect(() => {
    // Check Speech Recognition support in browser
    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRec) {
        setSpeechSupported(false);
      }
      const prefs = getUserPreferences();
      if (prefs.proficiencyTier) {
        setSelectedTierFilter(prefs.proficiencyTier);
      }
      if (prefs.goal) {
        setSelectedGoalFilter(prefs.goal);
      }
      const matched =
        PRESET_SCENARIOS.find((s) => s.tier === prefs.proficiencyTier && s.goal === prefs.goal) ||
        PRESET_SCENARIOS.find((s) => s.tier === prefs.proficiencyTier) ||
        PRESET_SCENARIOS[0];
      setActiveScenarioId(matched.id);
      setActiveSentence(matched.sentence);
    }

    return () => {
      stopRecordingCleanup();
      stopSpeech();
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, []);

  const activeScenario =
    PRESET_SCENARIOS.find((s) => s.id === activeScenarioId) || PRESET_SCENARIOS[0];

  const filteredScenarios = PRESET_SCENARIOS.filter((scenario) => {
    const matchesTier = selectedTierFilter === 'all' || scenario.tier === selectedTierFilter;
    const matchesGoal = selectedGoalFilter === 'all' || scenario.goal === selectedGoalFilter;
    return matchesTier && matchesGoal;
  });

  // Update active sentence when scenario changes
  function handleSelectScenario(scenario: SpeakingScenario) {
    playBubblePop();
    setIsCustomMode(false);
    setActiveScenarioId(scenario.id);
    setActiveSentence(scenario.sentence);
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
      speakTurtleMode(activeSentence, { emotion: 'pedagogical', onEnd });
    } else {
      speakText(activeSentence, { rate: 0.95, emotion: 'pedagogical', onEnd });
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
    recordingStartTimeRef.current = Date.now();

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

  // Jalankan Evaluasi Pengucapan ELSA dengan Analisis Temporal Fluency
  function runEvaluation(transcript: string) {
    const durationSec =
      recordingStartTimeRef.current > 0 ? (Date.now() - recordingStartTimeRef.current) / 1000 : undefined;
    const result = evaluatePronunciation(activeSentence, transcript, durationSec);
    setEvaluation(result);

    // Otomatis masukkan kata-kata dengan skor kurang optimal (<80% / yellow / red) ke Leitner Spaced Review
    if (result.wordScores && result.wordScores.length > 0) {
      result.wordScores.forEach((ws) => {
        if (ws.status === 'red' || ws.status === 'yellow') {
          const phonetic = getPhoneticRepresentation(ws.word);
          ingestSpokenMistake({
            word: ws.word,
            targetSentence: activeSentence,
            ipa: phonetic,
            articulatoryHint: ws.feedback || `Latih kembali artikulasi kata "${ws.word}" dengan santai dan jelas.`,
          });
        }
      });
    }

    // Catat progres kebiasaan harian (Habit Loop)
    const earnedXp = result.overallScore >= 80 ? 30 : 15;
    recordPracticeSession(2, earnedXp);

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
                <Mic className="h-3.5 w-3.5 text-emerald-400" />
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E374D] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Pilih Skenario Percakapan Berjenjang
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                {isCustomMode
                  ? 'Mode Kustom'
                  : `${filteredScenarios.findIndex((s) => s.id === activeScenarioId) + 1 || 1} / ${filteredScenarios.length} Skenario`}
              </span>
            </div>
          </div>

          {/* FILTER 1: TIER CEFR & BILINGUAL RATIO */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Tingkat Kemahiran (CEFR &amp; Rasio Bimbingan):</span>
              <span className="text-[10px] text-cyan-400 font-mono">Metode Sandwich ID-EN</span>
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
                Semua Tingkat ({PRESET_SCENARIOS.length})
              </button>
              {(['A1', 'A2', 'B1'] as UserProficiencyTier[]).map((tierKey) => {
                const tierMeta = PROFICIENCY_TIERS[tierKey];
                const count = PRESET_SCENARIOS.filter((s) => s.tier === tierKey).length;
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

          {/* FILTER 2: LEARNING GOAL / TOPIK */}
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

          {/* Preset Buttons Grid */}
          {filteredScenarios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {filteredScenarios.map((scenario) => {
                const isSelected = !isCustomMode && activeScenarioId === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleSelectScenario(scenario)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/15 text-white shadow-[0_0_15px_rgba(0,229,117,0.2)]'
                        : 'border-[#1E374D] bg-[#0A131C] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            scenario.tier === 'A1'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : scenario.tier === 'A2'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          {scenario.tier}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold truncate max-w-[120px]">
                          {scenario.category}
                        </span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {scenario.difficulty}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">{scenario.title}</div>
                    <div className="text-[11px] text-slate-400 italic line-clamp-1 font-mono">
                      &quot;{scenario.sentence}&quot;
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0A131C] border border-[#1E374D] text-center text-xs text-slate-400">
              Tidak ada skenario yang sesuai dengan kombinasi filter ini. Pilih &quot;Semua Tingkat&quot; atau &quot;Semua Topik&quot;.
            </div>
          )}

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
                  {!isCustomMode && activeScenario && (
                    <span className="text-[11px] text-cyan-400 font-mono">
                      ({activeScenario.title})
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
                    {isPlayingNative && !isTurtleMode ? (
                      <LottiePlayer
                        animationPath="/animations/audio_speaker_wave.json"
                        className="h-4 w-4 shrink-0"
                        loop={true}
                      />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                    <span>Native Audio</span>
                  </button>

                  {/* Turtle Mode 0.65x */}
                  <button
                    type="button"
                    onClick={() => handlePlayNativeAudio(true)}
                    disabled={isPlayingNative}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142433] hover:bg-[#1E374D] text-amber-400 text-xs font-bold border border-amber-500/30 transition cursor-pointer"
                    title="Mode lambat 0.65x untuk mendengar artikulasi fonem kata demi kata"
                  >
                    {isPlayingNative && isTurtleMode ? (
                      <LottiePlayer
                        animationPath="/animations/audio_speaker_wave.json"
                        className="h-4 w-4 shrink-0"
                        loop={true}
                      />
                    ) : (
                      <Volume1 className="h-3.5 w-3.5" />
                    )}
                    <span>0.65x Slow</span>
                  </button>
                </div>
              </div>

              {/* Context Hint / Bilingual Coaching Box */}
              {!isCustomMode && activeScenario && (
                <div className="p-3.5 rounded-xl bg-[#08121C] border border-[#1E374D] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          activeScenario.tier === 'A1'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : activeScenario.tier === 'A2'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        }`}
                      >
                        Tier {activeScenario.tier} • {PROFICIENCY_TIERS[activeScenario.tier]?.titleId || activeScenario.tier}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {activeScenario.tier === 'A1'
                          ? '70% Panduan ID'
                          : activeScenario.tier === 'A2'
                          ? '45% Panduan ID'
                          : '20% Panduan ID'}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Target className="h-3 w-3 text-cyan-400" />
                      <span>{LEARNING_GOALS[activeScenario.goal]?.titleId || activeScenario.category}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong className="text-white">Situasi:</strong> {activeScenario.context}
                  </p>
                  {activeScenario.phoneticFocus && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-amber-200">Tips Fonem Kritis:</strong> {activeScenario.phoneticFocus}
                      </span>
                    </div>
                  )}
                </div>
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
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>80%+ (Native)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>60-79% (Hampir Tepat)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span>&lt;60% (Perlu Latihan)</span>
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
                    <div className="text-xs text-emerald-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 flex items-start gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <strong>Tips Artikulasi:</strong> {selectedWordDetail.feedback}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-300 bg-[#0A131C] p-2.5 rounded-lg border border-[#1E374D]">
                      Ucapkan fonem <strong className="font-mono text-cyan-300">{selectedWordDetail.ipa}</strong> dengan artikulasi bibir dan lidah yang rileks.
                    </div>
                  )}

                  {/* Syllable Stress Guidance */}
                  {(() => {
                    const stressGuide = getWordStressGuidance(selectedWordDetail.word);
                    if (!stressGuide) return null;
                    return (
                      <div className="p-3 rounded-xl bg-[#08121C] border border-cyan-500/30 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-cyan-300">Pola Penekanan Suku Kata:</span>
                          <span className="font-mono text-emerald-400 font-extrabold tracking-wider">
                            {stressGuide.syllables}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {stressGuide.prosodyTip}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Recognition Misalignment (User Spoken vs Target Word) */}
                  {selectedWordDetail.recognizedWord &&
                    selectedWordDetail.recognizedWord.toLowerCase() !==
                      selectedWordDetail.word.toLowerCase() && (
                      <div className="text-xs bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/30 flex items-center justify-between text-slate-300">
                        <span>
                          AI Mendengar:{' '}
                          <strong className="text-rose-400 font-mono">
                            &ldquo;{selectedWordDetail.recognizedWord}&rdquo;
                          </strong>
                        </span>
                        <span>
                          Target:{' '}
                          <strong className="text-emerald-400 font-mono">
                            &ldquo;{selectedWordDetail.word}&rdquo;
                          </strong>
                        </span>
                      </div>
                    )}

                  {/* Drill in Minimal Pairs Studio if not green */}
                  {selectedWordDetail.status !== 'green' && (
                    <Link
                      href="/practice/minimal-pairs"
                      className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>Latih Pasangan Fonem di Minimal Pairs Studio</span>
                    </Link>
                  )}

                  {/* Interactive Letter Spelling Chips ("Setiap Memilih Huruf Ada Suara AI-nya") */}
                  <div className="pt-2 border-t border-[#1E374D]/60 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="h-3 w-3 text-cyan-400" />
                        <span>Ketuk Setiap Huruf untuk Dengarkan Suara AI:</span>
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">Spell Audio</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedWordDetail.word.split('').map((char, charIdx) => {
                        const isLetter = /[a-zA-Z]/.test(char);
                        if (!isLetter) return null;
                        return (
                          <button
                            key={charIdx}
                            type="button"
                            onClick={() => {
                              playBubblePop();
                              speakLetter(char.toUpperCase());
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A131C] hover:bg-cyan-500 hover:text-slate-950 border border-[#1E374D] hover:border-cyan-400 text-xs font-mono font-black text-white transition cursor-pointer active:scale-95 shadow-sm"
                            title={`Dengarkan pelafalan huruf ${char.toUpperCase()}`}
                          >
                            {char.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* RECORDING / LIVE VISUALIZER CONSOLE */}
              <div className="p-5 rounded-2xl bg-[#070D14] border border-[#1E374D] flex flex-col items-center justify-center space-y-4">
                {/* Acoustic Spectrogram & Frequency Canvas */}
                <div className="w-full max-w-md space-y-3">
                  <AcousticSpectrogram
                    isRecording={isRecording}
                    analyserNode={analyserRef.current}
                    height={56}
                    accentColor="#00E575"
                  />
                  <AcousticPitchContour
                    isRecording={isRecording}
                    analyserNode={analyserRef.current}
                    targetSentence={activeSentence}
                    height={72}
                  />
                </div>

                {/* Waveform Frequency Bars (Powered by Web Audio AnalyserNode) */}
                <div className="flex items-center justify-center gap-1.5 h-8 w-full max-w-sm">
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

                {/* Modern Concentric Ripple Mic Button (Enhanced with Lottie Pulse) */}
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative flex items-center justify-center">
                    {/* Lottie Pulse Animation when Recording */}
                    {isRecording ? (
                      <div className="absolute h-52 w-52 pointer-events-none z-0 flex items-center justify-center">
                        <LottiePlayer
                          animationPath="/animations/mic_pulse.json"
                          loop={true}
                          className="w-full h-full opacity-90 scale-125"
                        />
                      </div>
                    ) : (
                      <>
                        {/* Ambient Outer Wave Ring */}
                        <div className="absolute h-36 w-36 rounded-full bg-violet-500/10 scale-100 pointer-events-none" />
                        {/* Ambient Middle Wave Ring */}
                        <div className="absolute h-28 w-28 rounded-full bg-violet-500/20 pointer-events-none" />
                      </>
                    )}

                    {/* Central Elevated Mic Button */}
                    <button
                      type="button"
                      onClick={handleToggleRecording}
                      className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl ${
                        isRecording
                          ? 'bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-[0_0_35px_rgba(244,63,94,0.6)] scale-105'
                          : 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white shadow-[0_10px_30px_rgba(124,58,237,0.45)] hover:scale-105'
                      }`}
                      title={isRecording ? 'Berhenti Bicara' : 'Tap the mic and speak'}
                    >
                      {isRecording ? (
                        <MicOff className="h-9 w-9 text-white animate-pulse" />
                      ) : (
                        <Mic className="h-9 w-9 text-white drop-shadow" />
                      )}
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-300 tracking-wide">
                    {isRecording ? 'Sedang merekam... Tekan untuk berhenti' : 'Tap the mic and speak'}
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
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{liveTranscript ? 'Analisis Pengucapan Saya' : 'Coba Simulasi Penilaian (Demo Mode)'}</span>
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
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Mic className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Pronunciation (Akurasi)</span>
                        </span>
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
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-cyan-400" />
                          <span>
                            Fluency (Kelancaran
                            {evaluation.temporalMetrics ? ` • ${evaluation.temporalMetrics.wordsPerMinute} WPM` : ''})
                          </span>
                        </span>
                        <span className="text-cyan-400 font-mono">{evaluation.fluencyScore}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#101C27] overflow-hidden">
                        <div
                          style={{ width: `${evaluation.fluencyScore}%` }}
                          className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                        />
                      </div>
                      {evaluation.temporalMetrics && (
                        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                          <span className="text-cyan-400 font-medium">{evaluation.temporalMetrics.cefrSpeedTier}</span>
                          <span className="font-mono text-slate-500">{evaluation.temporalMetrics.durationSeconds}s durasi</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Music className="h-3.5 w-3.5 text-amber-400" />
                          <span>Intonation (Ritme)</span>
                        </span>
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

                  {/* Critical Phoneme Focus */}
                  {(() => {
                    const criticalIssues = detectCriticalPhonemeIssues(
                      activeSentence,
                      liveTranscript || ''
                    );
                    if (criticalIssues.length === 0) return null;
                    return (
                      <div className="space-y-2 pt-2 border-t border-[#1E374D]">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                          <span>Fokus Koreksi Fonem Kritis:</span>
                        </span>
                        <div className="space-y-2">
                          {criticalIssues.map((issue, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold text-white">
                                <span>
                                  Kata: &ldquo;{issue.targetWord}&rdquo; &rarr; &ldquo;{issue.recognizedWord}&rdquo;
                                </span>
                                <span className="font-mono text-amber-300">
                                  Target: {issue.expectedPhoneme}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">{issue.description}</div>
                              <p className="text-[11px] text-amber-200/90 leading-relaxed italic flex items-start gap-1">
                                <Lightbulb className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                                <span>{issue.pedagogicalTip}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="pt-1">
                          <Link
                            href="/practice/minimal-pairs"
                            className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Target className="h-3.5 w-3.5" />
                            <span>Latih Pasangan Fonem Tertukar di Studio</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })()}
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

            {/* AI ACOUSTIC MENTOR FEEDBACK CARD */}
            {evaluation ? (
              <div className="space-y-4">
                <EmpatheticFeedbackCard
                  feedback={generateEmpatheticFeedback({
                    result: evaluation,
                    tier: activeScenario.tier,
                    goal: activeScenario.goal,
                    targetSentence: activeSentence,
                    spokenText: liveTranscript,
                  })}
                  onRetry={handleToggleRecording}
                />
                {evaluation.overallScore >= 80 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between shadow-[0_0_15px_rgba(0,229,117,0.2)]">
                    <span className="text-xs font-bold text-emerald-300">Bonus Latihan Selesai</span>
                    <span className="text-xs font-black text-emerald-400 font-mono">+60 XP</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-cyber p-5 space-y-4 border-cyan-500/30">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(0,210,255,0.25)] flex items-center justify-center shrink-0 text-cyan-400">
                    <Activity className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Fluenzy AI Voice Lab</h3>
                    <p className="text-[11px] text-cyan-400 font-mono">Bilingual Empathetic Coach</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A131C] border border-[#1E374D] text-xs text-slate-300 leading-relaxed">
                  <span>
                    &ldquo;Selamat datang di Fluenzy AI Voice Lab! Di lab ini, kita akan melatih otot mulut untuk
                    melafalkan bahasa Inggris dengan artikulasi presisi. Ayo coba rekam suaramu!&rdquo;
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
