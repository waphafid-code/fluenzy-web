import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimiter';

export async function POST(request: Request) {
  // 1. Rate Limiter Guard (60 syncs/min per IP)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 60, 60000);
  if (!rateLimit.isAllowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded for progress sync. Please wait.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSec),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  try {
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : 'budi@fluenzy.id';
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : 'budi@fluenzy.id';

    // Bounding & type coercion untuk proteksi boundary whitebox
    const xp = Math.max(0, Math.min(1000000, Math.round(Number(body.xp) || 0)));
    const streak = Math.max(0, Math.min(10000, Math.round(Number(body.streak) || 0)));
    const gems = Math.max(0, Math.min(500000, Math.round(Number(body.gems) || 0)));
    const hearts = Math.max(0, Math.min(5, Math.round(Number(body.hearts ?? 5))));
    const audioSpeed = Math.max(0.5, Math.min(2.0, Number(body.audioSpeed) || 0.95));
    const targetAccent = ['us', 'uk', 'au'].includes(body.targetAccent) ? body.targetAccent : 'us';
    const voiceGender = ['male', 'female'].includes(body.voiceGender) ? body.voiceGender : 'male';
    const userId = typeof body.userId === 'string' && body.userId.trim() ? body.userId.trim() : undefined;
    const timestamp = body.timestamp;

    // 1. Temukan atau buat user
    let user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email },
      include: { stats: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: 'Learner',
          passwordHash: 'synced-account',
          stats: {
            create: {
              totalXp: xp,
              currentStreak: streak,
              gems,
              hearts,
            },
          },
        },
        include: { stats: true },
      });
    } else if (user.stats) {
      // 2. Terapkan strategi Last-Write-Wins (merge non-destructive)
      const currentStats = user.stats;
      await prisma.userStats.update({
        where: { id: currentStats.id },
        data: {
          totalXp: Math.max(currentStats.totalXp, xp),
          currentStreak: Math.max(currentStats.currentStreak, streak),
          gems: Math.max(currentStats.gems, gems),
          hearts: hearts ?? currentStats.hearts,
        },
      });
    }

    const updatedStats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      clientTimestamp: timestamp,
      stats: {
        totalXp: updatedStats?.totalXp ?? xp,
        currentStreak: updatedStats?.currentStreak ?? streak,
        gems: updatedStats?.gems ?? gems,
        hearts: updatedStats?.hearts ?? hearts,
        targetAccent,
        voiceGender,
        audioSpeed,
      },
    });
  } catch (error) {
    console.error('Error during progress sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'budi@fluenzy.id';

    const user = await prisma.user.findFirst({
      where: { email },
      include: { stats: true },
    });

    if (!user || !user.stats) {
      return NextResponse.json(
        { success: false, message: 'User stats not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: user.stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

