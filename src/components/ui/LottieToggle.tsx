'use client';

import React, { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';

interface LottieToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
}

export function LottieToggle({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  id,
}: LottieToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLottie() {
      if (!containerRef.current) return;
      const lottieModule = await import('lottie-web');
      const lottie = lottieModule.default || lottieModule;

      if (!isMounted || !containerRef.current) return;

      if (animRef.current) {
        animRef.current.destroy();
      }

      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/animations/toggle_switch.json',
      });

      anim.addEventListener('DOMLoaded', () => {
        if (!isMounted) return;
        // On initial load, jump directly to the target state without transition
        anim.goToAndStop(checked ? 180 : 60, true);
        isFirstRender.current = false;
      });

      animRef.current = anim;
    }

    loadLottie();

    return () => {
      isMounted = false;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Handle subsequent prop changes with smooth animation segments
  useEffect(() => {
    if (isFirstRender.current || !animRef.current) return;

    if (checked) {
      // Transition from OFF to ON: frames 120 -> 180
      animRef.current.playSegments([120, 180], true);
    } else {
      // Transition from ON to OFF: frames 0 -> 60
      animRef.current.playSegments([0, 60], true);
    }
  }, [checked]);

  function handleToggle() {
    if (disabled) return;
    onChange(!checked);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#101C27] border border-[#1A2E40] transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600'
      }`}
    >
      {(label || description) && (
        <div className="flex-1 select-none pr-2">
          {label && (
            <label
              htmlFor={id}
              onClick={handleToggle}
              className={`text-xs font-bold text-white block ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`relative w-[68px] h-[50px] shrink-0 overflow-hidden rounded-2xl p-0 border-0 bg-transparent flex items-center justify-center transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        title={checked ? 'Matikan' : 'Aktifkan'}
      >
        <div
          ref={containerRef}
          className="w-[90px] h-[66px] -my-2 -mx-2 pointer-events-none flex items-center justify-center scale-95"
        />
      </button>
    </div>
  );
}
