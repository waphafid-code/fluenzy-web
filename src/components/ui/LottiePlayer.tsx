'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';

export interface LottiePlayerProps {
  /** Path to JSON in /public, e.g. '/animations/mic_pulse.json' */
  animationPath?: string;
  /** Direct parsed Lottie JSON data */
  animationData?: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
  speed?: number;
}

export function LottiePlayer({
  animationPath,
  animationData,
  loop = true,
  autoplay = true,
  className = '',
  style,
  onComplete,
  speed = 1,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [data, setData] = useState<object | null>(animationData || null);

  // If path is provided, fetch JSON safely on client
  useEffect(() => {
    if (animationData) {
      setData(animationData);
      return;
    }

    if (!animationPath) return;

    let isMounted = true;
    fetch(animationPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${animationPath}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted) setData(json);
      })
      .catch((err) => {
        console.warn('[LottiePlayer] Error loading animation:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [animationPath, animationData]);

  // Load and play Lottie animation with dynamic import for SSR safety
  useEffect(() => {
    if (!containerRef.current || !data) return;

    let anim: AnimationItem | null = null;
    let isMounted = true;

    import('lottie-web').then((lottieModule) => {
      if (!isMounted || !containerRef.current) return;
      const lottie = lottieModule.default || lottieModule;

      // Clean up previous instance
      if (animRef.current) {
        animRef.current.destroy();
      }

      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop,
        autoplay,
        animationData: data,
      });

      if (speed !== 1) {
        anim.setSpeed(speed);
      }

      if (onComplete) {
        anim.addEventListener('complete', onComplete);
      }

      animRef.current = anim;
    });

    return () => {
      isMounted = false;
      if (anim) {
        anim.destroy();
      }
      animRef.current = null;
    };
  }, [data, loop, autoplay, speed, onComplete]);

  return <div ref={containerRef} className={className} style={style} />;
}
