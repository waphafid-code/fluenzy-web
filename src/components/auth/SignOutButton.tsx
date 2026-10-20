'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Gagal keluar:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center gap-2 text-xs font-bold px-4 py-2"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      <span>{isLoading ? 'Sedang Keluar...' : 'Keluar dari Akun'}</span>
    </Button>
  );
}
