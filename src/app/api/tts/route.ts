import { NextResponse } from 'next/server';

/**
 * API ROUTE: /api/tts
 * -------------------
 * Provides 24/7 cloud-hosted natural neural text-to-speech for Fluenzy.
 * Eliminates robotic browser synthesis by streaming human-quality audio.
 *
 * Query Parameters:
 *   - text: The sentence or word to pronounce
 *   - lang: 'en' | 'id' (default: 'en')
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text')?.trim();
    const lang = searchParams.get('lang')?.toLowerCase().startsWith('id') ? 'id' : 'en';

    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    // Limit single-request text length for fast responsiveness
    const cleanText = text.replace(/[*#_~]/g, ' ').substring(0, 300).trim();

    // High-fidelity natural neural voice stream (Google Neural TTS CDN)
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream TTS service responded with ${response.status}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Disposition': 'inline; filename="pronunciation.mp3"',
      },
    });
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('[/api/tts] Error generating natural speech:', error);
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}
