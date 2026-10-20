import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          {
            'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,229,117,0.3)]':
              variant === 'default',
            'bg-rose-500 text-white hover:bg-rose-600': variant === 'destructive',
            'border border-[#1E374D] bg-[#0E1722] hover:bg-[#152535] text-slate-200':
              variant === 'outline',
            'bg-[#1A2E40] text-slate-100 hover:bg-[#233D55]': variant === 'secondary',
            'hover:bg-[#152535] text-slate-300 hover:text-white': variant === 'ghost',
            'text-emerald-400 underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-11 px-5 py-2.5': size === 'default',
            'h-9 rounded-lg px-3 text-xs': size === 'sm',
            'h-12 rounded-2xl px-8 text-base': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
