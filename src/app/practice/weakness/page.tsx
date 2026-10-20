'use client';

import React, { Suspense } from 'react';
import { SessionPlayer } from '@/components/SessionPlayer';

export default function WeaknessPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080E15] text-white p-6">
          <div className="text-center space-y-3">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-400">
              Menyiapkan latihan titik lemah...
            </p>
          </div>
        </div>
      }
    >
      <SessionPlayer
        mode="weakness"
        title="Latihan Titik Lemah (Bebas Risiko Hati)"
      />
    </Suspense>
  );
}
