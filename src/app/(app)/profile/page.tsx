import React, { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { Mail, Zap } from 'lucide-react';

export const metadata = {
  title: 'Profil - Fluenzy Pronounce AI',
};

async function ProfileContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single();

  const fullName = profile?.full_name || user?.user_metadata?.full_name || 'Pembelajar';
  const email = user?.email || '-';
  const level = profile?.level || 'A1';
  const xp = profile?.xp ?? 0;
  const placementDone = profile?.placement_done ? 'Sudah Selesai' : 'Belum Diambil';
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Akun & Preferensi
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Profil Pembelajar
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Informasi akun, tingkat kemahiran, dan pengaturan sesi Anda.
        </p>
      </div>

      {/* KARTU IDENTITAS */}
      <Card className="border-[#1E374D] bg-[#0E1722] p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-[0_0_20px_rgba(0,229,117,0.3)]">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-white">{fullName}</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              <span>{email}</span>
            </div>
            <div className="inline-block mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                Level {level}
              </span>
            </div>
          </div>
        </div>

        {/* METRIK RINCI */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1E374D]">
          <div className="p-3 rounded-xl bg-[#0A131C] border border-[#1E374D]">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total XP</div>
            <div className="text-lg font-black text-cyan-400 flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>{xp}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0A131C] border border-[#1E374D]">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Placement Test</div>
            <div className="text-xs font-bold text-white mt-1">{placementDone}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0A131C] border border-[#1E374D] col-span-2 sm:col-span-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Bergabung Sejak</div>
            <div className="text-xs font-bold text-white mt-1">{createdAt}</div>
          </div>
        </div>

        {/* KELUAR / LOGOUT */}
        <div className="pt-4 border-t border-[#1E374D] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Selesai latihan? Anda dapat keluar dari sesi kapan saja.
          </div>
          <SignOutButton />
        </div>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-6 text-slate-400 text-xs">
          Memuat data profil...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
