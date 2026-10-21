import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email') || 'budi@fluenzy.id';

    let user = await prisma.user.findFirst({
      where: { email: userEmail },
    });
    if (!user) {
      user = await prisma.user.findFirst();
    }
    if (!user) {
      return NextResponse.json({ totalMistakes: 0, skills: [] });
    }

    // Ambil seluruh log jawaban salah
    const mistakeLogs = await prisma.answerLog.findMany({
      where: {
        userId: user.id,
        isCorrect: false,
      },
      include: {
        skill: true,
        question: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Kelompokkan per Skill dan per ErrorType
    const groupedBySkill: Record<
      string,
      {
        skillId: string;
        skillName: string;
        totalMistakes: number;
        byErrorType: Record<
          string,
          {
            errorType: string;
            items: {
              logId: string;
              questionId: string;
              prompt: string;
              userAnswer: string;
              correctAnswer: string;
              explanation: string;
              createdAt: Date;
            }[];
          }
        >;
      }
    > = {};

    for (const log of mistakeLogs) {
      const sId = log.skillId;
      const sName = log.skill.name;
      const eType = log.errorType || 'unknown';

      if (!groupedBySkill[sId]) {
        groupedBySkill[sId] = {
          skillId: sId,
          skillName: sName,
          totalMistakes: 0,
          byErrorType: {},
        };
      }

      groupedBySkill[sId].totalMistakes++;

      if (!groupedBySkill[sId].byErrorType[eType]) {
        groupedBySkill[sId].byErrorType[eType] = {
          errorType: eType,
          items: [],
        };
      }

      groupedBySkill[sId].byErrorType[eType].items.push({
        logId: log.id,
        questionId: log.questionId,
        prompt: log.question.prompt,
        userAnswer: log.userAnswer,
        correctAnswer: log.correctAnswer,
        explanation: log.question.explanation,
        createdAt: log.createdAt,
      });
    }

    return NextResponse.json({
      totalMistakes: mistakeLogs.length,
      skills: Object.values(groupedBySkill),
    });
  } catch (error) {
    console.error('Failed to fetch mistakes:', error);
    return NextResponse.json({ error: 'Gagal memuat rekapitulasi kesalahan' }, { status: 500 });
  }
}
