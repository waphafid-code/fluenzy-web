import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { calculateSusScore } from '@/lib/core/sus';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimiter';

export async function GET() {
  try {
    const feedbacks = await prisma.susFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const totalCount = feedbacks.length;
    const avgScore =
      totalCount > 0
        ? Number(
            (
              feedbacks.reduce((acc, f) => acc + f.susScore, 0) / totalCount
            ).toFixed(1)
          )
        : 78.5; // Benchmark default

    return NextResponse.json({
      totalResponses: totalCount,
      averageScore: avgScore,
      feedbacks,
    });
  } catch (error) {
    console.error('Failed to get SUS feedback:', error);
    return NextResponse.json({ error: 'Gagal memuat evaluasi SUS' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // 1. Rate Limiting (15 per minute per IP)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 15, 60000);
  if (!rateLimit.isAllowed) {
    return NextResponse.json(
      { error: 'Batas pengiriman survei SUS terlampaui. Silakan coba sebentar lagi.' },
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
    return NextResponse.json({ error: 'Format JSON request tidak valid.' }, { status: 400 });
  }

  try {
    const { responses, feedbackText, userId } = body;

    if (!Array.isArray(responses) || responses.length !== 10) {
      return NextResponse.json(
        { error: 'Kuesioner SUS memerlukan tepat 10 jawaban.' },
        { status: 400 }
      );
    }

    // Sanitasi dan batasi setiap jawaban ke rentang 1 - 5
    const sanitizedResponses = responses.map((val) => {
      const parsed = Math.round(Number(val));
      return Number.isFinite(parsed) ? Math.max(1, Math.min(5, parsed)) : 3;
    });

    const susResult = calculateSusScore(sanitizedResponses);

    const safeFeedback =
      typeof feedbackText === 'string' ? feedbackText.trim().substring(0, 1000) : null;
    const safeUserId =
      typeof userId === 'string' && userId.trim() ? userId.trim().substring(0, 64) : null;

    const created = await prisma.susFeedback.create({
      data: {
        userId: safeUserId,
        responses: JSON.stringify(sanitizedResponses),
        susScore: susResult.score,
        feedback: safeFeedback,
      },
    });

    return NextResponse.json({
      success: true,
      id: created.id,
      score: susResult.score,
      grade: susResult.grade,
      adjectiveRating: susResult.adjectiveRating,
      isAboveAverage: susResult.isAboveAverage,
    });
  } catch (error) {
    console.error('Failed to submit SUS feedback:', error);
    return NextResponse.json({ error: 'Gagal mengirim evaluasi SUS' }, { status: 500 });
  }
}
