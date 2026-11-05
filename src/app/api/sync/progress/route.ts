import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      email = 'budi@fluenzy.id',
      xp = 0,
      streak = 0,
      gems = 0,
      hearts = 5,
      targetAccent = 'us',
      voiceGender = 'male',
      audioSpeed = 0.95,
      timestamp,
    } = body;

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
