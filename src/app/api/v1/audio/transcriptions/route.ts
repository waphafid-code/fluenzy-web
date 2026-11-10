import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimiter';

/**
 * API ROUTE: /api/v1/audio/transcriptions
 * ---------------------------------------
 * OpenAI/Whisper-compatible Speech-to-Text transcription endpoint.
 * Solves cross-browser STT limitations on iOS Safari and Firefox desktop.
 *
 * Payload: multipart/form-data
 *   - file: Audio file blob (webm, wav, m4a, mp3, ogg)
 *   - model: (optional, default 'whisper-large-v3')
 *   - language: (optional, default 'en')
 */

export async function POST(request: Request) {
  // 1. Rate Limiting Check (30 requests/min per IP)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 30, 60000);
  if (!rateLimit.isAllowed) {
    return NextResponse.json(
      { error: 'Batas kuota transkripsi audio terlampaui. Silakan tunggu sebentar.' },
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
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'File audio tidak ditemukan dalam request (multipart/form-data).' },
        { status: 400 }
      );
    }

    const audioBlob = file as Blob;

    // Boundary check: file size maximum 10 MB
    if (audioBlob.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file audio melebihi batas maksimum (10 MB).' },
        { status: 413 }
      );
    }

    const language = (formData.get('language') as string) || 'en';
    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey) {
      try {
        const groqFormData = new FormData();
        groqFormData.append('file', audioBlob, 'audio.wav');
        groqFormData.append('model', 'whisper-large-v3');
        groqFormData.append('language', language);
        groqFormData.append('response_format', 'json');

        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
          },
          body: groqFormData,
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          return NextResponse.json({
            text: data.text || '',
            model: 'whisper-large-v3',
            source: 'cloud-whisper',
          });
        }
      } catch (whisperErr) {
        console.warn('[Cloud Whisper] Failed, falling back:', whisperErr);
      }
    }

    // Fallback response bila tidak ada Cloud STT key
    return NextResponse.json({
      text: '',
      fallbackToBrowser: true,
      message: 'Cloud Whisper API key tidak terkonfigurasi. Delegasikan ke Web Speech API lokal.',
    });
  } catch (error) {
    console.error('Error in audio transcription API:', error);
    return NextResponse.json(
      { error: 'Gagal memproses transkripsi audio' },
      { status: 500 }
    );
  }
}

