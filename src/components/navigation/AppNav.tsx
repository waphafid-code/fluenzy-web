'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, BarChart3, User } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Beranda', href: '/home', icon: Home },
  { name: 'Latihan', href: '/practice', icon: Mic },
  { name: 'Progres', href: '/progress', icon: BarChart3 },
  { name: 'Profil', href: '/profile', icon: User },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR NAVIGATION (md:flex) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#1E374D] bg-[#09111A] fixed top-0 bottom-0 left-0 p-5 z-40 justify-between">
        <div className="space-y-8">
          {/* Brand Logo */}
          <Link href="/home" className="flex items-center gap-2.5 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-lg font-black shadow-[0_0_15px_rgba(0,229,117,0.2)]">
              🎙️
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">Fluenzy AI</span>
              <span className="block text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                Pronunciation Lab
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,229,117,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-[#101C27]'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-3.5 rounded-xl bg-[#0E1722] border border-[#1E374D] text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Coach Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400">Analisis pelafalan real-time per kata & fonem.</p>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION (md:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[#1E374D] bg-[#09111A]/95 backdrop-blur-xl flex items-center justify-around py-2 px-3 md:hidden z-50">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all duration-150 ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
