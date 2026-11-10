import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimiter';

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
  // 1. Rate limit guard (60 TTS calls per minute per IP)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 60, 60000);
  if (!rateLimit.isAllowed) {
    return NextResponse.json(
      { error: 'Batas kuota audio TTS terlampaui. Silakan tunggu sebentar.' },
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

  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text')?.trim();
    const langParam = searchParams.get('lang')?.trim() || 'en';
    let targetLang = 'en';
    const lLower = langParam.toLowerCase();

    if (lLower.startsWith('id') || lLower === 'indo') {
      targetLang = 'id';
    } else if (lLower.includes('gb') || lLower.includes('uk') || lLower.includes('british')) {
      targetLang = 'en-GB';
    } else if (lLower.includes('au') || lLower.includes('australia')) {
      targetLang = 'en-AU';
    } else {
      targetLang = 'en';
    }

    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    // Limit single-request text length for fast responsiveness
    const cleanText = text.replace(/[*#_~]/g, ' ').substring(0, 300).trim();

    function addWavHeader(pcmBuffer: Buffer, sampleRate = 44100, numChannels = 1, bitDepth = 16): Buffer {
      const byteRate = (sampleRate * numChannels * bitDepth) / 8;
      const blockAlign = (numChannels * bitDepth) / 8;
      const dataSize = pcmBuffer.length;
      const chunkSize = 36 + dataSize;
      const header = Buffer.alloc(44);

      header.write('RIFF', 0);
      header.writeUInt32LE(chunkSize, 4);
      header.write('WAVE', 8);
      header.write('fmt ', 12);
      header.writeUInt32LE(16, 16);
      header.writeUInt16LE(1, 20); // PCM
      header.writeUInt16LE(numChannels, 22);
      header.writeUInt32LE(sampleRate, 24);
      header.writeUInt32LE(byteRate, 28);
      header.writeUInt16LE(blockAlign, 32);
      header.writeUInt16LE(bitDepth, 34);
      header.write('data', 36);
      header.writeUInt32LE(dataSize, 40);

      return Buffer.concat([header, pcmBuffer]);
    }

    // 1. Prioritaskan Studio TTS via OpenRouter AI (HeyGen Voice Turbo atau Fish Audio)
    const openRouterKey = process.env.OPENROUTER_API_KEY || '';
    const openRouterModel = process.env.OPENROUTER_TTS_MODEL || 'heygen/heygen-voice-1-turbo:free';
    const isHeyGen = openRouterModel.includes('heygen');

    if (openRouterKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const requestPayload = isHeyGen
          ? {
              model: openRouterModel,
              input: cleanText,
              voice: 'nadine',
              response_format: 'pcm',
            }
          : {
              model: openRouterModel,
              input: cleanText,
              response_format: 'mp3',
            };

        const openRouterRes = await fetch('https://openrouter.ai/api/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterKey.trim()}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://fluenzy.app',
            'X-Title': 'Fluenzy AI English Learning',
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (openRouterRes.ok) {
          const rawBuffer = Buffer.from(await openRouterRes.arrayBuffer());
          if (rawBuffer.byteLength > 0) {
            const audioBuffer = isHeyGen ? addWavHeader(rawBuffer) : rawBuffer;
            return new Response(audioBuffer as unknown as BodyInit, {
              status: 200,
              headers: {
                'Content-Type': isHeyGen ? 'audio/wav' : 'audio/mpeg',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
                'Content-Disposition': `inline; filename="pronunciation.${isHeyGen ? 'wav' : 'mp3'}"`,
                'X-TTS-Engine': isHeyGen ? 'OpenRouter HeyGen Voice Turbo' : 'OpenRouter Fish Audio S2.1 Pro',
              },
            });
          }
        } else {
          console.warn(`[OpenRouter TTS] Returned status ${openRouterRes.status}. Falling back to standard neural TTS.`);
        }
      } catch (orErr) {
        console.warn('[OpenRouter TTS] Request error, falling back:', orErr);
      }
    }

    // 2. Jika Cloud TTS (Fish Audio via OpenRouter) tidak tersedia, jangan gunakan scraping tidak resmi
    // Kembalikan sinyal fallback agar browser menggunakan Web SpeechSynthesis berkecepatan tinggi & bebas kuota
    return NextResponse.json(
      {
        fallbackToLocal: true,
        message: 'Cloud TTS service unavailable. Delegating to native client SpeechSynthesis.',
      },
      {
        status: 503,
        headers: {
          'X-TTS-Engine': 'Local Browser SpeechSynthesis Fallback',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('[/api/tts] Error generating natural speech:', error);
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const text = (body.input || body.text || '').trim();
    const lang = body.lang || 'en';

    if (!text) {
      return NextResponse.json({ error: 'Missing text or input parameter' }, { status: 400 });
    }

    const url = new URL(request.url);
    url.searchParams.set('text', text);
    url.searchParams.set('lang', lang);

    return GET(new Request(url.toString(), { method: 'GET' }));
  } catch (err) {
    console.error('[/api/tts POST] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
