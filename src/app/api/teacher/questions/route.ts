import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        skill: true,
        lesson: { include: { unit: true } },
      },
      orderBy: { difficulty: 'asc' },
    });

    const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    const lessons = await prisma.lesson.findMany({ orderBy: { order: 'asc' } });

    return NextResponse.json({ questions, skills, lessons });
  } catch (error) {
    console.error('Failed to list questions for teacher:', error);
    return NextResponse.json({ error: 'Gagal memuat bank soal' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, skillId, type, difficulty, prompt, payload, explanation } = body;

    // Validasi field wajib
    if (!lessonId || !skillId || !type || !prompt || !payload || !explanation) {
      return NextResponse.json({ error: 'Semua kolom wajib diisi lengkap.' }, { status: 400 });
    }

    // Validasi format JSON payload sesuai tipe soal
    let parsedPayload: Record<string, unknown> = {};
    try {
      parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch {
      return NextResponse.json({ error: 'Payload harus berupa format JSON yang valid.' }, { status: 400 });
    }

    if (type === 'multiple_choice') {
      if (!Array.isArray(parsedPayload.options) || parsedPayload.options.length < 2) {
        return NextResponse.json({ error: 'Pilihan ganda memerlukan array options minimal 2 pilihan.' }, { status: 400 });
      }
      if (!parsedPayload.correctAnswer) {
        return NextResponse.json({ error: 'Pilihan ganda memerlukan correctAnswer.' }, { status: 400 });
      }
    } else if (type === 'word_order') {
      if (!Array.isArray(parsedPayload.tokens) || parsedPayload.tokens.length < 2) {
        return NextResponse.json({ error: 'Word order memerlukan array tokens minimal 2 kata.' }, { status: 400 });
      }
      if (!parsedPayload.correctAnswer) {
        return NextResponse.json({ error: 'Word order memerlukan correctAnswer.' }, { status: 400 });
      }
    } else if (type === 'fill_blank') {
      if (!parsedPayload.correctAnswer) {
        return NextResponse.json({ error: 'Isian singkat memerlukan correctAnswer.' }, { status: 400 });
      }
    }

    const created = await prisma.question.create({
      data: {
        lessonId,
        skillId,
        type,
        difficulty: Number(difficulty) || 1,
        prompt: prompt.trim(),
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
        explanation: explanation.trim(),
      },
      include: { skill: true, lesson: true },
    });

    return NextResponse.json({ success: true, question: created });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({ error: 'Gagal menambahkan soal baru' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID soal diperlukan.' }, { status: 400 });
    }

    // Hapus relasi anak terlebih dahulu
    await prisma.reviewSchedule.deleteMany({ where: { questionId: id } });
    await prisma.answerLog.deleteMany({ where: { questionId: id } });
    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete question:', error);
    return NextResponse.json({ error: 'Gagal menghapus soal' }, { status: 500 });
  }
}
