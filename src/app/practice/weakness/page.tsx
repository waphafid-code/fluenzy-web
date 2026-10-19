"use client";

import { useEffect, useState } from "react";
import SessionPlayer, { QuestionItem } from "@/components/SessionPlayer";

export default function WeaknessPracticePage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session/questions?mode=weakness")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.questions || [];
        setQuestions(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
          Menganalisis topik prioritas dan memuat soal remediasi...
        </div>
      </div>
    );
  }

  return (
    <SessionPlayer
      questions={questions}
      sessionType="weakness"
      title="Remediasi Kompetensi Lemah"
      subtitle="Latihan terfokus pada aturan tata bahasa dengan tingkat kesalahan tertinggi"
    />
  );
}