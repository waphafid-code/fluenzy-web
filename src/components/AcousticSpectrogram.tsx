'use client';

import React, { useEffect, useRef } from 'react';

interface AcousticSpectrogramProps {
  isRecording: boolean;
  accentColor?: string;
  height?: number;
  className?: string;
  analyserNode?: AnalyserNode | null;
}

export function AcousticSpectrogram({
  isRecording,
  accentColor = '#06B6D4',
  height = 64,
  className = '',
  analyserNode,
}: AcousticSpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 32;
      const barWidth = (canvas.width / barCount) * 0.65;
      const gap = (canvas.width / barCount) * 0.35;

      let dataArray: Uint8Array | null = null;
      if (analyserNode) {
        dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(dataArray as any);
      }

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isRecording) {
          if (dataArray && dataArray.length > 0) {
            const index = Math.floor((i / barCount) * dataArray.length);
            barHeight = Math.max(4, (dataArray[index] / 255) * (canvas.height - 8));
          } else {
            // Harmonic wave simulation
            const wave = Math.sin(time * 0.05 + i * 0.25) * 0.5 + 0.5;
            barHeight = 4 + wave * (canvas.height - 12);
          }
        }

        const x = i * (barWidth + gap) + gap / 2;
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(1, `${accentColor}44`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      time++;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRecording, accentColor, analyserNode]);

  return (
    <div className={`relative w-full rounded-2xl bg-[#081018] border border-[#1A2E40] p-2 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
}

