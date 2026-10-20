import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Sparkles, ArrowRight, BookOpen, Volume2 } from 'lucide-react';

export const metadata = {
  title: 'Latihan - Fluenzy Pronounce AI',
};

export default function PracticePlaceholderPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Studio Latihan
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Latihan Berbicara & Pelafalan
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Modul perekaman audio dan integrasi AI penilaian pelafalan akan diaktifkan penuh pada Tahap 3.
        </p>
      </div>

      <Card className="border-[#1E374D] bg-[#0E1722] p-8 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          <Mic className="h-8 w-8" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-black text-white">Studio Rekam Siap Diintegrasikan</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pada tahap berikutnya, Anda akan dapat merekam suara, melihat visualizer gelombang suara,
            dan menerima umpan balik skor per kata (hijau/kuning/merah).
          </p>
        </div>
        <div className="pt-2">
          <Link href="/home">
            <Button variant="outline" className="text-xs font-bold">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
