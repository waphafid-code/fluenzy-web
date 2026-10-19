"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StandingMascot from "./StandingMascot";

export interface QuestionItem {
  id: string;
  prompt: string;
  type?: string;
  options?: string[] | string;
  correctAnswer: string;
  skillTag?: string;
  skillName?: string;
  explanation?: string;
  audioText?: string;
}

interface SessionPlayerProps {
  questions: QuestionItem[];
  sessionType: "lesson" | "review" | "weakness";
  title: string;
  subtitle?: string;
  lessonId?: string;
}

export default function SessionPlayer({
  questions,
  sessionType,
  title,
  subtitle,
  lessonId,
}: SessionPlayerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackExplanation, setFeedbackExplanation] = useState<string>("");
  const [errorCategory, setErrorCategory] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="surface-card p-8 max-w-md w-full space-y-5">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Status Sesi Latihan
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Antrean Soal Kosong
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tidak ada soal yang perlu dikerjakan pada kategori ini sekarang. Silakan kembali ke ringkasan atau pilih modul lain di kurikulum.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-tactile-primary px-4 py-2.5 text-xs flex-1"
            >
              Ke Dashboard
            </button>
            <button
              onClick={() => router.push("/roadmap")}
              className="btn-tactile-secondary px-4 py-2.5 text-xs flex-1"
            >
              Buka Kurikulum
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const parsedOptions: string[] = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : typeof currentQuestion.options === "string"
    ? (() => {
        try {
          const parsed = JSON.parse(currentQuestion.options);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];

  const isMultipleChoice = parsedOptions.length > 0;
  const userAnswer = isMultipleChoice ? selectedOption : textInput.trim();
  const progressPercent = Math.round(
    ((currentIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100
  );

  function handleSpeak(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  async function handleCheckAnswer() {
    if (!userAnswer || submitting) return;
    setSubmitting(true);

    const responseTimeMs = Date.now() - startTime;
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = currentQuestion.correctAnswer.trim().toLowerCase();
    const localCorrect = normalizedUser === normalizedCorrect;

    try {
      const res = await fetch("/api/session/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer,
          answer: userAnswer,
          sessionType,
          lessonId,
          responseTimeMs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const finalCorrect =
          typeof data.isCorrect === "boolean" ? data.isCorrect : localCorrect;
        setIsCorrect(finalCorrect);
        if (finalCorrect) setCorrectCount((prev) => prev + 1);
        if (data.xpEarned) setXpEarned((prev) => prev + Number(data.xpEarned));
        if (data.errorType || data.errorCategory) {
          setErrorCategory(data.errorType || data.errorCategory);
        }
        setFeedbackExplanation(
          data.explanation ||
            currentQuestion.explanation ||
            "Perhatikan kesesuaian subjek, keterangan waktu, dan bentuk kata kerja pada kalimat."
        );
      } else {
        setIsCorrect(localCorrect);
        if (localCorrect) setCorrectCount((prev) => prev + 1);
        setFeedbackExplanation(
          currentQuestion.explanation ||
            "Perhatikan kembali struktur tata bahasa pada kalimat tersebut."
        );
      }
    } catch {
      setIsCorrect(localCorrect);
      if (localCorrect) setCorrectCount((prev) => prev + 1);
      setFeedbackExplanation(
        currentQuestion.explanation ||
          "Perhatikan kembali struktur tata bahasa pada kalimat tersebut."
      );
    } finally {
      setSubmitting(false);
      setIsSubmitted(true);
    }
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption("");
      setTextInput("");
      setIsSubmitted(false);
      setIsCorrect(null);
      setFeedbackExplanation("");
      setErrorCategory(null);
    } else {
      setIsFinished(true);
    }
  }

  if (isFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="surface-card p-8 max-w-lg w-full space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
              Evaluasi Sesi Selesai
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Akurasi</div>
              <div className="text-2xl font-bold text-slate-900 metric-value mt-1">
                {accuracy}%
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Skor Benar</div>
              <div className="text-2xl font-bold text-slate-900 metric-value mt-1">
                {correctCount}/{questions.length}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Tambahan XP</div>
              <div className="text-2xl font-bold text-blue-600 metric-value mt-1">
                +{xpEarned || correctCount * 10}
              </div>
            </div>
          </div>

          <StandingMascot
            pose="bust"
            label="Ringkasan Adaptif"
            message={
              accuracy >= 80
                ? "Tingkat penguasaan sangat stabil. Interval pengulangan soal pada topik ini telah diperpanjang secara otomatis."
                : "Beberapa konsep masih memerlukan penguatan. Soal yang kurang tepat telah dijadwalkan ulang ke antrean review harian."
            }
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-tactile-primary px-5 py-2.5 text-xs flex-1"
            >
              Kembali ke Dashboard
            </button>
            <button
              onClick={() => router.push("/roadmap")}
              className="btn-tactile-secondary px-5 py-2.5 text-xs flex-1"
            >
              Peta Kurikulum
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Progress Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-5">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Keluar Sesi"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex-1">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-800">{title}</span>
              <span className="font-mono text-slate-500 metric-value">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Question Container */}
      <main className="max-w-2xl w-full mx-auto px-6 py-10 flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-block text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-slate-200/70 text-slate-700 font-medium">
              {currentQuestion.skillName ||
                currentQuestion.skillTag ||
                `Mode: ${sessionType.toUpperCase()}`}
            </span>

            <button
              type="button"
              onClick={() =>
                handleSpeak(currentQuestion.audioText || currentQuestion.prompt)
              }
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1 rounded border border-slate-200 bg-white transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              Audio
            </button>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 leading-snug">
            {currentQuestion.prompt}
          </h2>

          {isMultipleChoice ? (
            <div className="space-y-3 pt-2">
              {parsedOptions.map((option, idx) => {
                const keyLabel = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === option;

                let cardClasses =
                  "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
                if (isSelected && !isSubmitted) {
                  cardClasses =
                    "border-blue-600 bg-blue-50/40 text-blue-950 ring-1 ring-blue-600";
                } else if (isSubmitted) {
                  if (
                    option.trim().toLowerCase() ===
                    currentQuestion.correctAnswer.trim().toLowerCase()
                  ) {
                    cardClasses =
                      "border-emerald-600 bg-emerald-50/70 text-emerald-950";
                  } else if (isSelected) {
                    cardClasses = "border-red-500 bg-red-50/70 text-red-950";
                  } else {
                    cardClasses =
                      "border-slate-200 bg-slate-50 text-slate-400 opacity-65";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-4 rounded-xl border border-b-[3px] transition-all flex items-center gap-3.5 cursor-pointer ${cardClasses}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-md font-mono text-xs font-semibold flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {keyLabel}
                    </span>
                    <span className="text-sm md:text-base font-medium">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Ketik jawaban lengkap Anda:
              </label>
              <input
                type="text"
                disabled={isSubmitted}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSubmitted && textInput.trim()) {
                    handleCheckAnswer();
                  }
                }}
                placeholder="Tulis jawaban bahasa Inggris di sini..."
                className="input-clean text-base py-3"
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Evaluation Bar */}
      <footer
        className={`border-t transition-colors ${
          !isSubmitted
            ? "bg-white border-slate-200"
            : isCorrect
            ? "bg-emerald-50/90 border-emerald-200"
            : "bg-red-50/90 border-red-200"
        }`}
      >
        <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {!isSubmitted ? (
            <>
              <div className="text-xs text-slate-500">
                Pastikan pilihan atau struktur kalimat sudah tepat sebelum memeriksa.
              </div>
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={!userAnswer || submitting}
                className="btn-tactile-primary px-6 py-2.5 text-sm w-full sm:w-auto"
              >
                {submitting ? "Memproses..." : "Periksa Jawaban"}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1.5 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-mono uppercase font-bold px-2 py-0.5 rounded ${
                      isCorrect
                        ? "bg-emerald-200/80 text-emerald-950"
                        : "bg-red-200/80 text-red-950"
                    }`}
                  >
                    {isCorrect ? "Jawaban Tepat" : "Perlu Koreksi"}
                  </span>

                  {errorCategory && !isCorrect && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white border border-red-200 text-red-800">
                      Tipe Error: {errorCategory}
                    </span>
                  )}

                  {!isCorrect && (
                    <span className="text-xs font-medium text-slate-800">
                      Kunci: <strong>{currentQuestion.correctAnswer}</strong>
                    </span>
                  )}
                </div>

                {feedbackExplanation && (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {feedbackExplanation}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="btn-tactile-primary px-6 py-2.5 text-sm shrink-0 w-full sm:w-auto"
              >
                {currentIndex + 1 < questions.length
                  ? "Soal Berikutnya"
                  : "Selesaikan Sesi"}
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
