import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-tight">
              FL
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900">
              Fluenzy
            </span>
            <span className="hidden sm:inline-block text-xs font-mono uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
              Adaptive Engine
            </span>
          </div>

          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <Link href="/roadmap" className="hover:text-slate-900 transition-colors">
              Kurikulum
            </Link>
            <Link href="/teacher" className="hover:text-slate-900 transition-colors">
              Panel Pengajar
            </Link>
            <Link href="/research" className="hover:text-slate-900 transition-colors">
              Riset & SUS
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Buka Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Sistem Pembelajaran Bahasa Inggris Adaptif
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
            Penguasaan tata bahasa dan kosakata berbasis repetisi terjadwal.
          </h1>

          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
            Fluenzy mengidentifikasi pola kesalahan tata bahasa Anda secara presisi, mengatur interval pengulangan memori dengan algoritma Spaced Repetition, dan menyusun progres belajar harian selama 30 hari.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="btn-tactile-primary px-6 py-3 text-sm inline-flex items-center gap-2"
            >
              Mulai Belajar Sekarang
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/roadmap"
              className="btn-tactile-secondary px-6 py-3 text-sm"
            >
              Jelajahi Kurikulum 30 Hari
            </Link>
          </div>

          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-mono uppercase text-slate-500 mb-1">
                Algoritma
              </div>
              <div className="font-semibold text-sm text-slate-900">
                Spaced Repetition
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Penjadwalan ulang otomatis sebelum materi terlupa.
              </p>
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-slate-500 mb-1">
                Diagnostik
              </div>
              <div className="font-semibold text-sm text-slate-900">
                Error Classifier
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Deteksi spesifik kesalahan tense, preposisi, & sintaks.
              </p>
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-slate-500 mb-1">
                Metodologi
              </div>
              <div className="font-semibold text-sm text-slate-900">
                Mastery Tracking
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi penguasaan kompetensi secara kuantitatif.
              </p>
            </div>
          </div>
        </div>

        {/* Right Diagnostic Preview */}
        <div className="md:col-span-5">
          <div className="surface-card p-6 space-y-5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                  <Image
                    src="/mascot/mascot_boy_bust.png"
                    alt="Fluenzy Mascot"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase text-slate-400">
                    Simulasi Mesin Adaptif
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    Profil Penguasaan Kompetensi
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                Tersinkronisasi
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Retensi Memori Jangka Panjang
                </span>
                <span className="font-mono font-semibold text-slate-900 metric-value">
                  74.5%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: "74.5%" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-xs text-slate-500">Mode Review</div>
                <div className="text-lg font-bold text-slate-900 metric-value mt-0.5">
                  Interval Dinamis
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">
                  Prioritas memori kritis
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-xs text-slate-500">Mode Kelemahan</div>
                <div className="text-lg font-bold text-slate-900 metric-value mt-0.5">
                  Remediasi Fokus
                </div>
                <div className="text-[11px] text-amber-700 font-medium mt-1">
                  Umpan balik instan
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <span>Fluenzy Adaptive English Learning System</span>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/mistakes" className="hover:text-slate-900">
              Log Kesalahan
            </Link>
            <Link href="/teacher" className="hover:text-slate-900">
              Panel Pengajar
            </Link>
            <Link href="/research" className="hover:text-slate-900">
              Evaluasi SUS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
