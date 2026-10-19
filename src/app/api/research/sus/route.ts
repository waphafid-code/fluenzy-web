import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { calculateSusScore } from '@/lib/core/sus';

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
  try {
    const body = await request.json();
    const { responses, feedbackText, userId } = body;

    if (!Array.isArray(responses) || responses.length !== 10) {
      return NextResponse.json(
        { error: 'Kuesioner SUS memerlukan tepat 10 jawaban.' },
        { status: 400 }
      );
    }

    const susResult = calculateSusScore(responses);

    const created = await prisma.susFeedback.create({
      data: {
        userId: userId || null,
        responses: JSON.stringify(responses),
        susScore: susResult.score,
        feedback: feedbackText || null,
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
