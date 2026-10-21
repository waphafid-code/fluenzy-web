import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data?.user?.email) {
        try {
          const email = data.user.email;
          const fullName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            email.split('@')[0] ||
            'Learner';

          await prisma.user.upsert({
            where: { email },
            update: { name: fullName },
            create: {
              email,
              name: fullName,
              passwordHash: 'oauth_managed_by_supabase',
              stats: {
                create: {
                  totalXp: 100,
                  hearts: 5,
                  currentStreak: 1,
                },
              },
            },
          });
        } catch (e) {
          console.error('Error syncing OAuth user to prisma:', e);
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
