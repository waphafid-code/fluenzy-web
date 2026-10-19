"use client";

import Image from "next/image";

interface StandingMascotProps {
  variant?: "boy" | "girl";
  pose?: "standing" | "bust";
  message?: string;
  label?: string;
  className?: string;
}

export default function StandingMascot({
  variant = "boy",
  pose = "standing",
  message,
  label = "Asisten Diagnostik",
  className = "",
}: StandingMascotProps) {
  const imageSrc =
    pose === "bust"
      ? variant === "girl"
        ? "/mascot/mascot_girl_bust.png"
        : "/mascot/mascot_boy_bust.png"
      : variant === "girl"
      ? "/mascot/mascot_girl_standing_transparent.png"
      : "/mascot/mascot_boy_standing_transparent.png";

  return (
    <div className={`surface-card p-4 flex items-center gap-4 ${className}`}>
      <div className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
        <Image
          src={imageSrc}
          alt={label}
          width={56}
          height={56}
          className="object-contain w-full h-full"
        />
      </div>
      <div className="space-y-0.5 min-w-0">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          {label}
        </div>
        {message ? (
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {message}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-slate-600">
            Sistem siap menyesuaikan tingkat kesulitan soal berdasarkan respons Anda.
          </p>
        )}
      </div>
    </div>
  );
}
