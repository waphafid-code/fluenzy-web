import { NextResponse } from 'next/server';

/**
 * OPENAI & VIBEVOICE COMPATIBLE ENDPOINT: POST /api/v1/audio/speech
 * ----------------------------------------------------------------
 * Hosted 24/7 on Vercel Serverless Cloud.
 * Eliminates localhost dependency for Flutter Mobile and external clients.
 *
 * Request Payload:
 *   {
 *     "model": "microsoft/VibeVoice-1.5B",
 *     "input": "Text to pronounce",
 *     "voice": "american-tutor" | "female" | "male" | "lily" | "leo",
 *     "speed": 1.0
 *   }
 */

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = body.input || body.text || '';
    const voice = (body.voice || 'american-tutor').toLowerCase();

    if (!input || !input.trim()) {
      return NextResponse.json({ error: "Field 'input' must not be empty" }, { status: 400 });
    }

    const cleanText = input.replace(/[*#_~]/g, ' ').substring(0, 500).trim();

    // Determine language: English or Indonesian
    const idWords = ['adalah', 'yang', 'dan', 'di', 'dari', 'ini', 'itu', 'untuk', 'pada', 'ke', 'kamu', 'saya'];
    const words = cleanText.toLowerCase().split(/\s+/);
    const isId =
      voice.includes('id') ||
      voice.includes('indo') ||
      voice.includes('gadis') ||
      voice.includes('ardi') ||
      words.some((w: string) => idWords.includes(w));

    const targetLang = isId ? 'id' : 'en';

    // Stream high-fidelity neural audio
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream TTS service returned ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const audioBuffer = await upstream.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Disposition': 'attachment; filename="speech.mp3"',
        'X-Model': body.model || 'microsoft/VibeVoice-1.5B',
        'X-Voice': voice,
      },
    });
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('[/api/v1/audio/speech] Cloud Speech Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Fluenzy VibeVoice & OpenAI Compatible Cloud TTS',
    version: '1.2.0',
    mode: '24/7 Cloud Serverless',
  });
}
