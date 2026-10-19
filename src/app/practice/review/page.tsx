"use client";

import { useEffect, useState } from "react";
import SessionPlayer, { QuestionItem } from "@/components/SessionPlayer";

export default function ReviewPracticePage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session/questions?mode=review")
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
          Menyiapkan antrean Spaced Repetition...
        </div>
      </div>
    );
  }

  return (
    <SessionPlayer
      questions={questions}
      sessionType="review"
      title="Sesi Review Terjadwal"
      subtitle="Penguatan memori jangka panjang berbasis Spaced Repetition"
    />
  );
}