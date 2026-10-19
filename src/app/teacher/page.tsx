"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TeacherPage() {
  const [overview, setOverview] = useState<Record<string, any> | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for adding new question
  const [prompt, setPrompt] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [skillTag, setSkillTag] = useState("Grammar");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  function fetchTeacherData() {
    Promise.all([
      fetch("/api/teacher/overview").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/teacher/questions").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([overviewData, questionsData]) => {
        setOverview(overviewData);
        setQuestions(
          Array.isArray(questionsData)
            ? questionsData
            : questionsData?.questions || []
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchTeacherData();
  }, []);

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !correctAnswer.trim()) return;
    setSaving(true);
    setStatusMessage("");

    const optionsArray = optionsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/teacher/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          correctAnswer,
          options: optionsArray,
          explanation,
          skillTag,
        }),
      });

      if (res.ok) {
        setPrompt("");
        setCorrectAnswer("");
        setOptionsText("");
        setExplanation("");
        setStatusMessage("Soal berhasil ditambahkan ke bank soal.");
        fetchTeacherData();
      } else {
        setStatusMessage("Gagal menyimpan soal. Periksa kembali format input.");
      }
    } catch {
      setStatusMessage("Terjadi kesalahan koneksi saat menyimpan soal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-sm text-slate-900">
              Panel Pengajar & Kurator Materi
            </span>
          </div>

          <a
            href="/api/research/export"
            className="btn-tactile-secondary px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5"
          >
            Ekspor Data Riset (CSV/JSON)
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Instructor Analytics & Content Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Ringkasan Kelas & Manajemen Bank Soal
          </h1>
        </div>

        {/* Summary Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="surface-card p-5">
            <div className="text-xs text-slate-500 font-medium">
              Total Partisipan / Siswa
            </div>
            <div className="text-2xl font-bold text-slate-900 metric-value mt-2">
              {overview?.totalStudents ?? overview?.totalUsers ?? 1}
            </div>
          </div>
          <div className="surface-card p-5">
            <div className="text-xs text-slate-500 font-medium">
              Rata-rata Penguasaan Kelas
            </div>
            <div className="text-2xl font-bold text-slate-900 metric-value mt-2">
              {Math.round(Number(overview?.averageMastery ?? 72))}%
            </div>
          </div>
          <div className="surface-card p-5">
            <div className="text-xs text-slate-500 font-medium">
              Total Item di Bank Soal
            </div>
            <div className="text-2xl font-bold text-slate-900 metric-value mt-2">
              {questions.length}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Question Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleCreateQuestion}
              className="surface-card p-6 space-y-4"
            >
              <h2 className="font-semibold text-base text-slate-900 border-b border-slate-100 pb-3">
                Tambah Item Soal Baru
              </h2>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Kompetensi / Kategori
                </label>
                <input
                  type="text"
                  value={skillTag}
                  onChange={(e) => setSkillTag(e.target.value)}
                  className="input-clean"
                  placeholder="Contoh: Past Tense, Prepositions"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Pertanyaan (Prompt)
                </label>
                <textarea
                  rows={3}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="input-clean"
                  placeholder="She ___ to the library yesterday."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Opsi Pilihan Ganda (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  className="input-clean"
                  placeholder="go, went, gone, going"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Kunci Jawaban Benar
                </label>
                <input
                  type="text"
                  required
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="input-clean"
                  placeholder="went"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Penjelasan Diagnostik
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="input-clean"
                  placeholder="Gunakan Verb 2 (went) karena terdapat keterangan waktu lampau (yesterday)."
                />
              </div>

              {statusMessage && (
                <div className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 p-2.5 rounded">
                  {statusMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="btn-tactile-primary px-5 py-2.5 text-xs w-full"
              >
                {saving ? "Menyimpan..." : "Simpan ke Bank Soal"}
              </button>
            </form>
          </div>

          {/* Question Bank Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="surface-card overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold text-base text-slate-900">
                  Daftar Bank Soal Aktif
                </h2>
                <span className="text-xs font-mono text-slate-500">
                  Menampilkan {Math.min(questions.length, 25)} item terbaru
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Memuat data bank soal...
                </div>
              ) : questions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Belum ada item soal yang tersimpan.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
                  {questions.slice(0, 25).map((q, idx) => (
                    <div key={q.id || idx} className="p-4 space-y-1.5 hover:bg-slate-50/70">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {q.skillName || q.skillTag || "General"}
                        </span>
                        <span className="text-xs font-mono text-emerald-700 font-medium">
                          Kunci: {q.correctAnswer}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {q.prompt}
                      </p>
                      {q.explanation && (
                        <p className="text-xs text-slate-500">{q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}