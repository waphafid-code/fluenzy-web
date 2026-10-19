'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  PlusCircle,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Search,
  Sparkles,
  BarChart,
  CheckCircle2,
} from 'lucide-react';

interface StudentReport {
  id: string;
  name: string;
  email: string;
  totalXp: number;
  streak: number;
  lastActiveDate: string;
  avgMasteryPercent: number;
  weakestSkill: string;
  weakestSkillPercent: number;
}

interface QuestionItem {
  id: string;
  prompt: string;
  type: string;
  difficulty: number;
  explanation: string;
  payload: string;
  skill: { id: string; name: string };
  lesson: { id: string; title: string };
}

interface SkillItem {
  id: string;
  name: string;
}

interface LessonItem {
  id: string;
  title: string;
}

export default function TeacherPortalPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions'>('overview');
  const [overview, setOverview] = useState<{
    totalStudents: number;
    totalQuestions: number;
    totalSkills: number;
    classWeakestSkills: { skillName: string; count: number }[];
    students: StudentReport[];
  } | null>(null);

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State untuk Tambah Soal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formLessonId, setFormLessonId] = useState('');
  const [formSkillId, setFormSkillId] = useState('');
  const [formType, setFormType] = useState('multiple_choice');
  const [formDifficulty, setFormDifficulty] = useState(2);
  const [formPrompt, setFormPrompt] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('');
  const [formOptions, setFormOptions] = useState('Option A, Option B, Option C, Option D');
  const [formExplanation, setFormExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [ovRes, qRes] = await Promise.all([
        fetch('/api/teacher/overview'),
        fetch('/api/teacher/questions'),
      ]);
      const ovJson = await ovRes.json();
      const qJson = await qRes.json();
      setOverview(ovJson);
      setQuestions(qJson.questions || []);
      setSkills(qJson.skills || []);
      setLessons(qJson.lessons || []);

      if (qJson.lessons?.length > 0) setFormLessonId(qJson.lessons[0].id);
      if (qJson.skills?.length > 0) setFormSkillId(qJson.skills[0].id);
    } catch {
      alert('Gagal memuat data portal guru');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDeleteQuestion(id: string) {
    if (!confirm('Apakah kamu yakin ingin menghapus soal ini dari bank soal?')) return;
    try {
      const res = await fetch(`/api/teacher/questions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert('Gagal menghapus soal.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus.');
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      let payloadObj: Record<string, unknown> = {};
      if (formType === 'multiple_choice') {
        const opts = formOptions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (!opts.includes(formCorrectAnswer.trim())) {
          opts.unshift(formCorrectAnswer.trim());
        }
        payloadObj = {
          options: opts,
          correctAnswer: formCorrectAnswer.trim(),
        };
      } else if (formType === 'word_order') {
        const tokens = formCorrectAnswer.trim().split(/\s+/);
        payloadObj = {
          tokens,
          correctAnswer: formCorrectAnswer.trim(),
        };
      } else {
        payloadObj = {
          correctAnswer: formCorrectAnswer.trim(),
        };
      }

      const res = await fetch('/api/teacher/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: formLessonId,
          skillId: formSkillId,
          type: formType,
          difficulty: formDifficulty,
          prompt: formPrompt,
          payload: JSON.stringify(payloadObj),
          explanation: formExplanation,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan soal');

      setShowAddModal(false);
      setFormPrompt('');
      setFormCorrectAnswer('');
      setFormExplanation('');
      loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredQuestions = questions.filter(
    (q) =>
      q.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Ke Dashboard Siswa"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
                  G
                </span>
                <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Portal Guru & Kurikulum
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  Role: Teacher
                </span>
              </div>
              <p className="text-xs text-slate-500">Ibu Rahmawati, S.Pd. (guru@fluenzy.id)</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-lg px-4 py-1.5 transition ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Laporan Kelas
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`rounded-lg px-4 py-1.5 transition ${
                activeTab === 'questions'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Bank Soal ({questions.length})
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: LAPORAN KELAS & RINGKASAN SISWA */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrik Utama Kelas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Total Siswa Terdaftar</span>
                <div className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="h-7 w-7 text-indigo-500" />
                  {overview?.totalStudents || 0} Siswa
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Total Bank Soal Aktif</span>
                <div className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="h-7 w-7 text-emerald-500" />
                  {overview?.totalQuestions || 0} Soal
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Skill Paling Bermasalah Kelas</span>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 truncate flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                  {overview?.classWeakestSkills?.[0]?.skillName || 'Belum ada data'}
                </div>
              </div>
            </div>

            {/* Tabel Performa Siswa */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                Laporan Penguasaan Per Siswa
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3">Nama Siswa</th>
                      <th className="py-3 px-3">Mastery Rata-Rata</th>
                      <th className="py-3 px-3">Skill Paling Lemah</th>
                      <th className="py-3 px-3">Total XP</th>
                      <th className="py-3 px-3">Streak</th>
                      <th className="py-3 px-3">Aktivitas Terakhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {overview?.students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{st.name}</div>
                          <div className="text-xs text-slate-400">{st.email}</div>
                        </td>
                        <td className="py-3 px-3 font-extrabold">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs ${
                              st.avgMasteryPercent < 50
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : st.avgMasteryPercent <= 80
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {st.avgMasteryPercent}%
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-rose-600 dark:text-rose-400 text-xs">
                          {st.weakestSkill} ({st.weakestSkillPercent}%)
                        </td>
                        <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                          {st.totalXp} XP
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-600">
                          {st.streak} hari
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-500">
                          {st.lastActiveDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MANAJEMEN BANK SOAL (CRUD) */}
        {/* ========================================================================= */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari soal atau skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition"
              >
                <PlusCircle className="h-4 w-4" />
                Tambah Soal Baru
              </button>
            </div>

            {/* Tabel Bank Soal */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Pertanyaan</th>
                      <th className="py-3.5 px-3">Materi (Skill)</th>
                      <th className="py-3.5 px-3">Tipe</th>
                      <th className="py-3.5 px-3">Kesulitan</th>
                      <th className="py-3.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 max-w-md">
                          <div>{q.prompt}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{q.explanation}</div>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-700 dark:text-slate-300">
                          {q.skill?.name}
                        </td>
                        <td className="py-3.5 px-3 uppercase font-extrabold text-[10px] text-indigo-600 dark:text-indigo-400">
                          {q.type.replace('_', ' ')}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                            Level {q.difficulty}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                            title="Hapus Soal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TAMBAH SOAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-indigo-600" />
                  Tambah Soal Baru ke Bank Soal
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Pelajaran (Lesson):</label>
                  <select
                    value={formLessonId}
                    onChange={(e) => setFormLessonId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800"
                  >
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Materi (Skill):</label>
                  <select
                    value={formSkillId}
                    onChange={(e) => setFormSkillId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800"
                  >
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Tipe Soal:</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="multiple_choice">Pilihan Ganda</option>
                      <option value="fill_blank">Isian Singkat</option>
                      <option value="word_order">Susun Kata</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Tingkat Kesulitan (1 - 5):</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Pertanyaan / Instruksi (Prompt):</label>
                  <input
                    type="text"
                    required
                    placeholder="mis. Lengkapi kalimat: She _____ to school."
                    value={formPrompt}
                    onChange={(e) => setFormPrompt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Kunci Jawaban Benar:</label>
                  <input
                    type="text"
                    required
                    placeholder="mis. goes"
                    value={formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                {formType === 'multiple_choice' && (
                  <div>
                    <label className="font-bold block mb-1">Pilihan Jawaban (pisahkan koma):</label>
                    <input
                      type="text"
                      value={formOptions}
                      onChange={(e) => setFormOptions(e.target.value)}
                      placeholder="mis. go, goes, going, went"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold block mb-1">Penjelasan Kaidah / Solusi:</label>
                  <textarea
                    required
                    rows={2}
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Penjelasan ringkas kaidah tata bahasa..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl px-4 py-2 font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 font-bold text-white shadow-sm"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Soal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
