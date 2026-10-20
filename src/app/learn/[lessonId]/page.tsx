'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { SessionPlayer } from '@/components/SessionPlayer';

function LessonContent() {
  const params = useParams();
  const lessonId = typeof params?.lessonId === 'string' ? params.lessonId : 'lesson-1';

  return (
    <SessionPlayer
      mode="lesson"
      lessonId={lessonId}
      title="Sesi Pelajaran Adaptif"
    />
  );
}

export default function LessonLearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080E15] text-white p-6">
          <div className="text-center space-y-3">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-400">
              Menyiapkan sesi belajar adaptif...
            </p>
          </div>
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
