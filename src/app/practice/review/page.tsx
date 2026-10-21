'use client';

import React, { Suspense } from 'react';
import { SessionPlayer } from '@/components/SessionPlayer';

export default function SpacedReviewPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080E15] text-white p-6">
          <div className="card-cyber p-8 text-center space-y-4 max-w-sm animate-fade-in-scale">
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,210,255,0.3)]">
              <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            </div>
            <h3 className="font-extrabold text-white text-base">Review Harian Leitner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Menyiapkan antrean kartu berulang berbasis interval memori otak...
            </p>
          </div>
        </div>
      }
    >
      <SessionPlayer
        mode="review"
        title="Review Harian (Sistem Kotak Leitner)"
      />
    </Suspense>
  );
}
