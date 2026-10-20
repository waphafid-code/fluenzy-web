import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppNav } from '@/components/navigation/AppNav';

async function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Hanya redirect jika konfigurasi Supabase aktif
  if (
    !user &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  ) {
    redirect('/login');
  }

  // Persiapan redirect ke placement test jika belum selesai
  /*
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile && !profile.placement_done) {
      redirect('/placement');
    }
  }
  */

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col md:flex-row">
      <AppNav />
      {/* Konten Utama Responsif (Desktop padding kiri 64 untuk sidebar, Mobile padding bawah untuk bottom nav) */}
      <div className="flex-1 md:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center p-6 text-slate-500 text-xs">
                Memeriksa sesi...
              </div>
            }
          >
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
