"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import SessionPlayer, { QuestionItem } from "@/components/SessionPlayer";

function LearnLessonContent() {
  const params = useParams();
  const lessonId = String(params?.lessonId || "1");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [lessonTitle, setLessonTitle] = useState<string>(`Modul Pembelajaran #${lessonId}`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/session/questions?mode=lesson&lessonId=${encodeURIComponent(lessonId)}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.questions || [];
        setQuestions(list);
        if (data?.lessonTitle || data?.title) {
          setLessonTitle(data.lessonTitle || data.title);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
          Memuat soal modul pembelajaran...
        </div>
      </div>
    );
  }

  return (
    <SessionPlayer
      questions={questions}
      sessionType="lesson"
      title={lessonTitle}
      subtitle={`Kurikulum Terstruktur — Modul ${lessonId}`}
      lessonId={lessonId}
    />
  );
}

export default function LearnLessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Memuat modul pembelajaran...
          </div>
        </div>
      }
    >
      <LearnLessonContent />
    </Suspense>
  );
}
