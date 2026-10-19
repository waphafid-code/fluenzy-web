import { prisma } from '@/lib/db/prisma';

/**
 * EXPLAIN.TS - Modul Penjelasan AI Cerdas Berbasis LLM dengan Fallback & Caching
 *
 * FITUR UTAMA:
 * 1. Fallback Otomatis: Jika GEMINI_API_KEY tidak dikonfigurasi atau jaringan gagal,
 *    sistem secara mulus mengembalikan `question.explanation` bawaan.
 * 2. Caching di Database (Model AiExplanationCache):
 *    Mencegah pemanggilan berulang untuk pertanyaan dan jawaban yang sama, menghemat kuota dan latensi.
 * 3. Keamanan Kunci: Seluruh pemanggilan LLM berjalan di sisi server (Server-Side Only),
 *    tidak pernah mengekspos API key ke client.
 */

export interface ExplainMistakeInput {
  questionPrompt: string;
  userAnswer: string;
  correctAnswer: string;
  errorType?: string | null;
  defaultExplanation?: string;
}

export interface ExplainMistakeResult {
  explanation: string;
  source: 'ai_live' | 'ai_cache' | 'default_fallback';
}

function generateCacheKey(prompt: string, userAnswer: string): string {
  const normalized = `${prompt.trim().toLowerCase()}:::${userAnswer.trim().toLowerCase()}`;
  // Sederhanakan string key untuk indexing database
  return Buffer.from(normalized).toString('base64').slice(0, 190);
}

export async function explainMistake(input: ExplainMistakeInput): Promise<ExplainMistakeResult> {
  const defaultText =
    input.defaultExplanation ||
    `Jawaban yang tepat adalah "${input.correctAnswer}". Perhatikan struktur kalimat dan kaidah tata bahasanya.`;

  const cacheKey = generateCacheKey(input.questionPrompt, input.userAnswer);

  // 1. Periksa Cache di Database terlebih dahulu
  try {
    const cached = await prisma.aiExplanationCache.findUnique({
      where: { cacheKey },
    });
    if (cached) {
      return {
        explanation: cached.explanation,
        source: 'ai_cache',
      };
    }
  } catch {
    // Abaikan kegagalan baca cache dan lanjutkan
  }

  // 2. Evaluasi Ketersediaan API Key
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return {
      explanation: defaultText,
      source: 'default_fallback',
    };
  }

  // 3. Panggil Gemini API secara Server-Side
  try {
    const promptMessage = `
Kamu adalah guru bahasa Inggris yang ramah dan sabar untuk pelajar Indonesia (Fluenzy AI Coach).
Jelaskan kesalahan siswa secara ringkas dan mudah dipahami:
- Soal: "${input.questionPrompt}"
- Kunci Jawaban Benar: "${input.correctAnswer}"
- Jawaban Siswa: "${input.userAnswer}"
- Diagnosis Kesalahan: "${input.errorType || 'umum'}"

Instruksi output:
Tuliskan penjelasan dalam 2-3 kalimat bahasa Indonesia sederhana, jelaskan letak kesalahannya, dan sertakan 1 contoh kalimat benar. Hindari istilah linguistik rumit.
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6 detik timeout

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptMessage }] }],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiText) {
      throw new Error('Empty response from AI model');
    }

    // Simpan ke Cache Database
    try {
      await prisma.aiExplanationCache.create({
        data: {
          cacheKey,
          explanation: aiText,
        },
      });
    } catch {
      // Abaikan error duplicate key jika ada race condition
    }

    return {
      explanation: aiText,
      source: 'ai_live',
    };
  } catch (err) {
    console.warn('AI Explanation call failed, falling back to static explanation:', err);
    return {
      explanation: defaultText,
      source: 'default_fallback',
    };
  }
}
