import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Target, Flame } from 'lucide-react';

export const metadata = {
  title: 'Progres - Fluenzy Pronounce AI',
};

export default function ProgressPlaceholderPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Analitik & Pencapaian
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Progres Belajar & Fonem Lemah
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Grafik riwayat akurasi, radar fonem lemah, dan koleksi lencana prestasi Anda.
        </p>
      </div>

      <Card className="border-[#1E374D] bg-[#0E1722] p-8 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
          <BarChart3 className="h-8 w-8" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-black text-white">Dashboard Analitik Progres</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Halaman ini akan menampilkan evolusi akurasi pengucapan Anda dari waktu ke waktu dan
            daftar fonem yang paling membutuhkan perbaikan (Tahap 5).
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
