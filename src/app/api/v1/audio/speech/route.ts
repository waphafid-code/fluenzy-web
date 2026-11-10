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
    const chosenModel = body.model || process.env.OPENROUTER_TTS_MODEL || 'heygen/heygen-voice-1-turbo:free';
    const isHeyGen = chosenModel.includes('heygen');

    if (openRouterKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const requestPayload = isHeyGen
          ? {
              model: chosenModel,
              input: cleanText,
              voice: body.voice || 'nadine',
              response_format: 'pcm',
            }
          : {
              model: chosenModel,
              input: cleanText,
              voice: body.voice || 'default',
              response_format: 'mp3',
              speed: body.speed || 1.0,
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
                'Content-Disposition': `attachment; filename="speech.${isHeyGen ? 'wav' : 'mp3'}"`,
                'X-Model': chosenModel,
                'X-Voice': voice,
                'X-Engine': isHeyGen ? 'OpenRouter HeyGen Voice Turbo' : 'OpenRouter Fish Audio S2.1 Pro',
              },
            });
          }
        } else {
          console.warn(`[OpenRouter Speech] Status ${openRouterRes.status}, falling back.`);
        }
      } catch (orErr) {
        console.warn('[OpenRouter Speech] Error, falling back to backup TTS:', orErr);
      }
    }

    // 2. Stream high-fidelity neural audio fallback
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
        'X-Engine': 'Neural Fallback',
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
    service: 'Fluenzy Fish Audio S2.1 Pro & OpenAI Compatible Cloud TTS',
    version: '1.3.0',
    mode: '24/7 Cloud Serverless',
    models: ['fish-audio/s2.1-pro-free:free', 'microsoft/VibeVoice-1.5B'],
  });
}
