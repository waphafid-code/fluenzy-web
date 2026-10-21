'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const isLogin = mode === 'login';

  // Handle Submit Form (Email + Password)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setNeedsEmailConfirmation(false);
    setIsLoading(true);

    try {
      if (isLogin) {
        // 1. Proses Login
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email atau kata sandi yang Anda masukkan salah.');
          } else if (error.message.includes('Email not confirmed')) {
            setNeedsEmailConfirmation(true);
            throw new Error('Email Anda belum dikonfirmasi. Silakan periksa kotak masuk email Anda.');
          }
          throw error;
        }

        router.push('/dashboard');
        router.refresh();
      } else {
        // 2. Proses Registrasi
        if (!fullName.trim()) {
          throw new Error('Nama lengkap wajib diisi.');
        }
        if (password.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                fullName.trim()
              )}`,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('Email ini sudah terdaftar. Silakan masuk.');
          }
          throw error;
        }

        // Cek apakah Supabase mewajibkan konfirmasi email
        if (data?.user && !data.session) {
          setNeedsEmailConfirmation(true);
          setSuccessMessage(
            'Pendaftaran berhasil! Akun Anda telah siap. Silakan masuk menggunakan email dan kata sandi Anda.'
          );
        } else {
          setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Login dengan Google OAuth via Supabase
  async function handleGoogleSignIn() {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memulai login dengan Google.');
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-[#1E374D] bg-[#0E1722]/95 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black">
            🎙️
          </div>
          <span className="text-sm font-black tracking-wider text-emerald-400 uppercase">
            Fluenzy Pronounce
          </span>
        </div>
        <CardTitle className="text-2xl font-black text-white">
          {isLogin ? 'Masuk ke Akun Anda' : 'Mulai Latihan Pelafalan'}
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          {isLogin
            ? 'Lanjutkan latihan berbicara & perbaiki aksen bahasa Inggris Anda'
            : 'Daftar gratis dan dapatkan analisis fonem kata demi kata secara instan'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Pesan Error */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Pesan Sukses / Cek Email */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Tombol Login Google OAuth */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-2.5 h-11 text-xs font-bold border-[#1E374D] bg-[#142433] hover:bg-[#1A2E40] text-white transition shadow-sm"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{isLogin ? 'Masuk dengan Google' : 'Daftar dengan Google'}</span>
        </Button>

        {/* Pembatas ATAU */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#1E374D] w-full" />
          <span className="bg-[#0E1722] px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider relative">
            atau gunakan email
          </span>
        </div>

        {/* Form Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Misal: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Alamat Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Sandi</Label>
              {isLogin && (
                <span className="text-[11px] text-slate-400 hover:text-emerald-400 transition cursor-pointer">
                  Lupa sandi?
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 font-black mt-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Masuk Sekarang' : 'Buat Akun Gratis'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Switch Mode Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-[#1E374D]/60">
          {isLogin ? (
            <p>
              Belum punya akun?{' '}
              <Link href="/register" className="font-bold text-emerald-400 hover:underline">
                Daftar sekarang
              </Link>
            </p>
          ) : (
            <p>
              Sudah memiliki akun?{' '}
              <Link href="/login" className="font-bold text-emerald-400 hover:underline">
                Masuk di sini
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
